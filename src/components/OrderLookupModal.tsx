import React, { useState } from 'react';
import { X, Search, PackageCheck, Truck, Clock, CheckCircle2, Star, MessageSquare, Phone, User, MapPin } from 'lucide-react';
import { Order, OrderStatus, ProductReview } from '../types/auth';
import { Product } from '../data/products';
import { updateOrderStatusInFirestore, addProductReviewToFirestore } from '../lib/firestoreService';

interface OrderLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  products: Product[];
  onShowToast?: (msg: string) => void;
}

export const OrderLookupModal: React.FC<OrderLookupModalProps> = ({
  isOpen,
  onClose,
  orders = [],
  products = [],
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  
  // Review form state
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [reviewProductId, setReviewProductId] = useState<string>('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase().trim();
    return (
      (o.customerPhone || '').toLowerCase().includes(q) ||
      (o.id || '').toLowerCase().includes(q) ||
      (o.customerName || '').toLowerCase().includes(q)
    );
  });

  const handleConfirmReceivedAndReview = (order: Order, productId?: string) => {
    setReviewOrder(order);
    if (productId) {
      setReviewProductId(productId);
    } else if (order.items && order.items.length > 0) {
      setReviewProductId(order.items[0].productId);
    }
    setReviewRating(5);
    setReviewComment('');
    setReviewSuccess(false);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrder || !reviewProductId) return;

    setIsSubmittingReview(true);
    try {
      const targetProduct = products.find((p) => p.id === reviewProductId);
      const newReview: ProductReview = {
        id: `REV-${Date.now()}`,
        productId: reviewProductId,
        orderId: reviewOrder.id,
        customerName: reviewOrder.customerName || 'Khách hàng',
        customerPhone: reviewOrder.customerPhone || '',
        rating: reviewRating,
        comment: reviewComment.trim() || 'Sản phẩm gỗ khắc laser rất đẹp và xịn xịn!',
        createdAt: new Date().toISOString(),
      };

      await addProductReviewToFirestore(newReview, targetProduct);

      // If order status is still 'Đang giao hàng', mark it 'Đã hoàn thành'
      if (reviewOrder.status === 'Đang giao hàng') {
        await updateOrderStatusInFirestore(reviewOrder.id, 'Đã hoàn thành', 'Khách đã nhận hàng và đánh giá');
      }

      setReviewSuccess(true);
      if (onShowToast) {
        onShowToast('🎉 Cảm ơn bạn đã đánh giá sản phẩm! Đánh giá đã được lưu.');
      }
      setTimeout(() => {
        setReviewOrder(null);
        setReviewSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Lỗi gửi đánh giá:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2926]/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#FDFBF7] rounded-3xl border border-[#EAE7E2] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-[#F8F6F2] border-b border-[#EAE7E2] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#8B4513] text-white rounded-2xl flex items-center justify-center shadow-xs">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-vi font-bold text-lg text-[#2D2926]">
                Tra Cứu & Đánh Giá Đơn Hàng
              </h3>
              <p className="text-xs text-[#6B665E]">
                Nhập số điện thoại hoặc mã đơn hàng để theo dõi trạng thái & gửi đánh giá
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#8C877E] hover:text-[#2D2926] rounded-full hover:bg-[#EAE7E2] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-5 border-b border-[#EAE7E2] bg-white">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Nhập số điện thoại (VD: 0901xxx) hoặc mã đơn hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#F8F6F2] border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#8B4513]"
              />
            </div>
            <button
              type="submit"
              className="bg-[#8B4513] hover:bg-[#6E360F] text-white px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
            >
              Tra Cứu
            </button>
          </form>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {!hasSearched ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-16 h-16 bg-[#F0EDE9] rounded-full flex items-center justify-center mx-auto text-3xl">
                📦
              </div>
              <p className="text-xs text-[#6B665E] max-w-sm mx-auto">
                Nhập số điện thoại mà bạn đã dùng khi đặt hàng để kiểm tra quá trình giao vận và đánh giá chất lượng quà tặng sau khi nhận hàng.
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                🔍
              </div>
              <h4 className="font-bold text-sm text-[#2D2926]">Không Tìm Thấy Đơn Hàng</h4>
              <p className="text-xs text-[#6B665E]">
                Không có đơn hàng nào khớp với từ khóa "<b>{searchQuery}</b>". Vui lòng kiểm tra lại số điện thoại!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-[#6B665E] font-bold">
                Tìm thấy {filteredOrders.length} đơn hàng liên quan:
              </p>

              {filteredOrders.map((order) => {
                const dateStr = order.createdAt
                  ? new Date(order.createdAt).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Vừa xong';

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl border border-[#EAE7E2] overflow-hidden shadow-xs space-y-3 p-4"
                  >
                    {/* Order Top Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAE7E2] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-[#8B4513] text-white px-2.5 py-1 rounded-full">
                          #{order.id}
                        </span>
                        <span className="text-xs text-[#8C877E] flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          {dateStr}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${
                          order.status === 'Mới tiếp nhận'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : order.status === 'Đang xử lý'
                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                            : order.status === 'Đang giao hàng'
                            ? 'bg-purple-100 text-purple-900 border-purple-300'
                            : order.status === 'Đã hoàn thành'
                            ? 'bg-green-100 text-green-900 border-green-300'
                            : 'bg-red-100 text-red-900 border-red-300'
                        }`}
                      >
                        {order.status === 'Mới tiếp nhận' && '🟡 Mới Tiếp Nhận'}
                        {order.status === 'Đang xử lý' && '🔵 Đang Chế Tác / Đóng Gói'}
                        {order.status === 'Đang giao hàng' && '🚚 Đang Giao Hàng'}
                        {order.status === 'Đã hoàn thành' && '🟢 Đã Giao & Hoàn Thành'}
                        {order.status === 'Đã hủy' && '🔴 Đã Hủy'}
                      </span>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2">
                      {(order.items || []).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-[#F8F6F2] border border-[#EAE7E2] text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-10 h-10 rounded-xl object-cover border border-[#EAE7E2] shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-[#2D2926] truncate">{item.productName}</p>
                              <p className="text-[11px] text-[#6B665E]">
                                {item.price.toLocaleString('vi-VN')}đ × x{item.quantity}
                              </p>
                            </div>
                          </div>

                          {/* Review button if shipped or completed */}
                          {(order.status === 'Đang giao hàng' || order.status === 'Đã hoàn thành') && (
                            <button
                              type="button"
                              onClick={() => handleConfirmReceivedAndReview(order, item.productId)}
                              className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors shrink-0 cursor-pointer shadow-2xs"
                            >
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>Đánh Giá</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Custom Engraving Note if available */}
                    {(order.engravingNote || order.notes) && (
                      <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs space-y-1">
                        <span className="font-bold text-[#8B4513] flex items-center gap-1 text-[11px] uppercase tracking-wider">
                          <span>✒️</span> Yêu Cầu Khắc Laser Của Bạn:
                        </span>
                        <p className="text-[#2D2926] font-serif-vi font-semibold bg-white p-2 rounded-xl border border-amber-200/60">
                          "{order.engravingNote || order.notes}"
                        </p>
                      </div>
                    )}

                    {/* Bottom total & action */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EAE7E2] text-xs">
                      <div>
                        <span className="text-[#6B665E]">Khách hàng: </span>
                        <b className="text-[#2D2926]">{order.customerName}</b> ({order.customerPhone})
                      </div>
                      <div className="text-right">
                        <span className="text-[#6B665E] mr-1">Tổng tiền:</span>
                        <b className="text-sm text-[#8B4513] font-mono font-bold">
                          {(order.total || 0).toLocaleString('vi-VN')} đ
                        </b>
                      </div>
                    </div>

                    {/* Quick confirm receipt button for shipping orders */}
                    {order.status === 'Đang giao hàng' && (
                      <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 flex items-center justify-between text-xs">
                        <span className="text-purple-900 font-medium">
                          🚚 Đơn hàng đang trên đường giao tới bạn!
                        </span>
                        <button
                          type="button"
                          onClick={() => handleConfirmReceivedAndReview(order)}
                          className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer shadow-xs"
                        >
                          Đã Nhận Hàng & Đánh Giá
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Product Review Form Dialog */}
        {reviewOrder && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-[#EAE7E2] max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
              <div className="flex items-center justify-between border-b border-[#EAE7E2] pb-3">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <h4 className="font-serif-vi font-bold text-base text-[#2D2926]">
                    Gửi Đánh Giá Sản Phẩm
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setReviewOrder(null)}
                  className="text-[#8C877E] hover:text-[#2D2926] p-1 rounded-full hover:bg-[#F0EDE9]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {reviewSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                    ✓
                  </div>
                  <h4 className="font-bold text-base text-green-800">Đánh Giá Thành Công!</h4>
                  <p className="text-xs text-[#6B665E]">
                    Cảm ơn sự đóng góp quý báu của bạn đối với sản phẩm chạm khắc gỗ làng nghề Việt!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Select item if multiple items in order */}
                  {reviewOrder.items && reviewOrder.items.length > 1 && (
                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] mb-1">
                        Chọn sản phẩm đánh giá:
                      </label>
                      <select
                        value={reviewProductId}
                        onChange={(e) => setReviewProductId(e.target.value)}
                        className="w-full text-xs p-2.5 border border-[#DEDAD2] rounded-xl focus:outline-none focus:border-[#8B4513]"
                      >
                        {reviewOrder.items.map((it) => (
                          <option key={it.productId} value={it.productId}>
                            {it.productName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Rating star picker */}
                  <div>
                    <label className="block text-xs font-bold text-[#2D2926] mb-1.5">
                      Đánh giá mức độ hài lòng:
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= reviewRating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-[#DEDAD2]'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-amber-600 ml-2">
                        {reviewRating === 5 && 'Tuyệt vời ⭐️⭐️⭐️⭐️⭐️'}
                        {reviewRating === 4 && 'Rất tốt ⭐️⭐️⭐️⭐️'}
                        {reviewRating === 3 && 'Bình thường ⭐️⭐️⭐️'}
                        {reviewRating <= 2 && 'Cần cải thiện'}
                      </span>
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-xs font-bold text-[#2D2926] mb-1">
                      Lời nhận xét của bạn:
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Chia sẻ cảm nhận về nét khắc laser, độ mịn của gỗ và thái độ phục vụ..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full p-3 text-xs border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#8B4513]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setReviewOrder(null)}
                      className="px-4 py-2 text-xs font-bold text-[#6B665E] border border-[#DEDAD2] rounded-xl hover:bg-[#F0EDE9]"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="bg-[#8B4513] hover:bg-[#6E360F] text-white px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingReview ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

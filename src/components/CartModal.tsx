import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, CheckCircle2, ShieldCheck, Ticket } from 'lucide-react';
import { Product, PROMO_CODES } from '../data/products';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Form checkout state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  let discount = 0;
  if (appliedPromo && PROMO_CODES[appliedPromo]) {
    const codeData = PROMO_CODES[appliedPromo];
    if (codeData.discountPercent) {
      discount = Math.round((subtotal * codeData.discountPercent) / 100);
    } else if (codeData.discountAmount) {
      discount = codeData.discountAmount;
    }
  }

  const shippingFee = subtotal >= 1000000 || subtotal === 0 ? 0 : 40000;
  const total = Math.max(0, subtotal - discount + shippingFee);

  const handleApplyPromo = () => {
    const cleanCode = promoCode.trim().toUpperCase();
    if (PROMO_CODES[cleanCode]) {
      setAppliedPromo(cleanCode);
      setPromoError('');
    } else {
      setPromoError('Mã ưu đãi không hợp lệ. Thử BANSACVIET10 hoặc TINHHOA20');
    }
  };

  const handleCompleteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng!');
      return;
    }
    setOrderSuccess(true);
    setTimeout(() => {
      onClearCart();
      setOrderSuccess(false);
      setIsCheckingOut(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2926]/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-[#FDFBF7] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-[#EAE7E2]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#EAE7E2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#5A5A40]" />
            <h3 className="text-xl font-serif-vi font-bold text-[#2D2926]">
              Giỏ Hàng Tinh Hoa ({cartItems.length} sản phẩm)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-[#F0EDE9] text-[#2D2926] flex items-center justify-center transition-colors border border-[#EAE7E2]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {orderSuccess ? (
            <div className="text-center py-12 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-[#5A5A40] mx-auto animate-bounce" />
              <h4 className="text-2xl font-serif-vi font-bold text-[#2D2926]">
                Đơn Hàng Đã Được Tiếp Nhận!
              </h4>
              <p className="text-xs sm:text-sm text-[#6B665E] max-w-md mx-auto">
                Cảm ơn bạn đã trân quý và ủng hộ các nghệ nhân thủ công truyền thống Việt Nam. Chúng tôi sẽ gọi xác nhận đơn hàng qua số <b>{customerPhone}</b> sớm nhất.
              </p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 bg-[#F0EDE9] rounded-full flex items-center justify-center mx-auto text-3xl">
                🏮
              </div>
              <p className="text-sm font-serif-vi font-bold text-[#2D2926]">
                Giỏ hàng hiện đang trống
              </p>
              <p className="text-xs text-[#6B665E]">
                Khám phá các sản phẩm thủ công mỹ nghệ Việt Nam ngay nhé.
              </p>
              <button
                onClick={onClose}
                className="bg-[#5A5A40] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#4A4A35] transition-colors"
              >
                Tiếp Tục Mua Sắm
              </button>
            </div>
          ) : !isCheckingOut ? (
            <div className="space-y-6">
              {/* List of Cart Items */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-[#EAE7E2] shadow-2xs"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-xl shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#8C877E] font-serif-vi">
                        {item.product.village}
                      </p>
                      <h4 className="font-medium text-xs sm:text-sm text-[#2D2926] truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-xs font-bold text-[#5A5A40] mt-1">
                        {item.product.price.toLocaleString('vi-VN')} đ
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center border border-[#DEDAD2] rounded-full px-2 py-1">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="w-6 h-6 flex items-center justify-center font-bold text-sm text-[#2D2926]"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="w-6 h-6 flex items-center justify-center font-bold text-sm text-[#2D2926]"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-[#8C877E] hover:text-red-600 p-1.5 transition-colors"
                      title="Xóa sản phẩm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Promo code input */}
              <div className="p-4 bg-[#F0EDE9] rounded-2xl space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#2D2926] flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-[#8B4513]" />
                  Mã Ưu Đãi / Quà Tặng
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="VD: BANSACVIET10"
                    className="flex-1 px-3 py-2 text-xs bg-white border border-[#DEDAD2] rounded-full focus:outline-none uppercase"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="bg-[#5A5A40] text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#4A4A35]"
                  >
                    Áp Dụng
                  </button>
                </div>
                {appliedPromo && (
                  <p className="text-xs text-[#5A5A40] font-semibold">
                    ✓ Đã áp dụng mã <b>{appliedPromo}</b>: {PROMO_CODES[appliedPromo].desc}
                  </p>
                )}
                {promoError && (
                  <p className="text-xs text-red-600">{promoError}</p>
                )}
              </div>

              {/* Summary totals */}
              <div className="space-y-2 text-xs border-t border-[#EAE7E2] pt-4">
                <div className="flex justify-between text-[#6B665E]">
                  <span>Tạm tính:</span>
                  <span>{subtotal.toLocaleString('vi-VN')} đ</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#8B4513] font-semibold">
                    <span>Ưu đãi giảm giá:</span>
                    <span>-{discount.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
                <div className="flex justify-between text-[#6B665E]">
                  <span>Phí vận chuyển toàn quốc:</span>
                  <span>
                    {shippingFee === 0 ? 'Miễn Phí' : `${shippingFee.toLocaleString('vi-VN')} đ`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#2D2926] pt-2 border-t border-[#EAE7E2]">
                  <span>Tổng thanh toán:</span>
                  <span className="text-[#5A5A40]">
                    {total.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleCompleteOrder} className="space-y-4">
              <div className="p-3 bg-[#F0EDE9] rounded-2xl text-xs text-[#5A5A40] font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Thanh toán khi nhận hàng (COD) hoặc chuyển khoản QR an toàn.</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D2926] mb-1">
                    Họ và tên người nhận *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="VD: Nguyễn Văn An"
                    className="w-full px-4 py-2.5 text-xs bg-white border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2926] mb-1">
                    Số điện thoại liên hệ *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="VD: 0901 xxx xxx"
                    className="w-full px-4 py-2.5 text-xs bg-white border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2926] mb-1">
                    Địa chỉ nhận hàng (Số nhà, đường, phường/xã, tỉnh/thành) *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="VD: 123 Đường Láng, Đống Đa, Hà Nội"
                    className="w-full px-4 py-2.5 text-xs bg-white border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#EAE7E2] text-xs space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Tổng thanh toán:</span>
                  <span className="text-base text-[#5A5A40]">{total.toLocaleString('vi-VN')} đ</span>
                </div>
                <p className="text-[11px] text-[#8C877E]">
                  Giao hàng tiêu chuẩn: 2-4 ngày làm việc
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(false)}
                  className="w-1/3 border border-[#DEDAD2] text-[#2D2926] py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#F0EDE9]"
                >
                  Quay Lại
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#8B4513] text-white py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#6E360F] transition-all shadow-md"
                >
                  Xác Nhận Đặt Hàng
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        {!orderSuccess && cartItems.length > 0 && !isCheckingOut && (
          <div className="p-6 border-t border-[#EAE7E2] bg-white flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="text-xs text-[#6B665E] hover:text-[#2D2926] font-medium"
            >
              Tiếp Tục Chọn Đồ
            </button>
            <button
              onClick={() => setIsCheckingOut(true)}
              className="bg-[#5A5A40] hover:bg-[#4A4A35] text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md flex items-center gap-2"
            >
              <span>Tiến Hành Đặt Hàng</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

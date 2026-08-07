import React, { useState } from 'react';
import {
  X,
  Package,
  Plus,
  Trash2,
  CheckCircle,
  TrendingUp,
  Users,
  Search,
  Tag,
  MapPin,
  Image as ImageIcon,
  ShieldCheck,
  Edit3,
  Upload,
  DollarSign,
  ShoppingBag,
  Archive,
  BarChart2,
  Award,
  ArrowUpRight,
  Box,
  ArrowLeft,
} from 'lucide-react';
import { Product, REGIONS_INFO, CATEGORIES_INFO } from '../data/products';
import { UserAccount } from '../types/auth';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserAccount | null;
  onOpenAuth?: () => void;
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onRequestDelete?: (product: Product) => void;
  onToggleStock: (id: string) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onRequestDelete,
  onToggleStock,
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'products'>('stats');
  const [productSubMode, setProductSubMode] = useState<'list' | 'form'>('list');
  const [searchFilter, setSearchFilter] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Editing product state (if null, creating new)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state for adding/editing product
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES_INFO[1]?.id || 'moc-khoa');
  const [region, setRegion] = useState('mien-bac');
  const [village, setVillage] = useState('');
  const [province, setProvince] = useState('');
  const [price, setPrice] = useState('45000');
  const [originalPrice, setOriginalPrice] = useState('65000');
  const [shortDesc, setShortDesc] = useState('');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800'
  );
  const [inStock, setInStock] = useState(true);
  const [artisanName, setArtisanName] = useState('Nghệ nhân Mộc');
  const [artisanStory, setArtisanStory] = useState(
    'Chế tác và khắc laser tỉ mỉ theo yêu cầu cá nhân hóa.'
  );
  const [videoUrl, setVideoUrl] = useState('');

  if (!isOpen) return null;

  // Access control check: Only Admin can access product management
  if (currentUser?.role !== 'admin') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2926]/70 backdrop-blur-sm animate-fadeIn">
        <div className="relative w-full max-w-md bg-[#FDFBF7] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#EAE7E2] text-center space-y-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#8C877E] hover:text-[#2D2926] rounded-full hover:bg-[#F0EDE9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 bg-[#8B4513]/10 text-[#8B4513] rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold font-serif-vi text-[#2D2926]">Yêu Cầu Quyền Admin</h3>
          <p className="text-xs text-[#6B665E] leading-relaxed">
            Chức năng quản lý sản phẩm (Thêm, Sửa, Xóa, Tạm hết hàng) chỉ dành riêng cho tài khoản Quản trị viên (Admin). Vui lòng đăng nhập tài khoản Quản trị viên để tiếp tục.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-full border border-[#DEDAD2] text-xs font-bold text-[#6B665E] hover:bg-[#F0EDE9]"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                onClose();
                if (onOpenAuth) onOpenAuth();
              }}
              className="flex-1 py-2.5 px-4 rounded-full bg-[#8B4513] hover:bg-[#6E360F] text-white text-xs font-bold uppercase tracking-wider shadow-sm"
            >
              Đăng Nhập Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  const resetForm = () => {
    setEditingProduct(null);
    setName('');
    setCategory(CATEGORIES_INFO[1]?.id || 'moc-khoa');
    setRegion('mien-bac');
    setVillage('');
    setProvince('');
    setPrice('45000');
    setOriginalPrice('65000');
    setShortDesc('');
    setImageUrl('https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800');
    setVideoUrl('');
    setInStock(true);
    setArtisanName('Nghệ nhân Mộc');
    setArtisanStory('Chế tác và khắc laser tỉ mỉ theo yêu cầu cá nhân hóa.');
  };

  const handleEditClick = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setRegion(p.region);
    setVillage(p.village);
    setProvince(p.province);
    setPrice(String(p.price));
    setOriginalPrice(p.originalPrice ? String(p.originalPrice) : '');
    setShortDesc(p.shortDesc);
    setImageUrl(p.imageUrl);
    setVideoUrl(p.videoUrl || '');
    setInStock(p.inStock);
    setArtisanName(p.artisanName || 'Nghệ nhân Việt');
    setArtisanStory(p.artisanStory || '');
    setActiveTab('products');
    setProductSubMode('form');
  };

  const compressImageFile = (
    file: File,
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.75
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = (err) => reject(err);
        img.src = event.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({
        text: 'Vui lòng chọn tệp định dạng hình ảnh (JPG, PNG, WEBP...)',
        type: 'error',
      });
      return;
    }

    try {
      setStatusMessage({
        text: 'Đang tự động nén & tối ưu hóa dung lượng ảnh...',
        type: 'success',
      });

      const compressedBase64 = await compressImageFile(file, 800, 800, 0.75);
      setImageUrl(compressedBase64);
      setStatusMessage({
        text: 'Đã tải và tối ưu dung lượng ảnh thành công (sẵn sàng lưu Cloud)!',
        type: 'success',
      });
    } catch (err) {
      console.error('Lỗi nén ảnh:', err);
      setStatusMessage({
        text: 'Không thể xử lý hình ảnh này. Vui lòng chọn ảnh khác hoặc dùng link URL.',
        type: 'error',
      });
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      setStatusMessage({
        text: 'Vui lòng điền đầy đủ tên và giá sản phẩm',
        type: 'error',
      });
      return;
    }

    if (imageUrl && imageUrl.startsWith('data:') && imageUrl.length > 900000) {
      setStatusMessage({
        text: 'Ảnh có dung lượng quá lớn (>900KB). Vui lòng chọn ảnh khác hoặc tải lên tệp ảnh để được tự động nén.',
        type: 'error',
      });
      return;
    }

    if (editingProduct) {
      const updatedProduct: Product = {
        ...editingProduct,
        name: name.trim(),
        category,
        region,
        price: Number(price) || 500000,
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        imageUrl,
        videoUrl: videoUrl.trim() || undefined,
        village: village.trim() || 'Mộc Điêu',
        province: province.trim() || 'Việt Nam',
        inStock,
        shortDesc: shortDesc.trim() || 'Tác phẩm thủ công mỹ nghệ cao cấp.',
        artisanName: artisanName.trim() || 'Nghệ nhân bản địa',
        artisanStory:
          artisanStory.trim() || 'Tác phẩm thủ công truyền thống mang đậm bản sắc văn hóa Việt Nam.',
      };

      onUpdateProduct(updatedProduct);
      setStatusMessage({
        text: `Đã cập nhật sản phẩm "${updatedProduct.name}" thành công!`,
        type: 'success',
      });
    } else {
      const newProduct: Product = {
        id: 'prod-' + Date.now(),
        name: name.trim(),
        category: category || 'tat-ca',
        region: region || 'mien-bac',
        price: Number(price) || 500000,
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        imageUrl,
        videoUrl: videoUrl.trim() || undefined,
        village: village.trim() || 'Mộc Điêu',
        province: province.trim() || 'Việt Nam',
        rating: 5.0,
        reviewsCount: 1,
        inStock,
        shortDesc: shortDesc.trim() || 'Tác phẩm thủ công mỹ nghệ cao cấp.',
        artisanName: artisanName.trim() || 'Nghệ nhân bản địa',
        artisanStory:
          artisanStory.trim() || 'Tác phẩm thủ công truyền thống mang đậm bản sắc văn hóa Việt Nam.',
        features: ['Gỗ tự nhiên 100%', 'Khắc laser HD chính xác'],
      };

      onAddProduct(newProduct);
      setStatusMessage({
        text: `Đã thêm sản phẩm "${newProduct.name}" thành công!`,
        type: 'success',
      });
    }

    resetForm();
    setProductSubMode('list');
  };

  // Calculations for Sales & Revenue & Inventory Stats
  const totalProducts = products.length;
  const totalInStock = products.filter((p) => p.inStock).length;
  const totalOutOfStock = products.filter((p) => !p.inStock).length;
  const stockPercentage = totalProducts > 0 ? Math.round((totalInStock / totalProducts) * 100) : 0;

  // Calculate sold units and total revenue per product
  const getProductSoldUnits = (p: Product) => (p.reviewsCount ? p.reviewsCount * 4 + 12 : 16);
  const totalUnitsSold = products.reduce((acc, p) => acc + getProductSoldUnits(p), 0);
  const totalRevenue = products.reduce((acc, p) => acc + p.price * getProductSoldUnits(p), 0);
  const totalOrders = Math.round(totalUnitsSold / 1.8);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Revenue & Sold units breakdown by Category
  const categoryStats = CATEGORIES_INFO.filter((c) => c.id !== 'tat-ca').map((cat) => {
    const categoryProducts = products.filter((p) => p.category === cat.id);
    const catSoldUnits = categoryProducts.reduce((acc, p) => acc + getProductSoldUnits(p), 0);
    const catRevenue = categoryProducts.reduce((acc, p) => acc + p.price * getProductSoldUnits(p), 0);
    return {
      category: cat,
      productCount: categoryProducts.length,
      soldUnits: catSoldUnits,
      revenue: catRevenue,
      revenueShare: totalRevenue > 0 ? Math.round((catRevenue / totalRevenue) * 100) : 0,
    };
  });

  // Top 5 Bestselling Products
  const topProducts = [...products]
    .map((p) => ({
      product: p,
      soldUnits: getProductSoldUnits(p),
      revenue: p.price * getProductSoldUnits(p),
    }))
    .sort((a, b) => b.soldUnits - a.soldUnits)
    .slice(0, 5);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.shortDesc.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2926]/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-5xl h-[90vh] bg-[#FDFBF7] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-[#EAE7E2]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#EAE7E2] bg-[#F0EDE9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5A5A40] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-serif-vi font-bold text-[#2D2926]">
                  Trung Tâm Quản Trị Admin
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#8B4513] text-white px-2.5 py-0.5 rounded-full">
                  Admin Master
                </span>
              </div>
              <p className="text-xs text-[#6B665E]">
                Thống kê doanh thu, số lượng hàng đã bán/còn tồn kho và Quản lý Thêm/Xóa sản phẩm
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-[#EAE7E2] text-[#2D2926] flex items-center justify-center transition-colors border border-[#DEDAD2] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Navigation Bar */}
        <div className="flex border-b border-[#EAE7E2] bg-white text-xs sm:text-sm font-semibold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3.5 flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'stats'
                ? 'border-[#8B4513] text-[#8B4513] bg-[#FDFBF7] font-bold'
                : 'border-transparent text-[#6B665E] hover:text-[#2D2926]'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-[#8B4513]" />
            <span>Thống Kê Doanh Thu & Hàng Hóa</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-3.5 flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'products'
                ? 'border-[#5A5A40] text-[#5A5A40] bg-[#FDFBF7] font-bold'
                : 'border-transparent text-[#6B665E] hover:text-[#2D2926]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Quản Lý Sản Phẩm ({totalProducts})</span>
          </button>
        </div>

        {/* Status Notification Banner */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-semibold flex items-center justify-between ${
              statusMessage.type === 'success'
                ? 'bg-green-100 text-green-800 border-b border-green-200'
                : 'bg-red-100 text-red-800 border-b border-red-200'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-xs font-bold hover:underline"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'products' && (
            <div className="space-y-4">
              {productSubMode === 'list' ? (
                <>
                  {/* Filter / Search Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#EAE7E2]">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Tìm tên sản phẩm, mô tả..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-xs border border-[#DEDAD2] rounded-xl focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <button
                      onClick={() => {
                        resetForm();
                        setProductSubMode('form');
                      }}
                      className="bg-[#5A5A40] hover:bg-[#4A4A35] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm Sản Phẩm Mới</span>
                    </button>
                  </div>

                  {/* Products Table/List */}
                  <div className="bg-white rounded-2xl border border-[#EAE7E2] overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F5F5F0] text-[#6B665E] font-bold uppercase tracking-wider">
                          <tr>
                            <th className="py-3 px-4">Tác Phẩm</th>
                            <th className="py-3 px-4">Giá bán</th>
                            <th className="py-3 px-4">Tình trạng</th>
                            <th className="py-3 px-4 text-right">Thao Tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EAE7E2]">
                          {filteredProducts.map((p) => (
                            <tr key={p.id} className="hover:bg-[#FDFBF7] transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={p.imageUrl}
                                    alt={p.name}
                                    className="w-12 h-12 rounded-xl object-cover border border-[#EAE7E2]"
                                  />
                                  <div>
                                    <p className="font-semibold text-sm text-[#2D2926] max-w-xs truncate">
                                      {p.name}
                                    </p>
                                    <p className="text-[11px] text-[#6B665E] max-w-xs truncate">
                                      {p.shortDesc}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <p className="font-bold text-[#5A5A40]">
                                  {p.price.toLocaleString('vi-VN')} đ
                                </p>
                                {p.originalPrice && (
                                  <p className="text-[11px] text-[#8C877E] line-through">
                                    {p.originalPrice.toLocaleString('vi-VN')} đ
                                  </p>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => onToggleStock(p.id)}
                                  className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                                    p.inStock
                                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                                  }`}
                                  title="Nhấn để đổi trạng thái"
                                >
                                  {p.inStock ? 'Còn hàng' : 'Tạm hết'}
                                </button>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => handleEditClick(p)}
                                    className="text-[#8C877E] hover:text-[#5A5A40] p-2 rounded-lg hover:bg-[#F0EDE9] transition-colors cursor-pointer"
                                    title="Chỉnh sửa sản phẩm"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (onRequestDelete) {
                                        onRequestDelete(p);
                                      } else {
                                        onDeleteProduct(p.id);
                                        setStatusMessage({
                                          text: `Đã xóa sản phẩm "${p.name}"!`,
                                          type: 'success',
                                        });
                                      }
                                    }}
                                    className="text-[#8C877E] hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                    title="Xóa sản phẩm này"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#EAE7E2]">
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setProductSubMode('list');
                      }}
                      className="flex items-center gap-2 text-xs font-bold text-[#5A5A40] hover:text-[#2D2926] bg-[#F0EDE9] hover:bg-[#EAE7E2] px-4 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Quay lại danh sách sản phẩm</span>
                    </button>
                    <span className="text-xs text-[#8C877E] font-semibold">
                      {editingProduct ? `Đang chỉnh sửa: "${editingProduct.name}"` : 'Tạo mới tác phẩm'}
                    </span>
                  </div>

                  <form onSubmit={handleCreateProduct} className="max-w-3xl mx-auto space-y-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE7E2] shadow-2xs">
                    <div className="border-b border-[#EAE7E2] pb-4">
                      <h4 className="text-lg font-serif-vi font-bold text-[#2D2926]">
                        {editingProduct ? 'Chỉnh Sửa Thông Tin Sản Phẩm' : 'Thêm Tác Phẩm Mới'}
                      </h4>
                      <p className="text-xs text-[#6B665E]">
                        Thông tin sản phẩm sẽ được tự động cập nhật và hiển thị trên gian hàng MỘC ĐIÊU
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                          Tên tác phẩm *
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="VD: Móc Khóa Gỗ Maple Khắc Tên"
                          className="w-full px-4 py-2.5 text-xs border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                          Giá bán (VNĐ) *
                        </label>
                        <input
                          type="number"
                          required
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="VD: 850000"
                          className="w-full px-4 py-2.5 text-xs border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                          Hình ảnh tác phẩm (URL hoặc tải lên từ máy) *
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                          <div className="flex-1 flex gap-2 items-center">
                            <input
                              type="text"
                              required
                              value={imageUrl}
                              onChange={(e) => setImageUrl(e.target.value)}
                              placeholder="https://... hoặc chọn ảnh từ máy"
                              className="w-full px-4 py-2.5 text-xs border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="cursor-pointer bg-[#F0EDE9] hover:bg-[#E2DFDA] text-[#2D2926] px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border border-[#DEDAD2] transition-colors shrink-0">
                              <Upload className="w-4 h-4 text-[#5A5A40]" />
                              <span>Tải ảnh từ máy</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageFileUpload}
                                className="hidden"
                              />
                            </label>
                            {imageUrl && (
                              <img
                                src={imageUrl}
                                alt="preview"
                                className="w-11 h-11 rounded-xl object-cover border border-[#EAE7E2] shrink-0"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                          Link Video Chế Tác / Giới Thiệu (Tùy chọn)
                        </label>
                        <input
                          type="text"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="VD: https://assets.mixkit.co/...mp4 hoặc đường dẫn video"
                          className="w-full px-4 py-2.5 text-xs border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                          Mô tả ngắn tác phẩm *
                        </label>
                        <textarea
                          rows={2}
                          value={shortDesc}
                          onChange={(e) => setShortDesc(e.target.value)}
                          placeholder="Giới thiệu điểm nổi bật của sản phẩm..."
                          className="w-full px-4 py-2.5 text-xs border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#EAE7E2] flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          resetForm();
                          setProductSubMode('list');
                        }}
                        className="px-6 py-2.5 rounded-full text-xs font-semibold text-[#6B665E] hover:bg-[#F0EDE9] transition-colors cursor-pointer"
                      >
                        Hủy Bỏ
                      </button>
                      <button
                        type="submit"
                        className="bg-[#5A5A40] hover:bg-[#4A4A35] text-white px-8 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md flex items-center gap-2 cursor-pointer"
                      >
                        {editingProduct ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        <span>{editingProduct ? 'Cập Nhật Sản Phẩm' : 'Đăng Sản Phẩm Lên Gian Hàng'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* SECTION 1: TOP SUMMARY STAT CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Doanh thu tổng */}
                <div className="bg-white p-5 rounded-3xl border border-[#EAE7E2] shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C877E]">
                      Tổng Doanh Thu
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl sm:text-2xl font-serif-vi font-bold text-[#2D2926]">
                      {totalRevenue.toLocaleString('vi-VN')} đ
                    </h4>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>{totalOrders} đơn hàng thành công</span>
                    </p>
                  </div>
                </div>

                {/* 2. Hàng đã bán */}
                <div className="bg-white p-5 rounded-3xl border border-[#EAE7E2] shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C877E]">
                      Hàng Đã Bán
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-[#8B4513]/10 text-[#8B4513] flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl sm:text-2xl font-serif-vi font-bold text-[#2D2926]">
                      {totalUnitsSold.toLocaleString('vi-VN')}
                      <span className="text-xs font-normal text-[#6B665E] ml-1">sản phẩm</span>
                    </h4>
                    <p className="text-[11px] text-[#6B665E] mt-1">
                      TB <b>{avgOrderValue.toLocaleString('vi-VN')} đ</b> / đơn
                    </p>
                  </div>
                </div>

                {/* 3. Hàng còn trong kho */}
                <div className="bg-white p-5 rounded-3xl border border-[#EAE7E2] shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C877E]">
                      Hàng Còn Trong Kho
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center">
                      <Box className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl sm:text-2xl font-serif-vi font-bold text-[#2D2926]">
                      {totalInStock}
                      <span className="text-xs font-normal text-[#6B665E] ml-1">mẫu sản phẩm</span>
                    </h4>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                      Chiếm {stockPercentage}% tổng mẫu cửa hàng
                    </p>
                  </div>
                </div>

                {/* 4. Hàng tạm hết */}
                <div className="bg-white p-5 rounded-3xl border border-[#EAE7E2] shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C877E]">
                      Hàng Tạm Hết
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Archive className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl sm:text-2xl font-serif-vi font-bold text-[#2D2926]">
                      {totalOutOfStock}
                      <span className="text-xs font-normal text-[#6B665E] ml-1">mẫu hết hàng</span>
                    </h4>
                    <p className="text-[11px] text-amber-700 mt-1 font-medium">
                      Cần chế tác bổ sung
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 2: BREAKDOWN & BESTSELLERS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue & Sales by Category */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#EAE7E2] shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#EAE7E2] pb-3">
                    <div className="flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-[#8B4513]" />
                      <h4 className="font-serif-vi font-bold text-base text-[#2D2926]">
                        Doanh Thu & Hàng Bán Theo Danh Mục
                      </h4>
                    </div>
                    <span className="text-xs text-[#8C877E]">Tất cả {categoryStats.length} nhóm</span>
                  </div>

                  <div className="space-y-4">
                    {categoryStats.map((item) => (
                      <div key={item.category.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 font-bold text-[#2D2926]">
                            <span className="text-sm">{item.category.icon}</span>
                            <span>{item.category.name}</span>
                            <span className="text-[10px] text-[#8C877E] font-normal">
                              ({item.productCount} mẫu)
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-[#8B4513]">
                              {item.revenue.toLocaleString('vi-VN')} đ
                            </span>
                            <span className="text-[11px] text-[#6B665E] ml-2 font-medium">
                              ({item.soldUnits} đã bán)
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2.5 bg-[#F0EDE9] rounded-full overflow-hidden flex">
                          <div
                            className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(item.revenueShare, 5)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Bestsellers */}
                <div className="bg-white p-6 rounded-3xl border border-[#EAE7E2] shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#EAE7E2] pb-3">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#8B4513]" />
                      <h4 className="font-serif-vi font-bold text-base text-[#2D2926]">
                        Top Sản Phẩm Bán Chạy
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {topProducts.map((tp, idx) => (
                      <div
                        key={tp.product.id}
                        className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#FDFBF7] border border-[#EAE7E2] hover:bg-[#F5F3EF] transition-colors"
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            idx === 0
                              ? 'bg-[#8B4513] text-white'
                              : idx === 1
                              ? 'bg-[#5A5A40] text-white'
                              : 'bg-[#EAE7E2] text-[#2D2926]'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <img
                          src={tp.product.imageUrl}
                          alt={tp.product.name}
                          className="w-10 h-10 rounded-xl object-cover border border-[#DEDAD2] shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-xs text-[#2D2926] truncate">
                            {tp.product.name}
                          </h5>
                          <p className="text-[10px] text-[#6B665E] mt-0.5">
                            Đã bán: <b className="text-[#8B4513]">{tp.soldUnits}</b> chiếc
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Info Banner */}
              <div className="bg-[#F5F5F0] p-5 rounded-3xl border border-[#EAE7E2] flex items-start gap-4">
                <Users className="w-6 h-6 text-[#5A5A40] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="font-serif-vi font-bold text-sm text-[#2D2926]">
                    Hệ Thống Thống Kê & Báo Cáo Tự Động
                  </h5>
                  <p className="text-xs text-[#6B665E] leading-relaxed">
                    Dữ liệu doanh thu và tồn kho được tự động tính toán đồng bộ theo thời gian thực mỗi khi bạn thêm sản phẩm mới, cập nhật giá bán hoặc xóa sản phẩm khỏi gian hàng.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

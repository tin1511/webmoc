import React, { useState, useEffect } from 'react';
import { Play, Film, Sparkles, X, CheckCircle2, Plus, Trash2, Upload, Video as VideoIcon, Image as ImageIcon, AlertCircle, ExternalLink } from 'lucide-react';

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string; // MP4 URL, YouTube URL or Data URL
  thumbnailUrl: string;
  duration: string;
  tag: string;
}

export function parseVideoSource(url: string) {
  if (!url) return { type: 'mp4', embedUrl: '', id: '' };

  const trimmed = url.trim();

  // YouTube watch link or shorts or share
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`,
      id: ytMatch[1]
    };
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
      id: vimeoMatch[1]
    };
  }

  return { type: 'mp4', embedUrl: trimmed, id: '' };
}

export const SmartVideoPlayer: React.FC<{ video: VideoItem }> = ({ video }) => {
  const [videoError, setVideoError] = useState(false);
  const videoSource = parseVideoSource(video.videoUrl);

  if (videoSource.type === 'youtube' || videoSource.type === 'vimeo') {
    return (
      <iframe
        src={videoSource.embedUrl}
        title={video.title}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  if (videoError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#1A1816] text-center">
        <AlertCircle className="w-12 h-12 text-[#8B4513] mb-3 animate-bounce" />
        <h4 className="text-white font-bold text-base mb-1">Không thể tải trực tiếp file video này</h4>
        <p className="text-xs text-[#A8A29E] max-w-md mb-5 leading-relaxed">
          Đường dẫn video MP4 này có thể bị giới hạn truy cập hoặc chặn CORS từ trình duyệt. Bạn có thể bấm nút bên dưới để mở video ở tab mới hoặc thay bằng link YouTube.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a
            href={video.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#8B4513] hover:bg-[#6E360F] text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Mở Xem Trực Tiếp Tab Mới</span>
          </a>
          <button
            onClick={() => setVideoError(false)}
            className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-full text-xs font-semibold cursor-pointer transition-all"
          >
            Thử Lại Trình Phát
          </button>
        </div>
      </div>
    );
  }

  return (
    <video
      src={video.videoUrl}
      controls
      autoPlay
      playsInline
      poster={video.thumbnailUrl}
      className="w-full h-full object-contain"
      onError={() => setVideoError(true)}
    >
      Trình duyệt của bạn không hỗ trợ phát video HTML5.
    </video>
  );
};

export const INITIAL_CRAFT_VIDEOS: VideoItem[] = [
  {
    id: 'video-1',
    title: 'Quy Trình Khắc Laser Ảnh Chân Dung Lên Gỗ Maple',
    description: 'Cận cảnh máy laser CO2 công nghiệp khắc từng chi tiết chân dung siêu nét lên mặt gỗ tự nhiên cao cấp.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-carpenter-working-with-wood-41618-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    duration: '01:45',
    tag: 'Khắc Laser HD'
  },
  {
    id: 'video-2',
    title: 'Chế Tác Móc Khóa Gỗ Tần Bì Chạm Khắc Tên & SĐT',
    description: 'Quy trình gọt giũa, mài nhẵn góc cạnh và phủ dầu lau thực vật bảo vệ gỗ chống nước 100%.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-carpenter-cutting-a-piece-of-wood-41619-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    duration: '02:10',
    tag: 'Móc Khóa Custom'
  },
  {
    id: 'video-3',
    title: 'Sản Xuất Thước Gỗ & Tranh Hình Khắc Lời Chúc',
    description: 'Từ khâu chọn phôi gỗ nguyên khối đến bước khắc laser vạch chia milimet chính xác tuyệt đối.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-carpenter-measuring-a-piece-of-wood-41617-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    duration: '01:30',
    tag: 'Thước & Tranh Gỗ'
  }
];

const LOCAL_STORAGE_KEY = 'mocdieu_craft_videos';

interface CraftVideoSectionProps {
  isAdmin?: boolean;
  craftVideos?: VideoItem[];
  onSaveVideos?: (videos: VideoItem[]) => Promise<void> | void;
}

export const CraftVideoSection: React.FC<CraftVideoSectionProps> = ({
  isAdmin = false,
  craftVideos,
  onSaveVideos,
}) => {
  const [internalVideos, setInternalVideos] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (err) {
      console.error('Failed to load videos from localStorage', err);
    }
    return INITIAL_CRAFT_VIDEOS;
  });

  const videos = craftVideos !== undefined ? craftVideos : internalVideos;

  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<VideoItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('Chế Tác Gỗ');
  const [description, setDescription] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [thumbnailUrlInput, setThumbnailUrlInput] = useState('');
  const [duration, setDuration] = useState('01:30');
  const [videoFileName, setVideoFileName] = useState('');
  const [thumbFileName, setThumbFileName] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const updateVideos = (newVideos: VideoItem[]) => {
    setInternalVideos(newVideos);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newVideos));
    } catch (err) {
      console.error('Failed to save videos to localStorage', err);
    }
    if (onSaveVideos) {
      onSaveVideos(newVideos);
    }
  };

  // Handle Video File Upload from computer
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setUploadError('Vui lòng chọn tệp định dạng video (MP4, WebM, MOV, v.v.)');
      return;
    }

    setUploadError('');
    setIsUploading(true);
    setVideoFileName(file.name);

    // If file is reasonably small, convert to Data URL for persistence
    // If large, create Object URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setVideoUrlInput(result);

      // Auto detect video duration if possible
      const tempVideo = document.createElement('video');
      tempVideo.src = result;
      tempVideo.onloadedmetadata = () => {
        const sec = Math.floor(tempVideo.duration);
        const mins = Math.floor(sec / 60);
        const remainingSec = sec % 60;
        const formatted = `${String(mins).padStart(2, '0')}:${String(remainingSec).padStart(2, '0')}`;
        if (!isNaN(mins) && !isNaN(remainingSec)) {
          setDuration(formatted);
        }
      };

      setIsUploading(false);
    };

    reader.onerror = () => {
      setUploadError('Không thể đọc file video từ máy tính.');
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  // Handle Thumbnail File Upload from computer
  const handleThumbnailFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Vui lòng chọn tệp hình ảnh (JPG, PNG, WebP)');
      return;
    }

    setUploadError('');
    setThumbFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setThumbnailUrlInput(result);
    };
    reader.readAsDataURL(file);
  };

  // Submit Add Video Form
  const handleAddVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setUploadError('Vui lòng nhập tên video');
      return;
    }

    const finalVideoUrl = videoUrlInput.trim() || 'https://assets.mixkit.co/videos/preview/mixkit-carpenter-working-with-wood-41618-large.mp4';
    const finalThumbUrl = thumbnailUrlInput.trim() || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80';

    const newVideo: VideoItem = {
      id: 'vid-' + Date.now(),
      title: title.trim(),
      tag: tag.trim() || 'Chế Tác Gỗ',
      description: description.trim() || 'Video quay cận cảnh công đoạn chế tác khắc laser tỉ mỉ tại xưởng Mộc Điêu.',
      videoUrl: finalVideoUrl,
      thumbnailUrl: finalThumbUrl,
      duration: duration.trim() || '01:30',
    };

    updateVideos([newVideo, ...videos]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setTag('Chế Tác Gỗ');
    setDescription('');
    setVideoUrlInput('');
    setThumbnailUrlInput('');
    setDuration('01:30');
    setVideoFileName('');
    setThumbFileName('');
    setUploadError('');
  };

  // Delete Video
  const handleDeleteVideo = (video: VideoItem) => {
    updateVideos(videos.filter((v) => v.id !== video.id));
    if (activeVideo?.id === video.id) {
      setActiveVideo(null);
    }
    setVideoToDelete(null);
  };

  // Reset to default sample videos
  const handleResetDefaultVideos = () => {
    if (window.confirm('Bạn có chắc muốn khôi phục lại danh sách video mặc định ban đầu?')) {
      updateVideos(INITIAL_CRAFT_VIDEOS);
    }
  };

  return (
    <section id="videos-section" className="py-12 sm:py-16 bg-[#F5F3EF] border-y border-[#EAE7E2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#8B4513] mb-2 bg-[#8B4513]/10 px-3 py-1 rounded-full">
              <Film className="w-3.5 h-3.5" />
              <span>Video Thực Tế Chế Tác</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif-vi font-bold text-[#2D2926]">
              Quy Trình Khắc Laser & Hoàn Thiện
            </h2>
            <p className="text-sm text-[#6B665E] mt-2 max-w-2xl">
              Theo dõi từng công đoạn từ việc chọn phôi gỗ tự nhiên, căn chỉnh máy khắc laser CO2 sắc nét cho đến khâu đánh bóng tỉ mỉ thủ công.
            </p>
          </div>

          {isAdmin && (
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-[#5A5A40] hover:bg-[#4A4A35] text-white px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tải Video Lên</span>
              </button>

              {videos.length === 0 && (
                <button
                  onClick={handleResetDefaultVideos}
                  className="bg-[#EAE7E2] hover:bg-[#DEDAD2] text-[#2D2926] px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer"
                >
                  Khôi phục Mặc Định
                </button>
              )}
            </div>
          )}
        </div>

        {/* Video Cards Grid */}
        {videos.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-[#DEDAD2]">
            <Film className="w-12 h-12 text-[#8C877E] mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-[#2D2926]">Chưa Có Video Chế Tác Nào</h3>
            <p className="text-xs text-[#6B665E] mt-1 max-w-md mx-auto">
              {isAdmin
                ? 'Hãy bấm nút "Tải Video Lên" ở trên để đăng tải video xưởng mộc khắc laser từ máy tính của bạn.'
                : 'Danh sách video đang được cập nhật.'}
            </p>
            {isAdmin ? (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-5 bg-[#5A5A40] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tải Video Mới</span>
              </button>
            ) : (
              <p className="text-[11px] text-[#8C877E] italic mt-3">
                (Chỉ quản trị viên mới có quyền đăng tải & quản lý video)
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {videos.map((video) => (
              <div
                key={video.id}
                onClick={() => setActiveVideo(video)}
                className="group bg-white rounded-3xl overflow-hidden border border-[#EAE7E2] shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col relative"
              >
                {/* Delete button on top right of card (Admin only) */}
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setVideoToDelete(video);
                    }}
                    className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-all opacity-80 hover:opacity-100 shadow-md cursor-pointer"
                    title="Xoá video này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {/* Thumbnail Container with Play Overlay */}
                <div className="relative aspect-video overflow-hidden bg-[#2D2926]">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Duration Tag */}
                  <span className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-mono font-bold px-2 py-1 rounded-md backdrop-blur-xs">
                    {video.duration}
                  </span>

                  {/* Category Tag */}
                  <span className="absolute top-3 left-3 bg-[#5A5A40] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                    {video.tag}
                  </span>

                  {/* Play Button Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/90 text-[#8B4513] group-hover:bg-[#8B4513] group-hover:text-white flex items-center justify-center shadow-lg transition-all duration-300 transform group-hover:scale-110">
                      <Play className="w-6 h-6 fill-current ml-1" />
                    </div>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-serif-vi font-bold text-base text-[#2D2926] group-hover:text-[#8B4513] transition-colors leading-snug">
                      {video.title}
                    </h3>
                    <p className="text-xs text-[#6B665E] mt-2 line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#F0EDE9] flex items-center justify-between text-[11px] text-[#5A5A40] font-bold">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#8B4513]" />
                      <span>Phát video HD</span>
                    </span>
                    <span className="underline group-hover:translate-x-1 transition-transform">
                      Phát ngay →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* VIDEO PLAYER MODAL */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2926]/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Modal Button */}
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all shadow-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Smart Video Player (Supports YouTube, Vimeo, direct MP4 & Data URLs with fallback) */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <SmartVideoPlayer video={activeVideo} />
            </div>

            {/* Video Footer Caption */}
            <div className="p-6 bg-[#1A1816] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B4513] bg-[#8B4513]/20 px-2.5 py-1 rounded-md inline-block mb-1">
                  {activeVideo.tag}
                </span>
                <h3 className="font-serif-vi font-bold text-lg text-white">
                  {activeVideo.title}
                </h3>
                <p className="text-xs text-[#A8A29E] mt-1">
                  {activeVideo.description}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {isAdmin && (
                  <button
                    onClick={() => {
                      setVideoToDelete(activeVideo);
                    }}
                    className="bg-red-600/80 hover:bg-red-600 text-white px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Xoá Video</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveVideo(null)}
                  className="bg-[#5A5A40] hover:bg-[#4A4A35] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shrink-0 cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD VIDEO MODAL */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2926]/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#EAE7E2] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-[#8C877E] hover:text-[#2D2926] w-8 h-8 rounded-full bg-[#F5F3EF] flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#8B4513] mb-1">
                <VideoIcon className="w-4 h-4" />
                <span>Thêm Video Chế Tác Mới</span>
              </div>
              <h3 className="text-xl font-serif-vi font-bold text-[#2D2926]">
                Tải Video Từ Máy Tính Lên Gian Hàng
              </h3>
            </div>

            {uploadError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleAddVideoSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                  Tên Video *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Cận Cảnh Khắc Laser Móc Khóa Gỗ Maple"
                  className="w-full px-4 py-2.5 text-xs border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                    Thẻ / Nhãn
                  </label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="VD: Móc Khóa Custom"
                    className="w-full px-4 py-2.5 text-xs border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                    Thời lượng
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="01:30"
                    className="w-full px-4 py-2.5 text-xs border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>
              </div>

              {/* UPLOAD VIDEO FILE */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                  Chọn Video Tải Lên Từ Máy *
                </label>
                <label className="border-2 border-dashed border-[#DEDAD2] hover:border-[#8B4513] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-[#FDFCFB] transition-colors">
                  <Upload className="w-6 h-6 text-[#8B4513] mb-1" />
                  <span className="text-xs font-bold text-[#2D2926]">
                    {videoFileName ? videoFileName : 'Nhấn để chọn file video (.mp4, .webm, .mov)'}
                  </span>
                  <span className="text-[10px] text-[#8C877E] mt-0.5">
                    {isUploading ? 'Đang xử lý file...' : 'Tệp video sẽ được tải lên và xem trực tiếp'}
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileUpload}
                    className="hidden"
                  />
                </label>

                <div className="mt-2 text-[11px] text-[#6B665E] flex items-center justify-between font-semibold">
                  <span>Hoặc dán Link YouTube, Vimeo, MP4:</span>
                </div>
                <input
                  type="text"
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... hoặc link video MP4"
                  className="w-full mt-1 px-4 py-2 text-xs border border-[#DEDAD2] rounded-xl focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              {/* UPLOAD THUMBNAIL FILE */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                  Ảnh Thu Nhỏ (Poster / Thumbnail)
                </label>
                <label className="border-2 border-dashed border-[#DEDAD2] hover:border-[#8B4513] rounded-2xl p-3 flex items-center justify-center gap-2 cursor-pointer bg-[#FDFCFB]">
                  <ImageIcon className="w-4 h-4 text-[#8B4513]" />
                  <span className="text-xs font-semibold text-[#2D2926] truncate">
                    {thumbFileName ? thumbFileName : 'Chọn ảnh bìa từ máy tính (Tùy chọn)'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailFileUpload}
                    className="hidden"
                  />
                </label>
                <input
                  type="text"
                  value={thumbnailUrlInput}
                  onChange={(e) => setThumbnailUrlInput(e.target.value)}
                  placeholder="Hoặc dán URL ảnh bìa https://..."
                  className="w-full mt-1.5 px-4 py-2 text-xs border border-[#DEDAD2] rounded-xl focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                  Mô Tả Nội Dung Video
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="VD: Cận cảnh quy trình cắt khắc laser nét căng lên phôi gỗ Maple..."
                  className="w-full px-4 py-2 text-xs border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#6B665E] hover:bg-[#F0EDE9] transition-all cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="bg-[#5A5A40] hover:bg-[#4A4A35] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  Đăng Video Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {videoToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2926]/70 backdrop-blur-xs animate-fadeIn"
          onClick={() => setVideoToDelete(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-6 text-center shadow-2xl border border-[#EAE7E2]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif-vi font-bold text-lg text-[#2D2926]">
              Xoá Video Này?
            </h3>
            <p className="text-xs text-[#6B665E] mt-2 leading-relaxed">
              Bạn có chắc chắn muốn xoá video <b>"{videoToDelete.title}"</b> khỏi danh sách trình chiếu?
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setVideoToDelete(null)}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#6B665E] bg-[#F0EDE9] hover:bg-[#EAE7E2] transition-all cursor-pointer"
              >
                Giữ Lại
              </button>
              <button
                onClick={() => handleDeleteVideo(videoToDelete)}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-sm cursor-pointer"
              >
                Xác Nhận Xoá
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

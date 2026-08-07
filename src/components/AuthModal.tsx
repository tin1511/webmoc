import React, { useState, useEffect } from 'react';
import { X, User, Lock, Mail, ShieldCheck, LogIn, UserPlus, Sparkles, AlertCircle, Eye, EyeOff, CheckSquare, Square } from 'lucide-react';
import { UserAccount, DEFAULT_ADMIN } from '../types/auth';
import {
  subscribeToUsers,
  saveUserToFirestore,
  recordLoginLogToFirestore
} from '../lib/firestoreService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

const LOGIN_LOGS_KEY = 'bansacviet_login_logs';
const USERS_STORAGE_KEY = 'bansacviet_registered_users';
const REMEMBER_KEY = 'bansacviet_remember_user';

const recordLoginLog = (username: string, status: 'Thành công' | 'Thất bại') => {
  try {
    const existing = localStorage.getItem(LOGIN_LOGS_KEY);
    const logs = existing ? JSON.parse(existing) : [];
    const newLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleString('vi-VN'),
      device: 'Chrome / Web Browser',
      ip: '118.69.182.45',
      username,
      status,
    };
    logs.unshift(newLog);
    // keep max 20 logs
    if (logs.length > 20) logs.pop();
    localStorage.setItem(LOGIN_LOGS_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to log login event', err);
  }

  // Also save to Firestore cloud database
  recordLoginLogToFirestore(username, status);
};

const DEFAULT_DEMO_USER = {
  username: 'khachhang',
  password: '123456',
  name: 'Khách Hàng Thân Thiết',
  email: 'khachhang@bansacviet.vn',
  role: 'user' as const,
  avatar: '👤',
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Firestore users list state
  const [cloudUsers, setCloudUsers] = useState<Array<UserAccount & { password?: string }>>([]);

  // Subscribe to real-time users list from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToUsers((users) => {
      setCloudUsers(users);
      // cache in localStorage
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    });
    return () => unsubscribe();
  }, []);

  // Load remembered credentials when modal opens
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMsg('');
      try {
        const remembered = localStorage.getItem(REMEMBER_KEY);
        if (remembered) {
          const parsed = JSON.parse(remembered);
          if (parsed.username) setUsername(parsed.username);
          if (parsed.password) setPassword(parsed.password);
          if (typeof parsed.rememberMe === 'boolean') setRememberMe(parsed.rememberMe);
        }
      } catch (err) {
        console.error('Failed to parse remembered credentials', err);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Helper to get saved users from Firestore or localStorage
  const getSavedUsers = (): Array<UserAccount & { password?: string }> => {
    if (cloudUsers && cloudUsers.length > 0) {
      return cloudUsers;
    }
    try {
      const savedUsersStr = localStorage.getItem(USERS_STORAGE_KEY);
      if (savedUsersStr) {
        const parsed = JSON.parse(savedUsersStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved users', e);
    }
    // Pre-seed default user if none exist
    const initialUsers = [DEFAULT_DEMO_USER];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
    return initialUsers;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập / email và mật khẩu.');
      return;
    }

    // Check Admin account: admin / hminh0812
    if (trimmedUser.toLowerCase() === 'admin' && trimmedPass === 'hminh0812') {
      recordLoginLog('admin', 'Thành công');
      if (rememberMe) {
        localStorage.setItem(
          REMEMBER_KEY,
          JSON.stringify({ username: trimmedUser, password: trimmedPass, rememberMe: true })
        );
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      onLoginSuccess(DEFAULT_ADMIN);
      onClose();
      return;
    }

    // Check regular users from localStorage (allows matching username OR email)
    const savedUsers = getSavedUsers();

    const foundUser = savedUsers.find((u) => {
      const matchUsername = u.username.toLowerCase() === trimmedUser.toLowerCase();
      const matchEmail = u.email && u.email.trim().toLowerCase() === trimmedUser.toLowerCase();
      return (matchUsername || matchEmail) && u.password === trimmedPass;
    });

    if (foundUser) {
      recordLoginLog(foundUser.username, 'Thành công');
      if (rememberMe) {
        localStorage.setItem(
          REMEMBER_KEY,
          JSON.stringify({ username: trimmedUser, password: trimmedPass, rememberMe: true })
        );
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      const loggedInUser: UserAccount = {
        username: foundUser.username,
        name: foundUser.name,
        role: (foundUser.role as 'admin' | 'user') || 'user',
        email: foundUser.email,
        avatar: foundUser.avatar || '👤',
      };

      onLoginSuccess(loggedInUser);
      onClose();
      return;
    }

    // Record failure log
    recordLoginLog(trimmedUser, 'Thất bại');

    // Check if user exists but wrong password vs user doesn't exist
    const userExists = savedUsers.some((u) => {
      const matchUsername = u.username.toLowerCase() === trimmedUser.toLowerCase();
      const matchEmail = u.email && u.email.trim().toLowerCase() === trimmedUser.toLowerCase();
      return matchUsername || matchEmail;
    });

    if (userExists) {
      setError('Mật khẩu không đúng. Vui lòng kiểm tra lại.');
    } else {
      setError('Tài khoản hoặc Email này chưa được đăng ký.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUser || !trimmedPass || !trimmedName) {
      setError('Vui lòng nhập đầy đủ thông tin bắt buộc.');
      return;
    }

    if (trimmedUser.length < 3) {
      setError('Tên đăng nhập phải có ít nhất 3 ký tự.');
      return;
    }

    if (trimmedPass.length < 4) {
      setError('Mật khẩu phải từ 4 ký tự trở lên.');
      return;
    }

    if (trimmedUser.toLowerCase() === 'admin') {
      setError('Tên đăng nhập "admin" là tài khoản hệ thống. Vui lòng chọn tên khác.');
      return;
    }

    const savedUsers = getSavedUsers();

    // Check existing username
    const isUsernameExist = savedUsers.some(
      (u) => u.username.toLowerCase() === trimmedUser.toLowerCase()
    );

    if (isUsernameExist) {
      setError(`Tên đăng nhập "${trimmedUser}" đã tồn tại. Vui lòng chọn tên khác hoặc Đăng nhập.`);
      return;
    }

    // Check existing email if provided
    if (trimmedEmail) {
      const isEmailExist = savedUsers.some(
        (u) => u.email && u.email.toLowerCase() === trimmedEmail.toLowerCase()
      );
      if (isEmailExist) {
        setError(`Email "${trimmedEmail}" đã được đăng ký tài khoản khác.`);
        return;
      }
    }

    const newUser = {
      username: trimmedUser,
      password: trimmedPass,
      name: trimmedName,
      email: trimmedEmail,
      role: 'user' as const,
      avatar: '👤',
    };

    savedUsers.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(savedUsers));

    // Save to Firestore cloud database
    saveUserToFirestore(newUser).catch((err) =>
      console.error('Failed to save registered user to Firestore:', err)
    );

    // Remember credentials if checkbox is enabled
    if (rememberMe) {
      localStorage.setItem(
        REMEMBER_KEY,
        JSON.stringify({ username: trimmedUser, password: trimmedPass, rememberMe: true })
      );
    }

    onLoginSuccess({
      username: newUser.username,
      name: newUser.name,
      role: 'user',
      email: newUser.email,
      avatar: '👤',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2926]/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-[#FDFBF7] rounded-3xl overflow-hidden shadow-2xl border border-[#EAE7E2]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header tabs */}
        <div className="flex border-b border-[#EAE7E2] bg-[#F0EDE9]">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-4 text-xs sm:text-sm font-bold uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tab === 'login'
                ? 'bg-[#FDFBF7] text-[#5A5A40] border-t-2 border-[#5A5A40]'
                : 'text-[#6B665E] hover:text-[#2D2926]'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng Nhập</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-4 text-xs sm:text-sm font-bold uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tab === 'register'
                ? 'bg-[#FDFBF7] text-[#5A5A40] border-t-2 border-[#5A5A40]'
                : 'text-[#6B665E] hover:text-[#2D2926]'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Đăng Ký Mới</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-12 flex items-center justify-center text-[#6B665E] hover:text-[#2D2926] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-green-50 border border-green-200 rounded-2xl text-xs text-green-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {tab === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                  Tên đăng nhập hoặc Email *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Tên tài khoản hoặc Email..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                  Mật khẩu *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-white border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C877E] hover:text-[#2D2926] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me checkbox */}
              <div className="flex items-center justify-between text-xs text-[#6B665E] pt-1">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-center gap-2 hover:text-[#2D2926] cursor-pointer select-none"
                >
                  {rememberMe ? (
                    <CheckSquare className="w-4 h-4 text-[#5A5A40]" />
                  ) : (
                    <Square className="w-4 h-4 text-[#8C877E]" />
                  )}
                  <span>Lưu thông tin đăng nhập</span>
                </button>

                <span className="text-[11px] text-[#8C877E] italic">Lưu vào máy tính</span>
              </div>

              <button
                type="submit"
                className="w-full bg-[#5A5A40] hover:bg-[#4A4A35] text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập Ngay</span>
              </button>


            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                  Tên đăng nhập *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="VD: nguyenvanan"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                  Họ và tên người dùng *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="VD: Nguyễn Văn An"
                  className="w-full px-4 py-2.5 text-xs bg-white border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                  Email liên hệ
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="VD: annguyen@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                  Mật khẩu *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu (tối thiểu 4 ký tự)"
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-white border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C877E] hover:text-[#2D2926] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me checkbox */}
              <div className="flex items-center gap-2 text-xs text-[#6B665E] pt-1">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-center gap-2 hover:text-[#2D2926] cursor-pointer select-none"
                >
                  {rememberMe ? (
                    <CheckSquare className="w-4 h-4 text-[#5A5A40]" />
                  ) : (
                    <Square className="w-4 h-4 text-[#8C877E]" />
                  )}
                  <span>Lưu thông tin đăng nhập tự động</span>
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-[#8B4513] hover:bg-[#6E360F] text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Tạo Tài Khoản & Tự Động Đăng Nhập</span>
              </button>
            </form>
          )}

          {/* Footer message */}
          <p className="text-center text-[11px] text-[#8C877E] pt-2">
            Thông tin tài khoản được lưu trữ an toàn trên thiết bị của bạn.
          </p>
        </div>
      </div>
    </div>
  );
};

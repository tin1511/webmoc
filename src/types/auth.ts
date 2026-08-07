export interface UserAccount {
  username: string;
  name: string;
  role: 'admin' | 'user';
  email?: string;
  avatar?: string;
}

export const DEFAULT_ADMIN: UserAccount = {
  username: 'admin',
  name: 'Quản Trị Viên (Admin)',
  role: 'admin',
  email: 'admin@bansacviet.vn',
  avatar: '👑'
};

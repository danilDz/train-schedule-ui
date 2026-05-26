export type UserRole = 'ADMIN' | 'DISPATCHER' | 'PASSENGER';

export interface IUserInfo {
  firstName: string;
  lastName: string;
  email: string;
  id: string;
  isAdmin: boolean;
  role?: UserRole;
}
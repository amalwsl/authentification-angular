export interface User {
  id?: number;
  username: string;
  password?: string;
  role: 'admin' | 'employee';
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}
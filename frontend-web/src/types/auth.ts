export interface User {
  id: string;
  username: string;
  role: 'admin' | 'agent' | 'analyst';
  email: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
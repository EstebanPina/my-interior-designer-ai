export interface User {
  userId: string;
  email: string;
  name: string;
  avatar?: string;
  subscription: string;
  designsCount: number;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}
export interface User {
  uid: string;
  email: string;
  username: string;
  userId: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, username: string, userId: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  sendVerificationEmail: (email: string) => Promise<void>;
  verifyEmail: (code: string) => Promise<boolean>;
}

export interface AuthScreenProps {
  navigation: any;
} 
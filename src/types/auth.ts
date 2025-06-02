
import type { User as SupabaseUser, AuthError, Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'profesor' | 'elev' | 'parinte';
  subscription: 'gratuit' | 'premium';
  materialsCount: number;
  materialsLimit: number;
  avatar?: string;
  provider?: string;
  role: 'admin' | 'user';
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  register: (email: string, password: string, name: string, userType: User['userType']) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export type { SupabaseUser, AuthError, Session };

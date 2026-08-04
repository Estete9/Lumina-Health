import { createClient } from '../supabase/client';
import { AuthUser, LoginInput, RegisterInput, AuthSession, AuthResponseData, ServiceResponse } from '../types';


export const authService = {
  _sessionPromise: null as Promise<ServiceResponse<AuthSession>> | null,

  async login(input: LoginInput): Promise<ServiceResponse<AuthResponseData>> {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('lumina_explicit_logout');
    }

    const supabase = createClient();
    if (!supabase) {
      return { data: null, error: 'Failed to initialize Supabase client' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password || 'password123',
    });

    if (error || !data.session) {
      return { data: null, error: error?.message || 'Login failed' };
    }

    const { data: profile } = await supabase
      .from('practitioners')
      .select('*')
      .eq('id', data.user.id)
      .single();

    const authUser: AuthUser = {
      id: profile?.id || data.user.id,
      email: profile?.email || data.user.email || input.email,
      name: profile?.name || (profile?.first_name ? `${profile.first_name} ${profile.last_name}` : null) || data.user.user_metadata?.name || input.email,
      specialty: profile?.specialty || data.user.user_metadata?.specialty,
      clinic_name: profile?.clinic_name,
      created_at: profile?.created_at || new Date().toISOString()
    };

    const authSession: AuthSession = {
      user: authUser,
      session_id: data.session.access_token,
      access_token: data.session.access_token,
      expires_at: data.session.expires_at
    };

    return { data: { user: authUser, session: authSession }, error: null };
  },

  async register(input: RegisterInput): Promise<ServiceResponse<AuthResponseData>> {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('lumina_explicit_logout');
    }

    const supabase = createClient();
    if (!supabase) {
      return { data: null, error: 'Failed to initialize Supabase client' };
    }

    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password || 'password123',
      options: {
        data: {
          name: input.name,
          specialty: input.specialty
        }
      }
    });

    if (error || !data.user) {
      return { data: null, error: error?.message || 'Registration failed' };
    }

    const authUser: AuthUser = {
      id: data.user.id,
      email: input.email,
      name: input.name,
      specialty: input.specialty || 'Clinical Psychology',
      created_at: new Date().toISOString()
    };

    const authSession: AuthSession = {
      user: authUser,
      session_id: data.session?.access_token || 'token',
      access_token: data.session?.access_token || 'token',
      expires_at: data.session?.expires_at
    };

    return { data: { user: authUser, session: authSession }, error: null };
  },

  async logout(): Promise<ServiceResponse<boolean>> {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('lumina_explicit_logout', 'true');
    }

    const supabase = createClient();
    if (!supabase) return { data: true, error: null };

    const { error } = await supabase.auth.signOut();
    if (error) return { data: false, error: error.message };
    
    return { data: true, error: null };
  },

  async getSession(): Promise<ServiceResponse<AuthSession>> {
    if (typeof window !== 'undefined' && window.localStorage.getItem('lumina_explicit_logout') === 'true') {
      return { data: null, error: null };
    }

    if (!this._sessionPromise) {
      this._sessionPromise = this._getSessionInternal().finally(() => {
        this._sessionPromise = null;
      });
    }
    return this._sessionPromise;
  },

  async _getSessionInternal(): Promise<ServiceResponse<AuthSession>> {
    if (typeof window !== 'undefined' && window.localStorage.getItem('lumina_explicit_logout') === 'true') {
      return { data: null, error: null };
    }

    const supabase = createClient();
    if (!supabase) {
      return { data: null, error: 'Failed to initialize Supabase client' };
    }

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data?.session?.user) {
        return { data: null, error: error?.message || 'No active session' };
      }

      const { data: profile, error: profileError } = await supabase
        .from('practitioners')
        .select('*')
        .eq('id', data.session.user.id)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') {
         // Log real errors but don't fail hard if profile just doesn't exist yet
         console.warn("Failed to fetch practitioner profile", profileError);
      }

      const authSession: AuthSession = {
        user: {
          id: data.session.user.id,
          email: data.session.user.email || '',
          name: profile?.name || (profile?.first_name ? `${profile.first_name} ${profile.last_name}` : null) || data.session.user.user_metadata?.name || data.session.user.email,
          specialty: data.session.user.user_metadata?.specialty,
          created_at: profile?.created_at || new Date().toISOString()
        } as AuthUser,
        session_id: data.session.access_token,
        access_token: data.session.access_token,
        expires_at: data.session.expires_at
      };

      return { data: authSession, error: null };
    } catch (e: any) {
      return { data: null, error: e.message || 'Session fetch failed' };
    }
  },

  async getCurrentUser(): Promise<ServiceResponse<AuthUser>> {
    const sessionResponse = await this.getSession();
    if (sessionResponse.error || !sessionResponse.data?.user) {
      return { data: null, error: sessionResponse.error || 'No user logged in' };
    }
    return { data: sessionResponse.data.user, error: null };
  }
};

export async function login(emailOrInput: string | LoginInput, password?: string): Promise<ServiceResponse<AuthResponseData>> {
  if (typeof emailOrInput === 'string') {
    return authService.login({ email: emailOrInput, password });
  }
  return authService.login(emailOrInput);
}

export async function register(nameOrInput: string | RegisterInput, email?: string, password?: string, specialty?: string): Promise<ServiceResponse<AuthResponseData>> {
  if (typeof nameOrInput === 'string') {
    return authService.register({ name: nameOrInput, email: email || '', password, specialty });
  }
  return authService.register(nameOrInput);
}

export async function logout(): Promise<ServiceResponse<boolean>> {
  return authService.logout();
}

export async function getSession(): Promise<ServiceResponse<AuthSession>> {
  return authService.getSession();
}

export async function getCurrentUser(): Promise<ServiceResponse<AuthUser>> {
  return authService.getCurrentUser();
}

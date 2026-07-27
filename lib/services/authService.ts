import { createClient } from '../supabase/client';
import { AuthUser, LoginInput, RegisterInput, AuthSession, AuthResponseData, ServiceResponse } from '../types';

// Mock practitioner data
const MOCK_PRACTITIONER: AuthUser = {
  id: 'prac-1',
  email: 'sarah.jenkins@lumina.local',
  name: 'Dr. Sarah Jenkins',
  specialty: 'General Practice',
  created_at: new Date().toISOString()
};

const MOCK_SESSION_KEY = 'lumina_mock_session';

export const authService = {
  async login(input: LoginInput): Promise<ServiceResponse<AuthResponseData>> {
    // Check if we're using mock auth
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true') {
      const session: AuthSession = { user: MOCK_PRACTITIONER, session_id: 'mock-session-123' };
      if (typeof window !== 'undefined') {
        localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
      }
      return { data: { user: MOCK_PRACTITIONER, session }, error: null };
    }

    const supabase = createClient();
    if (!supabase) {
      return { data: null, error: 'Supabase client is not configured' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password || 'password123',
    });

    if (error || !data.session) {
      return { data: null, error: error?.message || 'Login failed' };
    }

    // Fetch practitioner profile
    const { data: profile, error: profileError } = await supabase
      .from('practitioners')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      return { data: null, error: profileError.message };
    }

    const authUser: AuthUser = {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      specialty: profile.specialty,
      clinic_name: profile.clinic_name,
      created_at: profile.created_at
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
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true') {
      const newUser: AuthUser = {
        id: 'prac-mock-' + Date.now(),
        email: input.email,
        name: input.name,
        specialty: input.specialty,
        created_at: new Date().toISOString()
      };
      const session: AuthSession = { user: newUser, session_id: 'mock-session-' + Date.now() };
      if (typeof window !== 'undefined') {
        localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
      }
      return { data: { user: newUser, session }, error: null };
    }

    const supabase = createClient();
    if (!supabase) {
      return { data: null, error: 'Supabase client is not configured' };
    }

    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password || 'password123',
    });

    if (error || !data.user) {
      return { data: null, error: error?.message || 'Registration failed' };
    }

    // Create practitioner profile
    const { error: insertError } = await supabase
      .from('practitioners')
      .insert({
        id: data.user.id,
        email: input.email,
        name: input.name,
        specialty: input.specialty
      });

    if (insertError) {
      return { data: null, error: insertError.message };
    }

    const authUser: AuthUser = {
      id: data.user.id,
      email: input.email,
      name: input.name,
      specialty: input.specialty,
      created_at: new Date().toISOString()
    };

    const authSession: AuthSession = {
      user: authUser,
      session_id: data.session?.access_token,
      access_token: data.session?.access_token,
      expires_at: data.session?.expires_at
    };

    return { data: { user: authUser, session: authSession }, error: null };
  },

  async logout(): Promise<ServiceResponse<boolean>> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true') {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(MOCK_SESSION_KEY);
      }
      return { data: true, error: null };
    }

    const supabase = createClient();
    if (!supabase) {
      return { data: true, error: null };
    }

    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { data: null, error: error.message };
    }
    
    return { data: true, error: null };
  },

  async getSession(): Promise<ServiceResponse<AuthSession>> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true') {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(MOCK_SESSION_KEY);
        if (stored) {
          return { data: JSON.parse(stored), error: null };
        }
      }
      return { data: null, error: null };
    }

    const supabase = createClient();
    if (!supabase) {
      return { data: null, error: null };
    }

    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) {
      return { data: null, error: error?.message || 'No session found' };
    }

    // Need to get the profile for the user
    const { data: profile } = await supabase
      .from('practitioners')
      .select('*')
      .eq('id', data.session.user.id)
      .single();

    if (!profile) {
      return { data: null, error: 'Profile not found' };
    }

    const authSession: AuthSession = {
      user: profile as AuthUser,
      session_id: data.session.access_token,
      access_token: data.session.access_token,
      expires_at: data.session.expires_at
    };

    return { data: authSession, error: null };
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


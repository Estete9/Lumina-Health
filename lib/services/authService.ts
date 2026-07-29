import { createClient } from '../supabase/client';
import { AuthUser, LoginInput, RegisterInput, AuthSession, AuthResponseData, ServiceResponse } from '../types';

const MOCK_PRACTITIONER: AuthUser = {
  id: 'prac-1',
  email: 'dr.vance@luminahealth.com',
  name: 'Dr. Evelyn Vance',
  specialty: 'Clinical Psychology',
  clinic_name: 'Lumina Mind & Behavioral Health',
  created_at: new Date().toISOString()
};

let currentMockUser: AuthUser = MOCK_PRACTITIONER;

const getMockSession = (user: AuthUser): AuthSession => ({
  user,
  session_id: 'mock-session-auto',
  access_token: 'mock-token',
  expires_at: 9999999999
});

export const authService = {
  async login(input: LoginInput): Promise<ServiceResponse<AuthResponseData>> {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('lumina_explicit_logout');
    }

    const supabase = createClient();
    if (!supabase) {
      const formattedName = input.email
        ? 'Dr. ' + input.email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
        : MOCK_PRACTITIONER.name;

      currentMockUser = {
        ...MOCK_PRACTITIONER,
        name: formattedName,
        email: input.email || MOCK_PRACTITIONER.email
      };
      const session = getMockSession(currentMockUser);
      return { data: { user: currentMockUser, session }, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password || 'password123',
    });

    if (error || !data.session) return { data: null, error: error?.message || 'Login failed' };

    const { data: profile, error: profileError } = await supabase
      .from('practitioners')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) return { data: null, error: profileError?.message || 'Profile not found' };

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
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('lumina_explicit_logout');
    }

    const supabase = createClient();
    if (!supabase) {
      currentMockUser = {
        id: 'prac-mock-' + Date.now(),
        email: input.email,
        name: input.name,
        specialty: input.specialty || 'Clinical Psychology',
        created_at: new Date().toISOString()
      };
      const session = getMockSession(currentMockUser);
      return { data: { user: currentMockUser, session }, error: null };
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

    if (error || !data.user) return { data: null, error: error?.message || 'Registration failed' };

    const authUser: AuthUser = {
      id: data.user.id,
      email: input.email,
      name: input.name,
      specialty: input.specialty || 'Clinical Psychology',
      created_at: new Date().toISOString()
    };

    const authSession: AuthSession = {
      user: authUser,
      session_id: data.session?.access_token || '',
      access_token: data.session?.access_token || '',
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
    const supabase = createClient();
    if (!supabase) {
      if (typeof window !== 'undefined' && window.localStorage.getItem('lumina_explicit_logout') === 'true') {
        return { data: null, error: null };
      }
      return { data: getMockSession(currentMockUser), error: null };
    }

    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) return { data: null, error: error?.message || 'No session found' };

    const { data: profile } = await supabase
      .from('practitioners')
      .select('*')
      .eq('id', data.session.user.id)
      .single();

    if (!profile) return { data: null, error: 'Profile not found' };

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

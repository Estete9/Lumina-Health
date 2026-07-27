import { authService } from '../../lib/services/authService';

describe('Sprint 9: Auth Service Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test for mock mode
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    // Set to mock auth explicitly to avoid Supabase errors during test run
    process.env.NEXT_PUBLIC_USE_MOCK_AUTH = 'true';
  });

  it('should login with mock user and return session', async () => {
    const response = await authService.login({ email: 'sarah.jenkins@lumina.local', password: 'password123' });
    expect(response.error).toBeNull();
    expect(response.data?.user).toBeDefined();
    expect(response.data?.user?.email).toBe('sarah.jenkins@lumina.local');
    expect(response.data?.session).toBeDefined();
  });

  it('should register a new mock user and return session', async () => {
    const response = await authService.register({
      name: 'Dr. New Doc',
      email: 'newdoc@lumina.local',
      password: 'password123',
      specialty: 'Cardiology'
    });
    
    expect(response.error).toBeNull();
    expect(response.data?.user).toBeDefined();
    expect(response.data?.user?.email).toBe('newdoc@lumina.local');
    expect(response.data?.user?.name).toBe('Dr. New Doc');
    expect(response.data?.session).toBeDefined();
  });

  it('should logout and remove session', async () => {
    // Login first
    await authService.login({ email: 'sarah.jenkins@lumina.local', password: 'password123' });
    
    const logoutResponse = await authService.logout();
    expect(logoutResponse.error).toBeNull();
    expect(logoutResponse.data).toBe(true);
  });

  it('should get current user after login', async () => {
    await authService.login({ email: 'sarah.jenkins@lumina.local', password: 'password123' });
    const userResponse = await authService.getCurrentUser();
    expect(userResponse.error).toBeNull();
    expect(userResponse.data?.email).toBe('sarah.jenkins@lumina.local');
  });
});

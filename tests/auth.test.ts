/**
 * Unit tests for auth service
 */

import MockAdapter from 'axios-mock-adapter';
import authService, {
  authAPI,
  getToken,
  setToken,
  removeToken,
  isAuthenticated,
} from '@/services/auth';

describe('auth.ts – token helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getToken', () => {
    it('returns null when no token is stored', () => {
      expect(getToken()).toBeNull();
    });

    it('returns the stored token', () => {
      localStorage.setItem('library_access_token', 'abc123');
      expect(getToken()).toBe('abc123');
    });
  });

  describe('setToken', () => {
    it('stores the token in localStorage', () => {
      setToken('my-token');
      expect(localStorage.getItem('library_access_token')).toBe('my-token');
    });
  });

  describe('removeToken', () => {
    it('removes the token from localStorage', () => {
      localStorage.setItem('library_access_token', 'abc123');
      removeToken();
      expect(localStorage.getItem('library_access_token')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('returns false when no token exists', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('returns true when token exists', () => {
      localStorage.setItem('library_access_token', 'abc123');
      expect(isAuthenticated()).toBe(true);
    });
  });
});

describe('auth.ts – authService', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    localStorage.clear();
    mock = new MockAdapter(authAPI);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('login', () => {
    it('posts form-encoded credentials to /auth/login', async () => {
      const tokenPayload = { access_token: 'tok-xyz', token_type: 'bearer' };
      mock.onPost('/auth/login').reply(200, tokenPayload);

      const result = await authService.login('admin', 'pass');
      expect(result.access_token).toBe('tok-xyz');
    });

    it('stores the token after a successful login', async () => {
      mock.onPost('/auth/login').reply(200, {
        access_token: 'stored-tok',
        token_type: 'bearer',
      });

      await authService.login('admin', 'pass');
      expect(localStorage.getItem('library_access_token')).toBe('stored-tok');
    });

    it('throws when credentials are wrong (401)', async () => {
      mock.onPost('/auth/login').reply(401);
      await expect(authService.login('bad', 'creds')).rejects.toBeTruthy();
    });
  });

  describe('logout', () => {
    it('removes the token from localStorage', () => {
      localStorage.setItem('library_access_token', 'tok');
      authService.logout();
      expect(localStorage.getItem('library_access_token')).toBeNull();
    });
  });

  describe('register', () => {
    it('posts new user data to /auth/register and returns the user', async () => {
      const newUser = { username: 'newuser', email: 'new@test.com', password: 'pass' };
      const created = { id: 5, username: 'newuser', email: 'new@test.com', is_active: true };
      mock.onPost('/auth/register').reply(201, created);

      const result = await authService.register(newUser as any);
      expect(result.username).toBe('newuser');
    });
  });

  describe('getCurrentUser', () => {
    it('throws when there is no token', async () => {
      await expect(authService.getCurrentUser()).rejects.toThrow('No authentication token');
    });

    it('fetches current user from /auth/me when token exists', async () => {
      localStorage.setItem('library_access_token', 'valid-tok');
      const user = { id: 1, username: 'admin', email: 'admin@lib.com', is_active: true };
      mock.onGet('/auth/me').reply(200, user);

      const result = await authService.getCurrentUser();
      expect(result.username).toBe('admin');
    });
  });

  describe('401 interceptor', () => {
    it('clears token on 401 response', async () => {
      localStorage.setItem('library_access_token', 'expired-tok');
      mock.onGet('/auth/me').reply(401);

      try {
        await authService.getCurrentUser();
      } catch {
        // expected
      }

      expect(localStorage.getItem('library_access_token')).toBeNull();
    });
  });
});

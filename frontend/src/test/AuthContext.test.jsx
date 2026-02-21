import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';
import { auth } from '../api';

// Mock the API
vi.mock('../api', () => ({
  auth: {
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  }
}));

// Test component that uses the auth context
const TestComponent = () => {
  const { user, login, logout, isLoading, error } = useAuth();
  
  return (
    <div>
      <div data-testid="user">{user ? user.email : 'no user'}</div>
      <div data-testid="loading">{isLoading ? 'loading' : 'not loading'}</div>
      <div data-testid="error">{error || 'no error'}</div>
      <button onClick={() => login({ email: 'test@test.com', password: 'pass' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should provide auth context to children', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('user')).toHaveTextContent('no user');
    expect(screen.getByTestId('loading')).toHaveTextContent('not loading');
  });

  it('should handle successful login', async () => {
    const mockUser = { id: 1, email: 'test@test.com', role: 'teacher' };
    const mockResponse = { token: 'jwt_token', user: mockUser };
    
    auth.login.mockResolvedValueOnce({ data: mockResponse });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const loginButton = screen.getByText('Login');
    await userEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@test.com');
    });
    
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'jwt_token');
    expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
  });

  it('should handle login error', async () => {
    auth.login.mockRejectedValueOnce(new Error('Invalid credentials'));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const loginButton = screen.getByText('Login');
    await userEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
    });
  });

  it('should handle logout', async () => {
    // First login
    const mockUser = { id: 1, email: 'test@test.com', role: 'teacher' };
    auth.login.mockResolvedValueOnce({ 
      data: { token: 'jwt_token', user: mockUser } 
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Login
    await userEvent.click(screen.getByText('Login'));
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@test.com');
    });
    
    // Then logout
    auth.logout.mockResolvedValueOnce({ data: { message: 'Logout successful' } });
    await userEvent.click(screen.getByText('Logout'));
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no user');
    });
    
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
  });

  it('should restore user from localStorage on mount', () => {
    const storedUser = { id: 1, email: 'stored@test.com', role: 'admin' };
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'stored_token';
      if (key === 'user') return JSON.stringify(storedUser);
      return null;
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('user')).toHaveTextContent('stored@test.com');
  });

  it('should show loading state during login', async () => {
    auth.login.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve({ 
        data: { token: 'jwt', user: { id: 1, email: 'test@test.com' } } 
      }), 100);
    }));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const loginButton = screen.getByText('Login');
    await userEvent.click(loginButton);
    
    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not loading');
    });
  });

  it('should clear error on successful login after failure', async () => {
    // First login fails
    auth.login.mockRejectedValueOnce(new Error('First error'));
    
    const { rerender } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await userEvent.click(screen.getByText('Login'));
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('First error');
    });
    
    // Second login succeeds
    auth.login.mockResolvedValueOnce({ 
      data: { token: 'jwt', user: { id: 1, email: 'test@test.com' } } 
    });
    
    await userEvent.click(screen.getByText('Login'));
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('no error');
    });
  });
});

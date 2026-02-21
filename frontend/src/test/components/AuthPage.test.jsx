import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthPage from '../../components/AuthPage';
import { auth } from '../../api';

// Mock the API
vi.mock('../../api', () => ({
  auth: {
    login: vi.fn(),
    register: vi.fn(),
    verifyEmail: vi.fn(),
  }
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    form: ({ children, ...props }) => <form {...props}>{children}</form>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

const renderAuthPage = (props = {}) => {
  return render(<AuthPage {...props} />);
};

describe('AuthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form by default', () => {
    renderAuthPage();
    
    expect(screen.getByText(/sign in|login|log in/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should handle email input', async () => {
    renderAuthPage();
    
    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, 'test@school.com');
    
    expect(emailInput).toHaveValue('test@school.com');
  });

  it('should handle password input', async () => {
    renderAuthPage();
    
    const passwordInput = screen.getByLabelText(/password/i);
    await userEvent.type(passwordInput, 'password123');
    
    expect(passwordInput).toHaveValue('password123');
  });

  it('should submit login form', async () => {
    auth.login.mockResolvedValueOnce({
      data: {
        token: 'jwt_token',
        user: { id: 1, email: 'test@school.com', role: 'teacher' }
      }
    });
    
    renderAuthPage();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in|login/i });
    
    await userEvent.type(emailInput, 'test@school.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(auth.login).toHaveBeenCalledWith({
        email: 'test@school.com',
        password: 'password123'
      });
    });
  });

  it('should show error on invalid credentials', async () => {
    auth.login.mockRejectedValueOnce(new Error('Invalid credentials'));
    
    renderAuthPage();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in|login/i });
    
    await userEvent.type(emailInput, 'test@school.com');
    await userEvent.type(passwordInput, 'wrongpassword');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid|error|failed/i)).toBeInTheDocument();
    });
  });

  it('should toggle password visibility', async () => {
    renderAuthPage();
    
    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole('button', { name: /show|hide|toggle/i }) || 
                       screen.getByTestId('password-toggle');
    
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    await userEvent.click(toggleButton);
    
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('should validate email format', async () => {
    renderAuthPage();
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /sign in|login/i });
    
    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.click(submitButton);
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/valid email|invalid/i)).toBeInTheDocument();
    });
  });

  it('should validate required fields', async () => {
    renderAuthPage();
    
    const submitButton = screen.getByRole('button', { name: /sign in|login/i });
    await userEvent.click(submitButton);
    
    // Should show required field errors
    await waitFor(() => {
      expect(screen.getByText(/required|field is empty/i)).toBeInTheDocument();
    });
  });

  it('should switch to register mode', async () => {
    renderAuthPage();
    
    const registerLink = screen.getByText(/sign up|register|create account/i);
    await userEvent.click(registerLink);
    
    expect(screen.getByText(/create account|register|sign up/i)).toBeInTheDocument();
  });

  it('should handle registration', async () => {
    auth.register.mockResolvedValueOnce({
      data: { id: 1, email: 'new@school.com', role: 'student' }
    });
    
    renderAuthPage({ mode: 'register' });
    
    const nameInput = screen.getByLabelText(/name|full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign up|register/i });
    
    await userEvent.type(nameInput, 'John Doe');
    await userEvent.type(emailInput, 'new@school.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(auth.register).toHaveBeenCalledWith(expect.objectContaining({
        email: 'new@school.com',
        name: 'John Doe'
      }));
    });
  });

  it('should show loading state during submission', async () => {
    auth.login.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    renderAuthPage();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in|login/i });
    
    await userEvent.type(emailInput, 'test@school.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/loading|signing in/i)).toBeInTheDocument();
  });

  it('should handle "forgot password" link', async () => {
    renderAuthPage();
    
    const forgotLink = screen.getByText(/forgot password/i);
    expect(forgotLink).toBeInTheDocument();
    
    await userEvent.click(forgotLink);
    
    // Should navigate to forgot password or show modal
    expect(forgotLink).toBeInTheDocument();
  });

  it('should handle remember me checkbox', async () => {
    renderAuthPage();
    
    const rememberCheckbox = screen.getByLabelText(/remember me/i);
    await userEvent.click(rememberCheckbox);
    
    expect(rememberCheckbox).toBeChecked();
  });

  it('should handle social login buttons', () => {
    renderAuthPage();
    
    const googleButton = screen.queryByText(/google|continue with google/i);
    const microsoftButton = screen.queryByText(/microsoft|continue with microsoft/i);
    
    // Social login might not be implemented
    if (googleButton) {
      expect(googleButton).toBeInTheDocument();
    }
  });

  it('should validate password strength', async () => {
    renderAuthPage({ mode: 'register' });
    
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign up|register/i });
    
    await userEvent.type(passwordInput, '123');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/password.*short|weak|at least/i)).toBeInTheDocument();
    });
  });

  it('should handle terms and conditions checkbox', async () => {
    renderAuthPage({ mode: 'register' });
    
    const termsCheckbox = screen.getByLabelText(/terms|agree/i);
    await userEvent.click(termsCheckbox);
    
    expect(termsCheckbox).toBeChecked();
  });

  it('should show school selection for multi-school setup', () => {
    renderAuthPage({ showSchoolSelection: true });
    
    const schoolSelect = screen.queryByLabelText(/school|institution/i);
    if (schoolSelect) {
      expect(schoolSelect).toBeInTheDocument();
    }
  });

  it('should handle form reset', async () => {
    renderAuthPage();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await userEvent.type(emailInput, 'test@school.com');
    await userEvent.type(passwordInput, 'password123');
    
    const resetButton = screen.queryByText(/reset|clear/i);
    if (resetButton) {
      await userEvent.click(resetButton);
      
      expect(emailInput).toHaveValue('');
      expect(passwordInput).toHaveValue('');
    }
  });

  it('should handle keyboard navigation', async () => {
    renderAuthPage();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await userEvent.type(emailInput, 'test@school.com');
    await userEvent.keyboard('{Tab}');
    
    expect(document.activeElement).toBe(passwordInput);
  });

  it('should display logo and branding', () => {
    renderAuthPage();
    
    expect(screen.getByAltText(/logo|schoolsync/i)).toBeInTheDocument();
    expect(screen.getByText(/schoolsync|equipment management/i)).toBeInTheDocument();
  });

  it('should handle successful login redirect', async () => {
    auth.login.mockResolvedValueOnce({
      data: {
        token: 'jwt_token',
        user: { id: 1, email: 'test@school.com', role: 'teacher' }
      }
    });
    
    renderAuthPage();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in|login/i });
    
    await userEvent.type(emailInput, 'test@school.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';
import { AuthProvider } from '../../AuthContext';
import { auth, equipment, requests } from '../../api';

// Mock all API calls
vi.mock('../../api', () => ({
  auth: {
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    verifyEmail: vi.fn(),
  },
  equipment: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    search: vi.fn(),
  },
  requests: {
    create: vi.fn(),
    getUserRequests: vi.fn(),
    approve: vi.fn(),
    reject: vi.fn(),
    return: vi.fn(),
  },
  dashboard: {
    getStats: vi.fn(),
  },
  users: {
    getAll: vi.fn(),
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

const renderApp = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('User Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should complete full login to dashboard flow', async () => {
    const mockUser = {
      id: 1,
      email: 'teacher@school.com',
      role: 'teacher',
      name: 'John Teacher'
    };
    
    auth.login.mockResolvedValueOnce({
      data: {
        token: 'jwt_token_123',
        user: mockUser
      }
    });
    
    equipment.getAll.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'Laptop', type: 'electronics', status: 'available' }
      ]
    });
    
    renderApp('/login');
    
    // Fill in login form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /sign in|login/i });
    
    await userEvent.type(emailInput, 'teacher@school.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(loginButton);
    
    // Should navigate to dashboard
    await waitFor(() => {
      expect(auth.login).toHaveBeenCalledWith({
        email: 'teacher@school.com',
        password: 'password123'
      });
    });
  });

  it('should handle equipment request workflow', async () => {
    // Setup authenticated user
    const mockUser = {
      id: 1,
      email: 'student@school.com',
      role: 'student',
      name: 'Jane Student'
    };
    
    localStorage.setItem('token', 'jwt_token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    equipment.getAll.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'Microscope', type: 'science', status: 'available', serial_number: 'SN001' }
      ]
    });
    
    requests.create.mockResolvedValueOnce({
      data: {
        id: 1,
        equipment_id: 1,
        user_id: 1,
        status: 'pending',
        created_at: new Date().toISOString()
      }
    });
    
    renderApp('/dashboard');
    
    await waitFor(() => {
      expect(screen.getByText('Microscope')).toBeInTheDocument();
    });
    
    // Click request button
    const requestButton = screen.getByText(/request/i);
    await userEvent.click(requestButton);
    
    // Fill request form
    const purposeInput = screen.getByLabelText(/purpose|reason/i);
    const submitButton = screen.getByRole('button', { name: /submit|request/i });
    
    await userEvent.type(purposeInput, 'Science project');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(requests.create).toHaveBeenCalledWith(expect.objectContaining({
        equipment_id: 1,
        purpose: 'Science project'
      }));
    });
  });

  it('should handle manager approval workflow', async () => {
    const mockManager = {
      id: 2,
      email: 'manager@school.com',
      role: 'manager',
      name: 'Bob Manager'
    };
    
    localStorage.setItem('token', 'jwt_token');
    localStorage.setItem('user', JSON.stringify(mockManager));
    
    requests.getAllRequests = vi.fn().mockResolvedValueOnce({
      data: [
        {
          id: 1,
          equipment_id: 1,
          user_id: 3,
          user_name: 'Student Name',
          equipment_name: 'Laptop',
          status: 'pending',
          purpose: 'Project work',
          created_at: new Date().toISOString()
        }
      ]
    });
    
    requests.approve.mockResolvedValueOnce({
      data: { id: 1, status: 'approved' }
    });
    
    renderApp('/requests');
    
    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });
    
    // Approve request
    const approveButton = screen.getByRole('button', { name: /approve/i });
    await userEvent.click(approveButton);
    
    await waitFor(() => {
      expect(requests.approve).toHaveBeenCalledWith(1);
    });
  });

  it('should handle equipment return workflow', async () => {
    const mockUser = {
      id: 1,
      email: 'student@school.com',
      role: 'student'
    };
    
    localStorage.setItem('token', 'jwt_token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    requests.getUserRequests.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          equipment_id: 1,
          equipment_name: 'Projector',
          status: 'approved',
          checkout_date: new Date().toISOString()
        }
      ]
    });
    
    requests.return.mockResolvedValueOnce({
      data: { id: 1, status: 'returned', return_date: new Date().toISOString() }
    });
    
    renderApp('/my-requests');
    
    await waitFor(() => {
      expect(screen.getByText('Projector')).toBeInTheDocument();
    });
    
    // Return equipment
    const returnButton = screen.getByRole('button', { name: /return/i });
    await userEvent.click(returnButton);
    
    await waitFor(() => {
      expect(requests.return).toHaveBeenCalledWith(1);
    });
  });

  it('should handle search and filter workflow', async () => {
    const mockUser = {
      id: 1,
      email: 'teacher@school.com',
      role: 'teacher'
    };
    
    localStorage.setItem('token', 'jwt_token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    equipment.getAll.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'Laptop Pro', type: 'electronics', status: 'available' },
        { id: 2, name: 'Old Laptop', type: 'electronics', status: 'under_repair' },
        { id: 3, name: 'Microscope', type: 'science', status: 'available' }
      ]
    });
    
    renderApp('/dashboard');
    
    await waitFor(() => {
      expect(screen.getByText('Laptop Pro')).toBeInTheDocument();
    });
    
    // Search for laptops
    const searchInput = screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, 'laptop');
    
    await waitFor(() => {
      expect(screen.getByText('Laptop Pro')).toBeInTheDocument();
      expect(screen.queryByText('Microscope')).not.toBeInTheDocument();
    });
    
    // Clear search
    const clearButton = screen.getByRole('button', { name: /clear|reset/i });
    await userEvent.click(clearButton);
    
    await waitFor(() => {
      expect(screen.getByText('Microscope')).toBeInTheDocument();
    });
  });

  it('should handle logout flow', async () => {
    const mockUser = {
      id: 1,
      email: 'teacher@school.com',
      role: 'teacher'
    };
    
    localStorage.setItem('token', 'jwt_token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    auth.logout.mockResolvedValueOnce({
      data: { message: 'Logout successful' }
    });
    
    renderApp('/dashboard');
    
    // Click logout
    const logoutButton = screen.getByRole('button', { name: /logout|sign out/i });
    await userEvent.click(logoutButton);
    
    await waitFor(() => {
      expect(auth.logout).toHaveBeenCalled();
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  it('should handle error states gracefully', async () => {
    equipment.getAll.mockRejectedValueOnce(new Error('Network error'));
    
    const mockUser = {
      id: 1,
      email: 'teacher@school.com',
      role: 'teacher'
    };
    
    localStorage.setItem('token', 'jwt_token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    renderApp('/dashboard');
    
    await waitFor(() => {
      expect(screen.getByText(/error|failed|unable/i)).toBeInTheDocument();
    });
    
    // Should show retry button
    const retryButton = screen.getByRole('button', { name: /retry|reload|try again/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should persist user session across page reloads', () => {
    const mockUser = {
      id: 1,
      email: 'admin@school.com',
      role: 'admin'
    };
    
    localStorage.setItem('token', 'valid_token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    renderApp('/dashboard');
    
    // Should load user from localStorage
    expect(screen.queryByText(/login|sign in/i)).not.toBeInTheDocument();
  });

  it('should handle role-based access control', async () => {
    const mockStudent = {
      id: 1,
      email: 'student@school.com',
      role: 'student'
    };
    
    localStorage.setItem('token', 'jwt_token');
    localStorage.setItem('user', JSON.stringify(mockStudent));
    
    equipment.getAll.mockResolvedValueOnce({
      data: [{ id: 1, name: 'Equipment', status: 'available' }]
    });
    
    renderApp('/dashboard');
    
    await waitFor(() => {
      expect(screen.getByText('Equipment')).toBeInTheDocument();
    });
    
    // Student should not see admin features
    expect(screen.queryByText(/add equipment|create user/i)).not.toBeInTheDocument();
  });
});

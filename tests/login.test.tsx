/**
 * Unit tests for Login page
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import Login from '@/pages/login';
import api from '@/services/api';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/services/api');

describe('Login Page', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    localStorage.clear();
    jest.clearAllMocks();
  });
  
  it('should render login form', () => {
    render(<Login />);
    
    // Use heading role to distinguish from the submit button which also has text 'Login'
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
  
  it('should have default credentials pre-filled', () => {
    render(<Login />);
    
    const usernameInput = screen.getByLabelText('Username') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    
    expect(usernameInput.value).toBe('admin');
    expect(passwordInput.value).toBe('admin123');
  });
  
  it('should handle successful login', async () => {
    const mockResponse = {
      data: {
        access_token: 'test-token',
        token_type: 'bearer',
      },
    };
    
    (api.post as jest.Mock).mockResolvedValue(mockResponse);
    
    render(<Login />);
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(localStorage.getItem('library_token')).toBe('test-token');
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
  
  it('should handle login error', async () => {
    const mockError = {
      response: {
        data: {
          detail: 'Invalid credentials',
        },
      },
    };
    
    (api.post as jest.Mock).mockRejectedValue(mockError);
    
    render(<Login />);
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
    
    expect(localStorage.getItem('library_token')).toBeNull();
    expect(mockPush).not.toHaveBeenCalled();
  });
  
  it('should disable form during submission', async () => {
    (api.post as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 1000))
    );
    
    render(<Login />);
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/logging in/i)).toBeInTheDocument();
    });
  });
});

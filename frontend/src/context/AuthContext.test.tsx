// AuthContext.test.tsx

import React, { useContext } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthContext, AuthProvider } from './AuthContext';
import axiosInstance from '../AxiosInstance';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../AxiosInstance');
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

const TestComponent: React.FC = () => {
  const { isAuthenticated, login, register, logout, token } = useContext(AuthContext);

  return (
    <div>
      <p data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
      <p data-testid="token">{token}</p>
      <button onClick={() => login('testuser', 'password123')} data-testid="login-button">
        Login
      </button>
      <button onClick={() => register('newuser', 'newpassword')} data-testid="register-button">
        Register
      </button>
      <button onClick={logout} data-testid="logout-button">
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('provides default context values', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
      { wrapper: MemoryRouter }
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('token')).toHaveTextContent('');
  });

  it('loads token from localStorage on mount', () => {
    localStorage.setItem('token', 'mocked-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
      { wrapper: MemoryRouter }
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('token')).toHaveTextContent('mocked-token');
  });

  it('handles successful login', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { access_token: 'new-mocked-token' },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
      { wrapper: MemoryRouter }
    );

    userEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:3001/auth/login', {
        username: 'testuser',
        password: 'password123',
      });
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('token')).toHaveTextContent('new-mocked-token');
      expect(localStorage.getItem('token')).toBe('new-mocked-token');
    });
  });

  it('handles successful registration', async () => {
    mockedAxios.post.mockResolvedValueOnce({}); // Registration API call
    mockedAxios.post.mockResolvedValueOnce({
      data: { access_token: 'registered-token' },
    }); // Login after registration

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
      { wrapper: MemoryRouter }
    );

    userEvent.click(screen.getByTestId('register-button'));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:3001/auth/register', {
        username: 'newuser',
        password: 'newpassword',
      });
      expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:3001/auth/login', {
        username: 'newuser',
        password: 'newpassword',
      });
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('token')).toHaveTextContent('registered-token');
      expect(localStorage.getItem('token')).toBe('registered-token');
    });
  });

  it('handles logout correctly', async () => {
    localStorage.setItem('token', 'existing-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
      { wrapper: MemoryRouter }
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('token')).toHaveTextContent('existing-token');

    userEvent.click(screen.getByTestId('logout-button'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      expect(screen.getByTestId('token')).toHaveTextContent('');
      expect(localStorage.getItem('token')).toBeNull();
    });
  });
});

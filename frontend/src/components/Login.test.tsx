// Login.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import Login from './Login';
import { AuthContext } from '../context/AuthContext';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('Login Component', () => {
  const mockLogin = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  it('renders the Login component correctly', () => {
    render(
      <AuthContext.Provider
        value={{
          login: mockLogin,
          isAuthenticated: false,
          register: jest.fn(),
          logout: jest.fn(),
          token: null,
        }}
      >
        <Login />
      </AuthContext.Provider>,
      { wrapper: MemoryRouter }
    );

    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(
      screen.getByText("Register here")
    ).toBeInTheDocument();
  });

  it('allows the user to input username and password', async () => {
    render(
      <AuthContext.Provider
        value={{
          login: mockLogin,
          isAuthenticated: false,
          register: jest.fn(),
          logout: jest.fn(),
          token: null,
        }}
      >
        <Login />
      </AuthContext.Provider>,
      { wrapper: MemoryRouter }
    );

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');

    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(passwordInput, 'password123');

    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('password123');
  });

  it('calls the login function when the form is submitted', async () => {
    mockLogin.mockResolvedValueOnce(undefined);

    render(
      <AuthContext.Provider
        value={{
          login: mockLogin,
          isAuthenticated: false,
          register: jest.fn(),
          logout: jest.fn(),
          token: null,
        }}
      >
        <Login />
      </AuthContext.Provider>,
      { wrapper: MemoryRouter }
    );

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });

    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('displays an error message when login fails', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

    render(
      <AuthContext.Provider
        value={{
          login: mockLogin,
          isAuthenticated: false,
          register: jest.fn(),
          logout: jest.fn(),
          token: null,
        }}
      >
        <Login />
      </AuthContext.Provider>,
      { wrapper: MemoryRouter }
    );

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });

    await userEvent.type(usernameInput, 'wronguser');
    await userEvent.type(passwordInput, 'wrongpassword');
    await userEvent.click(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('wronguser', 'wrongpassword');
      expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('navigates to the register page when "Register here" is clicked', () => {
    render(
      <AuthContext.Provider
        value={{
          login: mockLogin,
          isAuthenticated: false,
          register: jest.fn(),
          logout: jest.fn(),
          token: null,
        }}
      >
        <Login />
      </AuthContext.Provider>,
      { wrapper: MemoryRouter }
    );

    const registerLink = screen.getByText('Register here');
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.getAttribute('href')).toBe('/register');
  });
});

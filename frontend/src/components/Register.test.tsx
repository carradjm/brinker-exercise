// Register.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import Register from './Register';
import { AuthContext } from '../context/AuthContext';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('Register Component', () => {
  const mockRegister = jest.fn();
  const mockNavigate = jest.fn();
  const mockUseNavigate = useNavigate as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigate.mockReturnValue(mockNavigate);
  });

  it('renders the Register component correctly', () => {
    render(
      <AuthContext.Provider
        value={{
          login: jest.fn(),
          register: mockRegister,
          logout: jest.fn(),
          isAuthenticated: false,
          token: null,
        }}
      >
        <Register />
      </AuthContext.Provider>,
      { wrapper: MemoryRouter }
    );

    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "Register" })).toBeInTheDocument();
    expect(
      screen.getByText(/Already have an account\?/i)
    ).toBeInTheDocument();
  });

  it('allows the user to input username and password', async () => {
    render(
      <AuthContext.Provider
        value={{
          login: jest.fn(),
          register: mockRegister,
          logout: jest.fn(),
          isAuthenticated: false,
          token: null,
        }}
      >
        <Register />
      </AuthContext.Provider>,
      { wrapper: MemoryRouter }
    );

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');

    await userEvent.type(usernameInput, 'newuser');
    await userEvent.type(passwordInput, 'password123');

    expect(usernameInput).toHaveValue('newuser');
    expect(passwordInput).toHaveValue('password123');
  });

  it('calls the register function with correct arguments upon form submission', async () => {
    mockRegister.mockResolvedValueOnce(undefined);

    render(
      <AuthContext.Provider
        value={{
          login: jest.fn(),
          register: mockRegister,
          logout: jest.fn(),
          isAuthenticated: false,
          token: null,
        }}
      >
        <Register />
      </AuthContext.Provider>,
      { wrapper: MemoryRouter }
    );

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const registerButton = screen.getByRole('button', { name: /register/i });

    await userEvent.type(usernameInput, 'newuser');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(registerButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('newuser', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('displays an error message when registration fails', async () => {
    mockRegister.mockRejectedValueOnce(new Error('Registration failed'));

    render(
      <AuthContext.Provider
        value={{
          login: jest.fn(),
          register: mockRegister,
          logout: jest.fn(),
          isAuthenticated: false,
          token: null,
        }}
      >
        <Register />
      </AuthContext.Provider>,
      { wrapper: MemoryRouter }
    );

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const registerButton = screen.getByRole('button', { name: /register/i });

    await userEvent.type(usernameInput, 'newuser');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(registerButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('newuser', 'password123');
      expect(screen.getByText('Registration failed')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('navigates to login page when "Login here" link is clicked', () => {
    render(
      <AuthContext.Provider
        value={{
          login: jest.fn(),
          register: mockRegister,
          logout: jest.fn(),
          isAuthenticated: false,
          token: null,
        }}
      >
        <Register />
      </AuthContext.Provider>,
      { wrapper: MemoryRouter }
    );

    const loginLink = screen.getByText('Login here');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.getAttribute('href')).toBe('/login');
  });
});

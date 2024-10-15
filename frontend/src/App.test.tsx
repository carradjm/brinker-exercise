// App.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { AuthContext } from './context/AuthContext';
import userEvent from '@testing-library/user-event';

describe('App Routing', () => {
  const renderWithAuth = (isAuthenticated: boolean, initialRoute: string = '/') => {
    const mockAuthContext = {
      isAuthenticated,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      token: isAuthenticated ? 'mocked-token' : null,
    };

    window.history.pushState({}, 'Test page', initialRoute);

    return render(
      <AuthContext.Provider value={mockAuthContext}>
        <App />
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders Login page on /login route', () => {
    renderWithAuth(false, '/login');

    expect(screen.getByRole('heading', { name: "Login" })).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "Login" })).toBeInTheDocument();
  });

  it('renders Register page on /register route', () => {
    renderWithAuth(false, '/register');

    expect(screen.getByRole('heading', { name: "Register" })).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "Register" })).toBeInTheDocument();
  });

  it('redirects to Login page when accessing protected route while unauthenticated', () => {
    renderWithAuth(false, '/');

    expect(screen.getByRole('heading', { name: "Login" })).toBeInTheDocument();
  });

  it('renders ProductList on "/" route when authenticated', () => {
    renderWithAuth(true, '/');

    expect(screen.getByRole('heading', { name: "Product List" })).toBeInTheDocument();
    expect(screen.getByText("Create New Product")).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders ProductForm on "/create" route when authenticated', () => {
    renderWithAuth(true, '/create');

    expect(screen.getByRole('heading', { name: "Create Product" })).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Price")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "Create" })).toBeInTheDocument();
  });

  it('allows navigation to protected routes when authenticated', async () => {
    renderWithAuth(true, '/');

    // Click on "Create New Product" link
    const createLink = screen.getByRole('link', { name: "Create New Product" });
    userEvent.click(createLink);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: "Create Product" })).toBeInTheDocument();
    });
  });

  it('does not allow navigation to protected routes when unauthenticated', () => {
    renderWithAuth(false, '/create');

    expect(screen.getByRole('heading', { name: "Login" })).toBeInTheDocument();
  });
});

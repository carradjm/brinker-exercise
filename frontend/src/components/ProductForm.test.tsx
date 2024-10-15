// ProductForm.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ProductForm from './ProductForm';
import { ProductContext } from '../context/ProductContext';
import { MemoryRouter, useNavigate, useParams } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import axiosInstance from '../AxiosInstance';

jest.mock('../AxiosInstance');
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));

describe('ProductForm Component', () => {
  const mockFetchProducts = jest.fn();
  const mockNavigate = jest.fn();
  const mockUseNavigate = useNavigate as jest.Mock;
  const mockUseParams = useParams as jest.Mock;
  const mockProducts: Product[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockFetchProducts.mockClear();
  });

  it('renders correctly in create mode', () => {
    mockUseParams.mockReturnValue({});

    render(
      <ProductContext.Provider value={{ products: mockProducts, fetchProducts: mockFetchProducts }}>
        <ProductForm />
      </ProductContext.Provider>,
      { wrapper: MemoryRouter }
    );

    expect(screen.getByText('Create Product')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Price')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
  });

  it('renders correctly in edit mode', async () => {
    mockUseParams.mockReturnValue({ id: '1' });
    mockedAxios.get.mockResolvedValueOnce({
      data: { id: 1, name: 'Test Product', price: 10 },
    });

    render(
      <ProductContext.Provider value={{ products: mockProducts, fetchProducts: mockFetchProducts }}>
        <ProductForm />
      </ProductContext.Provider>,
      { wrapper: MemoryRouter }
    );

    expect(screen.getByText('Loading product...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Edit Product')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
      expect(screen.getByDisplayValue('10')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
    });
  });

  it('renders correctly in view mode', async () => {
    mockUseParams.mockReturnValue({ id: '1' });
    const readOnly = true;
    mockedAxios.get.mockResolvedValueOnce({
      data: { id: 1, name: 'Test Product', price: 10 },
    });

    render(
      <ProductContext.Provider value={{ products: mockProducts, fetchProducts: mockFetchProducts }}>
        <ProductForm readOnly={readOnly} />
      </ProductContext.Provider>,
      { wrapper: MemoryRouter }
    );

    expect(screen.getByText('Loading product...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('View Product')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
      expect(screen.getByDisplayValue('10')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /update/i })
      ).not.toBeInTheDocument();
    });
  });

  it('allows the user to input product name and price', async () => {
    mockUseParams.mockReturnValue({});

    render(
      <ProductContext.Provider value={{ products: mockProducts, fetchProducts: mockFetchProducts }}>
        <ProductForm />
      </ProductContext.Provider>,
      { wrapper: MemoryRouter }
    );

    const nameInput = screen.getByLabelText('Name');
    const priceInput = screen.getByLabelText('Price');

    await userEvent.type(nameInput, 'New Product');
    await userEvent.clear(priceInput);
    await userEvent.type(priceInput, '25');

    expect(nameInput).toHaveValue('New Product');
    expect(priceInput).toHaveValue(25);
  });

  it('displays validation errors when inputs are invalid', async () => {
    mockUseParams.mockReturnValue({});

    render(
      <ProductContext.Provider value={{ products: mockProducts, fetchProducts: mockFetchProducts }}>
        <ProductForm />
      </ProductContext.Provider>,
      { wrapper: MemoryRouter }
    );

    const submitButton = screen.getByRole('button', { name: /create/i });

    await userEvent.click(submitButton);

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Price must be a positive number')).toBeInTheDocument();
  });

  it('submits the form successfully in create mode', async () => {
    mockUseParams.mockReturnValue({});
    mockedAxios.post.mockResolvedValueOnce({ data: {} });

    render(
      <ProductContext.Provider value={{ products: mockProducts, fetchProducts: mockFetchProducts }}>
        <ProductForm />
      </ProductContext.Provider>,
      { wrapper: MemoryRouter }
    );

    const nameInput = screen.getByLabelText('Name');
    const priceInput = screen.getByLabelText('Price');
    const submitButton = screen.getByRole('button', { name: /create/i });

    await userEvent.type(nameInput, 'New Product');
    await userEvent.clear(priceInput);
    await userEvent.type(priceInput, '30');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/products',
        { name: 'New Product', price: 30 }
      );
      expect(mockFetchProducts).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('submits the form successfully in edit mode', async () => {
    mockUseParams.mockReturnValue({ id: '1' });
    mockedAxios.get.mockResolvedValueOnce({
      data: { id: 1, name: 'Existing Product', price: 50 },
    });
    mockedAxios.put.mockResolvedValueOnce({ data: {} });

    render(
      <ProductContext.Provider value={{ products: mockProducts, fetchProducts: mockFetchProducts }}>
        <ProductForm />
      </ProductContext.Provider>,
      { wrapper: MemoryRouter }
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Existing Product')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText('Name');
    const priceInput = screen.getByLabelText('Price');
    const submitButton = screen.getByRole('button', { name: /update/i });

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Updated Product');
    await userEvent.clear(priceInput);
    await userEvent.type(priceInput, '60');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        'http://localhost:3000/products/1',
        { id: 1, name: 'Updated Product', price: 60 }
      );
      expect(mockFetchProducts).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('displays an error message when the API call fails', async () => {
    mockUseParams.mockReturnValue({});
    mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));

    render(
      <ProductContext.Provider value={{ products: mockProducts, fetchProducts: mockFetchProducts }}>
        <ProductForm />
      </ProductContext.Provider>,
      { wrapper: MemoryRouter }
    );

    const nameInput = screen.getByLabelText('Name');
    const priceInput = screen.getByLabelText('Price');
    const submitButton = screen.getByRole('button', { name: /create/i });

    await userEvent.type(nameInput, 'New Product');
    await userEvent.clear(priceInput);
    await userEvent.type(priceInput, '30');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalled();
      expect(mockFetchProducts).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('navigates back when the back button is clicked', async () => {
    mockUseParams.mockReturnValue({});

    render(
      <ProductContext.Provider value={{ products: mockProducts, fetchProducts: mockFetchProducts }}>
        <ProductForm />
      </ProductContext.Provider>,
      { wrapper: MemoryRouter }
    );

    const backButton = screen.getByRole('button', { name: /back/i });
    await userEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('displays loading indicator while fetching data', async () => {
    mockUseParams.mockReturnValue({ id: '1' });
    const resolveGet = new Promise((resolve) => {
      setTimeout(() => resolve({ data: { id: 1, name: 'Product', price: 20 } }), 100);
    });
    mockedAxios.get.mockReturnValueOnce(resolveGet as any);

    render(
      <ProductContext.Provider value={{ products: mockProducts, fetchProducts: mockFetchProducts }}>
        <ProductForm />
      </ProductContext.Provider>,
      { wrapper: MemoryRouter }
    );

    expect(screen.getByText('Loading product...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Product')).toBeInTheDocument();
    });
  });
});

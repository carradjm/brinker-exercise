// ProductList.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ProductList from './ProductList';
import { ProductContext } from '../context/ProductContext';
import { MemoryRouter } from 'react-router-dom';
import axiosInstance from '../AxiosInstance';
import userEvent from '@testing-library/user-event';

jest.mock('../AxiosInstance');
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe('ProductList Component', () => {
  const mockFetchProducts = jest.fn();
  const mockProducts = [
    { id: 1, name: 'Product One', price: 10 },
    { id: 2, name: 'Product Two', price: 20 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders product list when products are available', () => {
    render(
      <ProductContext.Provider value={{ products: mockProducts, fetchProducts: mockFetchProducts }}>
        <ProductList />
      </ProductContext.Provider>,
      { wrapper: MemoryRouter }
    );

    expect(screen.getByText('Product List')).toBeInTheDocument();
    expect(screen.getByText('Create New Product')).toBeInTheDocument();

    expect(screen.getByText('Product One')).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument();
    expect(screen.getByText('Product Two')).toBeInTheDocument();
    expect(screen.getByText('$20.00')).toBeInTheDocument();

    const viewLinks = screen.getAllByText('View');
    expect(viewLinks.length).toBe(2);

    const editLinks = screen.getAllByText('Edit');
    expect(editLinks.length).toBe(2);

    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons.length).toBe(2);
  });

  it('calls delete API and refreshes products when delete button is clicked', async () => {
    mockedAxios.delete.mockResolvedValueOnce({ data: {} });
    render(
      <ProductContext.Provider value={{ products: mockProducts, fetchProducts: mockFetchProducts }}>
        <ProductList />
      </ProductContext.Provider>,
      { wrapper: MemoryRouter }
    );

    const deleteButtons = screen.getAllByText('Delete');
    await userEvent.click(deleteButtons[0]);

    expect(mockedAxios.delete).toHaveBeenCalledWith('http://localhost:3000/products/1');
    await waitFor(() => {
      expect(mockFetchProducts).toHaveBeenCalled();
    });
  });

  it('navigates to create new product when Create New Product link is clicked', () => {
    render(
      <ProductContext.Provider value={{ products: mockProducts, fetchProducts: mockFetchProducts }}>
        <ProductList />
      </ProductContext.Provider>,
      { wrapper: MemoryRouter }
    );

    const createLink = screen.getByText('Create New Product');
    expect(createLink.getAttribute('href')).toBe('/create');
  });

  it('renders View and Edit links with correct URLs', () => {
    render(
      <ProductContext.Provider value={{ products: mockProducts, fetchProducts: mockFetchProducts }}>
        <ProductList />
      </ProductContext.Provider>,
      { wrapper: MemoryRouter }
    );

    const viewLinks = screen.getAllByText('View');
    const editLinks = screen.getAllByText('Edit');

    expect(viewLinks[0].getAttribute('href')).toBe('/view/1');
    expect(editLinks[0].getAttribute('href')).toBe('/edit/1');

    expect(viewLinks[1].getAttribute('href')).toBe('/view/2');
    expect(editLinks[1].getAttribute('href')).toBe('/edit/2');
  });
});

// ProductContext.test.tsx

import React, { useContext } from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ProductContext, ProductProvider } from './ProductContext';
import axiosInstance from '../AxiosInstance';

jest.mock('../AxiosInstance');
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

interface Product {
  id: number;
  name: string;
  price: number;
}

const TestComponent: React.FC = () => {
  const { products, fetchProducts } = useContext(ProductContext);

  return (
    <div>
      <ul data-testid="product-list">
        {products.map((product) => (
          <li key={product.id} data-testid={`product-${product.id}`}>
            {product.name} - ${product.price.toFixed(2)}
          </li>
        ))}
      </ul>
      <button onClick={fetchProducts}>Fetch Products</button>
    </div>
  );
};

describe('ProductContext', () => {
  const mockProducts: Product[] = [
    { id: 1, name: 'Product One', price: 10 },
    { id: 2, name: 'Product Two', price: 20 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides initial empty products and fetches products on mount', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockProducts });

    render(
      <ProductProvider>
        <TestComponent />
      </ProductProvider>
    );

    expect(screen.getByTestId('product-list')).toBeEmptyDOMElement();
    expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3000/products');

    await waitFor(() => {
      expect(screen.getByTestId('product-1')).toHaveTextContent('Product One - $10.00');
      expect(screen.getByTestId('product-2')).toHaveTextContent('Product Two - $20.00');
    });
  });

  it('updates products when fetchProducts is called', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockProducts });

    render(
      <ProductProvider>
        <TestComponent />
      </ProductProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('product-1')).toHaveTextContent('Product One - $10.00');
      expect(screen.getByTestId('product-2')).toHaveTextContent('Product Two - $20.00');
    });

    const newProducts: Product[] = [
      { id: 3, name: 'Product Three', price: 30 },
      { id: 4, name: 'Product Four', price: 40 },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: newProducts });

    fireEvent.click(screen.getByText('Fetch Products'));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId('product-3')).toHaveTextContent('Product Three - $30.00');
      expect(screen.getByTestId('product-4')).toHaveTextContent('Product Four - $40.00');
    });
  });

  it('handles fetchProducts failure gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    mockedAxios.get.mockRejectedValueOnce(new Error('Fetch failed'));

    render(
      <ProductProvider>
        <TestComponent />
      </ProductProvider>
    );

    expect(screen.getByTestId('product-list')).toBeEmptyDOMElement();
    expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3000/products');

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching products:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });
});

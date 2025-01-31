import { createContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance from '../AxiosInstance';

interface ProductContextProps {
  products: Product[];
  fetchProducts: () => void;
}

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductContext = createContext<ProductContextProps>({
  products: [],
  fetchProducts: () => { },
});

export const ProductProvider = ({ children }: ProductProviderProps) => {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = () => {
    axiosInstance
      .get<Product[]>('http://localhost:3000/products')
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, fetchProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

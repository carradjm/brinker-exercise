import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate, NavigateFunction } from 'react-router-dom';
import axiosInstance from '../AxiosInstance';
import { ProductContext } from '../context/ProductContext';

interface Product {
  id?: number;
  name: string;
  price: number;
}

interface Props {
  readOnly?: boolean;
}

const ProductForm: React.FC<Props> = ({ readOnly }) => {
  const { id } = useParams<{ id: string }>();
  const navigate: NavigateFunction = useNavigate();
  const [product, setProduct] = useState<Product>({ name: '', price: 0 });
  const { fetchProducts } = useContext(ProductContext);
  const [loading, setLoading] = useState<boolean>(!!id);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  useEffect(() => {
    if (id) {
      axiosInstance.get<Product>(`http://localhost:3000/products/${id}`)
        .then(response => {
          setProduct(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching product:', error);
          setLoading(false);
        });
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setProduct((prevProduct) => ({
      ...prevProduct,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; price?: string } = {};

    if (!product.name) {
      newErrors.name = 'Name is required';
    }
    if (product.price === undefined || product.price < 0) {
      newErrors.price = 'Price must be a positive number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    if (id) {
      // Update product
      axiosInstance.put(`http://localhost:3000/products/${id}`, product)
        .then(() => {
          fetchProducts(); // Refresh the products list
          navigate('/');
        })
        .catch(error => {
          console.error('Error updating product:', error);
        });
    } else {
      // Create product
      axiosInstance.post('http://localhost:3000/products', product)
        .then(() => {
          fetchProducts(); // Refresh the products list
          navigate('/');
        })
        .catch(error => {
          console.error('Error creating product:', error);
        });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-center">Loading product...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold text-center">
          {readOnly ? 'View Product' : id ? 'Edit Product' : 'Create Product'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Name</label>
            <input
              name="name"
              value={product.name}
              onChange={handleChange}
              readOnly={readOnly}
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readOnly ? 'bg-gray-100' : ''
                }`}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Price</label>
            <input
              name="price"
              type="number"
              value={product.price}
              onChange={handleChange}
              readOnly={readOnly}
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readOnly ? 'bg-gray-100' : ''
                }`}
            />
            {errors.price && (
              <p className="text-sm text-red-500 mt-1">{errors.price}</p>
            )}
          </div>
          {!readOnly && (
            <button
              type="submit"
              className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {id ? 'Update' : 'Create'}
            </button>
          )}
        </form>
        <button
          onClick={() => navigate(-1)}
          className="w-full px-4 py-2 font-semibold text-white bg-gray-600 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default ProductForm;

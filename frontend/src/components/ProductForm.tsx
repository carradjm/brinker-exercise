import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate, NavigateFunction } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
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
    return <p>Loading product...</p>;
  }

  return (
    <div>
      <h1>{readOnly ? 'View Product' : id ? 'Edit Product' : 'Create Product'}</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            name="name"
            value={product.name}
            onChange={handleChange}
            readOnly={readOnly}
          />
        </div>
        <div>
          <label>Price:</label>
          <input
            name="price"
            type="number"
            value={product.price}
            onChange={handleChange}
            readOnly={readOnly}
          />
        </div>
        {!readOnly && <button type="submit">{id ? 'Update' : 'Create'}</button>}
      </form>
      <button onClick={() => navigate(-1)}>Back</button>
    </div>
  );
};

export default ProductForm;

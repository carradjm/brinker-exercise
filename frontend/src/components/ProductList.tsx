import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ProductContext } from '../context/ProductContext';

interface Product {
  id: number;
  name: string;
  price: number;
}

const ProductList: React.FC = () => {
  const { products, fetchProducts } = useContext(ProductContext);
  const [loading, setLoading] = useState<boolean>(products.length === 0);

  useEffect(() => {
    if (loading) {
      fetchProducts();
      setLoading(false);
    }
  }, [loading, fetchProducts]);

  const handleDelete = (id: number) => {
    axios.delete(`http://localhost:3000/products/${id}`)
      .then(() => {
        fetchProducts();
      })
      .catch(error => {
        console.error('Error deleting product:', error);
      });
  };


  if (loading) {
    return <p>Loading products...</p>;
  }

  return (
    <div>
      <h1>Product List</h1>
      <Link to="/create">Create New Product</Link>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>${product.price}</td>
              <td>
                <Link to={`/view/${product.id}`}>View</Link>
                {' | '}
                <Link to={`/edit/${product.id}`}>Edit</Link>
                {' | '}
                <button onClick={() => handleDelete(product.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;

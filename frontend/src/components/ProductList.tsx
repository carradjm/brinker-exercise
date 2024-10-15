import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductContext } from '../context/ProductContext';
import axiosInstance from '../api/axiosInstance';

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
    axiosInstance.delete(`http://localhost:3000/products/${id}`)
      .then(() => {
        fetchProducts();
      })
      .catch(error => {
        console.error('Error deleting product:', error);
      });
  };


  if (loading) {
    return <p className="text-center mt-4">Loading products...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="mb-6 text-3xl font-bold text-center">Product List</h1>
      <div className="flex justify-end mb-4">
        <Link
          to="/create"
          className="px-4 py-2 font-semibold text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Create New Product
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Name
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Price
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-t hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-2 text-sm text-gray-800">{product.name}</td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  ${product.price.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  <div className="flex space-x-2">
                    <Link
                      to={`/view/${product.id}`}
                      className="text-indigo-600 hover:underline"
                    >
                      View
                    </Link>
                    <Link
                      to={`/edit/${product.id}`}
                      className="text-green-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:underline focus:outline-none"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;

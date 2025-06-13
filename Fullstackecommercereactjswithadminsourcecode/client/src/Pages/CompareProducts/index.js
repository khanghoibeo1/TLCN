import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CompareProducts = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('compareList')) || [];
    setProducts(stored);
  }, []);

  const handleRemove = (id) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    localStorage.setItem('compareList', JSON.stringify(updated));
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f9fafb',
        padding: '40px 20px',
      }}
    >
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '2rem' }}>
        Compare Products
      </h1>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {[0, 1].map((index) => {
          const product = products[index];

          return (
            <div
              key={index}
              style={{
                flex: '1 1 45%',
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: '500px',
              }}
            >
              {product ? (
                <>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{ height: '160px', objectFit: 'contain', marginBottom: '1rem' }}
                  />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '600', textAlign: 'center', marginBottom: '0.5rem' }}>
                    {product.name}
                  </h2>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    <strong>Brand:</strong> {product.brand}
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    <strong>Rating:</strong> {product.rating}
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem', textAlign: 'center', marginBottom: '0.75rem' }}>
                    <strong>Description:</strong> {product.description}
                  </p>
                  <p style={{ color: '#059669', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                    ${product.price}
                    {product.oldPrice && (
                      <span
                        style={{
                          textDecoration: 'line-through',
                          color: '#9ca3af',
                          fontSize: '1rem',
                          marginLeft: '0.5rem',
                        }}
                      >
                        ${product.oldPrice}
                      </span>
                    )}
                  </p>
                  <button
                    onClick={() => handleRemove(product.id)}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '0.5rem 1.25rem',
                      borderRadius: '0.5rem',
                      transition: '0.3s',
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = '#dc2626')}
                    onMouseOut={(e) => (e.target.style.backgroundColor = '#ef4444')}
                  >
                    Delete
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/')}
                  style={{
                    border: '2px dashed #3b82f6',
                    color: '#3b82f6',
                    fontSize: '1.125rem',
                    fontWeight: '500',
                    padding: '3rem 1rem',
                    width: '100%',
                    borderRadius: '0.75rem',
                    backgroundColor: '#f0f9ff',
                    transition: '0.3s',
                    textAlign: 'center',
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = '#e0f2fe')}
                  onMouseOut={(e) => (e.target.style.backgroundColor = '#f0f9ff')}
                >
                  Add Product
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CompareProducts;

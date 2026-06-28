
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <Motion.div
      className="product-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Link to={`/product/${product.id}`} className="product-image-container">
        <img src={product.image} alt={product.name} className="product-image" />
      </Link>

      <div className="product-info">
        <h3 className="product-name" onClick={() => navigate(`/product/${product.id}`)}>{product.name}</h3>
        <p className="product-price">₦{product.price?.toLocaleString()}</p>
        <button className={`pc-cart-btn ${added ? 'pc-cart-btn--added' : ''}`} onClick={handleAddToCart}>
          {added ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </Motion.div>
  );
};

export const ProductCardSkeleton = () => (
  <div className="product-card product-card-skeleton" aria-hidden="true">
    <div className="product-image-container skeleton-block skeleton-image-block" />
    <div className="product-info">
      <div className="skeleton-block skeleton-name-line" />
      <div className="skeleton-block skeleton-price-line" />
      <div className="skeleton-block skeleton-button-line" />
    </div>
  </div>
);

export default ProductCard;

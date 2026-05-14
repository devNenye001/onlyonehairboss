
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { HiOutlineShoppingBag, HiOutlineHeart } from 'react-icons/hi';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  return (
    <Motion.div 
      className="product-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="product-image-container">
        <img src={product.image} alt={product.name} className="product-image" />
        <div className="product-actions">
          <Motion.button whileHover={{ scale: 1.1 }} className="action-btn">
            <HiOutlineHeart />
          </Motion.button>
          <Motion.button whileHover={{ scale: 1.1 }} className="action-btn">
            <HiOutlineShoppingBag />
          </Motion.button>
        </div>
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">₦{product.price.toLocaleString()}</p>
        <Link to={`/product/${product.id}`} className="view-btn">
          View Details
        </Link>
      </div>
    </Motion.div>
  );
};

export default ProductCard;
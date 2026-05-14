import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { HiOutlineShoppingBag, HiArrowLeft } from 'react-icons/hi';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { supabase } from '../../utils/supabase/client';
import { useCart } from '../../context/CartContext';
import './ProductDetails.css';

const FALLBACK = [
  { id: '1', name: 'Layered Bone Straight', price: 270000, images: ['/wig1.svg'], description: 'Premium quality layered bone straight wig crafted for a flawless, natural look.', category: 'Bone Straight', in_stock: true },
  { id: '2', name: 'Short Wavy', price: 270000, images: ['/wig2.svg'], description: 'Effortlessly chic short wavy wig with rich volume.', category: 'Wavy', in_stock: true },
  { id: '3', name: 'Pixie Curls', price: 270000, images: ['/wig3.svg'], description: 'Bold and beautiful pixie curls for a statement look.', category: 'Curly', in_stock: true },
  { id: '4', name: 'Bone Straight', price: 270000, images: ['/wig4.svg'], description: 'Classic bone straight wig with silky finish.', category: 'Bone Straight', in_stock: true },
  { id: '5', name: 'Layered Frontal', price: 270000, images: ['/wig5.svg'], description: 'Luxurious layered frontal wig for a natural hairline.', category: 'Frontal', in_stock: true },
  { id: '6', name: 'Short Wavy Bob', price: 270000, images: ['/wig6.svg'], description: 'Trendy short wavy bob for everyday elegance.', category: 'Bob', in_stock: true },
  { id: '7', name: 'Deep Wave Curls', price: 270000, images: ['/wig7.svg'], description: 'Rich deep wave curls with full body volume.', category: 'Deep Wave', in_stock: true },
  { id: '8', name: 'Bone Straight Lace', price: 270000, images: ['/wig8.svg'], description: 'Premium bone straight lace wig for a seamless blend.', category: 'Bone Straight', in_stock: true },
];

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      if (data) setProduct(data);
      else setProduct(FALLBACK.find(p => p.id === id) ?? null);
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] ?? product.image ?? '',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!product) return (
    <div className="pd-page">
      <Navbar />
      <div className="pd-loading">Loading product...</div>
      <Footer />
    </div>
  );

  const images = Array.isArray(product.images) && product.images.length ? product.images : [product.image ?? '/wig1.svg'];

  return (
    <div className="pd-page">
      <Navbar />
      <main className="pd-container">
        <button className="pd-back-btn" onClick={() => navigate(-1)}>
          <HiArrowLeft /> Back
        </button>

        <div className="pd-grid">
          {/* Image Gallery */}
          <Motion.div
            className="pd-gallery"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="pd-main-img-wrap">
              <img src={images[activeImg]} alt={product.name} className="pd-main-img" />
            </div>
            {images.length > 1 && (
              <div className="pd-thumbs">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    className={`pd-thumb ${activeImg === i ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)}
                  />
                ))}
              </div>
            )}
          </Motion.div>

          {/* Info */}
          <Motion.div
            className="pd-info"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="pd-category">{product.category}</p>
            <h1 className="pd-name">{product.name}</h1>
            <p className="pd-price">₦{product.price.toLocaleString()}</p>
            <p className="pd-desc">{product.description || 'Premium quality wig crafted for a flawless, natural look with rich volume and a silky finish.'}</p>

            <div className="pd-stock">
              <span className={`pd-stock-badge ${product.in_stock ? 'in' : 'out'}`}>
                {product.in_stock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <button
              className="pd-cart-btn"
              onClick={handleAddToCart}
              disabled={!product.in_stock}
            >
              <HiOutlineShoppingBag />
              {added ? 'Added to Cart!' : 'Add to Cart'}
            </button>

            <div className="pd-meta">
              <p>Category: <span>{product.category || '—'}</span></p>
              <p>Note: <span>Order processing takes 3 working days.</span></p>
            </div>
          </Motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetails;

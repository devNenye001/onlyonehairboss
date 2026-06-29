import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { HiOutlineShoppingBag, HiArrowLeft, HiX } from 'react-icons/hi';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ProductCard from '../../components/ProductCard/ProductCard';
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

const formatPrice = (price) => `₦${Number(price || 0).toLocaleString()}`;

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  
  // Related Products
  const [related, setRelated] = useState([]);
  
  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [qvActiveImg, setQvActiveImg] = useState(0);
  const [qvAdded, setQvAdded] = useState(false);
  
  // Toast Alert
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      if (data) {
        setProduct(data);
      } else {
        const fallbackProd = FALLBACK.find(p => p.id === id) ?? null;
        setProduct(fallbackProd);
      }
    };
    fetchProduct();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveImg(0);
  }, [id]);

  useEffect(() => {
    if (!product) return;
    const fetchRelated = async () => {
      try {
        const { data: allProds } = await supabase.from('products').select('*').eq('in_stock', true);
        const sourceList = allProds && allProds.length > 0 ? allProds : FALLBACK;
        
        // Filter out current
        const others = sourceList.filter(p => p.id !== product.id);
        
        // Prioritize same category, then featured
        const sameCat = others.filter(p => p.category?.toLowerCase() === product.category?.toLowerCase());
        const diffCat = others.filter(p => p.category?.toLowerCase() !== product.category?.toLowerCase());
        
        const sorted = [
          ...sameCat.filter(p => p.is_featured),
          ...sameCat.filter(p => !p.is_featured),
          ...diffCat.filter(p => p.is_featured),
          ...diffCat.filter(p => !p.is_featured)
        ];
        
        setRelated(sorted.slice(0, 4));
      } catch (err) {
        console.error('Error fetching related products:', err);
      }
    };
    fetchRelated();
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: (Array.isArray(product.images) ? product.images[0] : product.images) ?? product.image ?? '/wig1.svg',
    });
    setAdded(true);
    setToastMsg(`${product.name} added to cart!`);
    setTimeout(() => {
      setAdded(false);
      setToastMsg('');
    }, 2000);
  };

  const handleQvAddToCart = () => {
    if (!quickViewProduct) return;
    addItem({
      id: quickViewProduct.id,
      name: quickViewProduct.name,
      price: quickViewProduct.price,
      image: (Array.isArray(quickViewProduct.images) ? quickViewProduct.images[0] : quickViewProduct.images) ?? quickViewProduct.image ?? '/wig1.svg',
    });
    setQvAdded(true);
    setToastMsg(`${quickViewProduct.name} added to cart!`);
    setTimeout(() => {
      setQvAdded(false);
      setToastMsg('');
    }, 2000);
  };

  const handleCardAddToCart = (p, e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: p.id,
      name: p.name,
      price: p.price,
      image: (Array.isArray(p.images) ? p.images[0] : p.images) ?? p.image ?? '/wig1.svg',
    });
    setToastMsg(`${p.name} added to cart!`);
    setTimeout(() => {
      setToastMsg('');
    }, 2000);
  };

  const openQuickView = (p, e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProduct(p);
    setQvActiveImg(0);
    setQvAdded(false);
  };

  if (!product) return (
    <div className="pd-page">
      <Navbar />
      <div className="pd-loading">Loading product...</div>
      <Footer />
    </div>
  );

  const images = Array.isArray(product.images) ? product.images
    : product.images ? [product.images]
    : [product.image ?? '/wig1.svg'];

  const qvImages = quickViewProduct
    ? (Array.isArray(quickViewProduct.images) ? quickViewProduct.images
      : quickViewProduct.images ? [quickViewProduct.images]
      : [quickViewProduct.image ?? '/wig1.svg'])
    : [];

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
            <h1 className="pd-name">{product.name}</h1>
            <p className="pd-price">{formatPrice(product.price)}</p>
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
              <p>Weight: <span>{product.weight_g ? `${product.weight_g}g` : '1000g'}</span></p>
              <p>Note: <span>Order processing takes 3 working days.</span></p>
            </div>
          </Motion.div>
        </div>

        {/* You May Also Like Section */}
        {related.length > 0 && (
          <section className="pd-related-section">
            <h2 className="pd-related-headline">More Wigs You'll Love</h2>
            <div className="pd-related-grid">
              {related.map(p => {
                const cardProduct = {
                  id: p.id,
                  name: p.name,
                  price: p.price,
                  image: (Array.isArray(p.images) ? p.images[0] : p.images) || p.image || '/wig1.svg',
                };
                return <ProductCard key={p.id} product={cardProduct} />;
              })}
            </div>
          </section>
        )}
      </main>

      {/* Quick View Modal Overlay */}
      {quickViewProduct && (
        <div className="qv-modal-backdrop" onClick={() => setQuickViewProduct(null)}>
          <div className="qv-modal" role="dialog" aria-modal="true" aria-labelledby="quick-view-title" onClick={e => e.stopPropagation()}>
            <button className="qv-close-btn" onClick={() => setQuickViewProduct(null)} aria-label="Close quick view">
              <HiX />
            </button>
            <div className="qv-grid">
              {/* Image Column */}
              <div>
                <div className="qv-image-wrap">
                  <img src={qvImages[qvActiveImg]} alt={quickViewProduct.name} className="qv-main-img" />
                </div>
                {qvImages.length > 1 && (
                  <div className="qv-thumbs">
                    {qvImages.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt=""
                        className={`qv-thumb ${qvActiveImg === i ? 'active' : ''}`}
                        onClick={() => setQvActiveImg(i)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Details Column */}
              <div className="qv-details">
                <p className="qv-category">{quickViewProduct.category}</p>
                <h2 className="qv-name" id="quick-view-title">{quickViewProduct.name}</h2>
                <p className="qv-price">{formatPrice(quickViewProduct.price)}</p>
                <p className="qv-desc">{quickViewProduct.description || 'Premium quality wig crafted for a flawless, natural look with rich volume and a silky finish.'}</p>
                
                <div className="qv-stock">
                  <span className={`qv-stock-badge ${quickViewProduct.in_stock ? 'in' : 'out'}`}>
                    {quickViewProduct.in_stock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                <button
                  className="qv-cart-btn"
                  onClick={handleQvAddToCart}
                  disabled={!quickViewProduct.in_stock}
                >
                  <HiOutlineShoppingBag />
                  {qvAdded ? 'Added!' : 'Add to Cart'}
                </button>

                <Link
                  to={`/product/${quickViewProduct.id}`}
                  className="qv-link"
                  onClick={() => setQuickViewProduct(null)}
                >
                  View Full Details →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Toast Alert */}
      {toastMsg && (
        <div className="pd-toast">
          <HiOutlineShoppingBag /> {toastMsg}
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ProductDetails;

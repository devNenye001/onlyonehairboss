import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { HiOutlineShoppingBag } from 'react-icons/hi';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ProductCard, { ProductCardSkeleton } from '../../components/ProductCard/ProductCard';
import { supabase } from '../../utils/supabase/client';
import './ShopPage.css';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase.from('products').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!cancelled) {
          setProducts(error || !data?.length ? [] : data);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const toCard = (p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    compare_at_price: p.compare_at_price,
    image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : (p.image || p.images || ''),
  });

  return (
    <div className="shop-page-full">
      <Navbar />
      <main className="shop-full-container">
        <div className="shop-full-header">
          <p className="shop-full-tag">Shop</p>
          <h1 className="shop-full-headline">Our Collection</h1>
        </div>

        {loading ? (
          <div className="shop-full-grid" aria-label="Loading products">
            {Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="shop-empty-container">
            <div className="shop-empty-icon-wrap">
              <HiOutlineShoppingBag />
            </div>
            <h2 className="shop-empty-title">No wigs available yet</h2>
            <p className="shop-empty-text">
              We’re preparing something beautiful for our collection. Check back soon.
            </p>
            <Link to="/" className="shop-empty-btn">
              Back to Home
            </Link>
          </div>
        ) : (
          <Motion.div
            className="shop-full-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {products.map(p => (
              <ProductCard key={p.id} product={toCard(p)} />
            ))}
          </Motion.div>
        )}

        <section className="shop-full-banner">
          <Motion.div
            className="banner-content"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <img src="/logo.svg" alt="OnlyOne Hairboss" className="banner-logo" />
            <h2 className="banner-text">Luxury Hair. Timeless Beauty.</h2>
          </Motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ShopPage;

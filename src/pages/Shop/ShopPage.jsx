import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { HiOutlineShoppingBag } from 'react-icons/hi';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ProductCard, { ProductCardSkeleton } from '../../components/ProductCard/ProductCard';
import { supabase } from '../../utils/supabase/client';
import './ShopPage.css';

const CATEGORIES = ['All', 'Frontal', 'Bob', 'Deep Wave', 'Bone Straight', 'Curly', 'Wavy'];

const FALLBACK = [
  { id: '1', name: 'Layered Bone Straight', price: 270000, images: ['/wig1.svg'], category: 'Bone Straight' },
  { id: '2', name: 'Short Wavy', price: 270000, images: ['/wig2.svg'], category: 'Wavy' },
  { id: '3', name: 'Pixie Curls', price: 270000, images: ['/wig3.svg'], category: 'Curly' },
  { id: '4', name: 'Bone Straight', price: 270000, images: ['/wig4.svg'], category: 'Bone Straight' },
  { id: '5', name: 'Layered Frontal', price: 270000, images: ['/wig5.svg'], category: 'Frontal' },
  { id: '6', name: 'Short Wavy Bob', price: 270000, images: ['/wig6.svg'], category: 'Bob' },
  { id: '7', name: 'Deep Wave Curls', price: 270000, images: ['/wig7.svg'], category: 'Deep Wave' },
  { id: '8', name: 'Bone Straight Lace', price: 270000, images: ['/wig8.svg'], category: 'Bone Straight' },
];

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'All';

  useEffect(() => {
    let cancelled = false;
    supabase.from('products').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!cancelled) {
          setProducts(error || !data?.length ? FALLBACK : data);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const filtered = activeCategory === 'All'
    ? products
    : products.filter(p => p.category?.toLowerCase() === activeCategory.toLowerCase());

  const toCard = (p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image: Array.isArray(p.images) ? p.images[0] : p.images || p.image || '/wig1.svg',
  });

  return (
    <div className="shop-page-full">
      <Navbar />
      <main className="shop-full-container">
        <div className="shop-full-header">
          <p className="shop-full-tag">Shop</p>
          <h1 className="shop-full-headline">Our Collection</h1>
        </div>

        <div className="shop-filter-bar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setSearchParams(cat === 'All' ? {} : { category: cat })}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="shop-full-grid" aria-label="Loading products">
            {Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="shop-empty-container">
            <div className="shop-empty-icon-wrap">
              <HiOutlineShoppingBag />
            </div>
            <h2 className="shop-empty-title">No wigs in this category yet</h2>
            <p className="shop-empty-text">
              We’re preparing something beautiful for this collection. Check back soon or explore other styles.
            </p>
            <button className="shop-empty-btn" onClick={() => setSearchParams({})}>
              Explore All Wigs
            </button>
          </div>
        ) : (
          <Motion.div
            className="shop-full-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {filtered.map(p => (
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

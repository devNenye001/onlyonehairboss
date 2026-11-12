import { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import './Shop.css';
import ProductCard, { ProductCardSkeleton } from '../../ProductCard/ProductCard';
import { supabase } from '../../../utils/supabase/client';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [colConfig, setColConfig] = useState({
    title: 'Our Collection',
    image_url: '/logo.svg',
    banner_text: 'Luxury Hair. Timeless Beauty.'
  });

  useEffect(() => {
    const loadShopData = async () => {
      try {
        // 1. Load config
        const { data: configData } = await supabase.from('site_content').select('*').eq('key', 'collection_section').maybeSingle();
        const config = configData?.value || {};
        setColConfig(prev => ({ ...prev, ...config, description: '' }));

        // 2. Load products
        const { data: prodData } = await supabase.from('products').select('id, name, price, images, created_at').eq('in_stock', true);
        if (prodData && prodData.length > 0) {
          const mapped = prodData.map(p => ({ ...p, image: Array.isArray(p.images) ? p.images[0] : (p.images || p.image || '') }));
          
          if (config.product_ids && config.product_ids.length > 0) {
            const ordered = config.product_ids
              .map(id => mapped.find(p => p.id === id))
              .filter(Boolean);
            if (ordered.length > 0) {
              setProducts(ordered.slice(0, 8));
              return;
            }
          }
          
          // Latest 8 products
          const sorted = [...prodData].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
          setProducts(sorted.map(p => ({ ...p, image: Array.isArray(p.images) ? p.images[0] : (p.images || p.image || '') })).slice(0, 8));
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Failed to load shop section data:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadShopData();
  }, []);

  return (
    <div className="shop-page">
      <main className="shop-container">
        <div className="shop-header">
          <p className="shop-tag" style={{ color: "#995544" }}>Shop</p>
          <h1 className="taprom-headline">{colConfig.title}</h1>
        </div>

        {loading ? (
          <div className="product-grid" aria-label="Loading products">
            {Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '40px 0 60px', fontSize: '0.98rem' }}>
            Our collection is being updated. Check back soon.
          </p>
        ) : (
          <div className="product-grid">
            {products.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        )}

        <section className="shop-banner">
          <Motion.div
            className="banner-content"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <img src={colConfig.image_url || "/logo.svg"} alt="OnlyOne Hairboss" className="banner-logo" />
            <h2 className="banner-text">{colConfig.banner_text || "Luxury Hair. Timeless Beauty."}</h2>
          </Motion.div>
        </section>
      </main>
    </div>
  );
};

export default Shop;

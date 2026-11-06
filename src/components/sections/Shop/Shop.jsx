
import { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import './Shop.css';
import ProductCard, { ProductCardSkeleton } from '../../ProductCard/ProductCard';
import { supabase } from '../../../utils/supabase/client';
import { FALLBACK_PRODUCTS } from '../../../utils/fallbackProducts';

const INITIAL_FALLBACK = FALLBACK_PRODUCTS.slice(0, 8);

const Shop = () => {
  const [products, setProducts] = useState(INITIAL_FALLBACK);
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
          const mapped = prodData.map(p => ({ ...p, image: Array.isArray(p.images) ? p.images[0] : (p.images || p.image || '/wig1.jpg') }));
          
          if (config.product_ids && config.product_ids.length > 0) {
            const ordered = config.product_ids
              .map(id => mapped.find(p => p.id === id))
              .filter(Boolean);
            if (ordered.length > 0) {
              setProducts(ordered.slice(0, 8));
              return;
            }
          }
          
          // Fallback to latest 8 products
          const sorted = [...prodData].sort((a,b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
          setProducts(sorted.map(p => ({ ...p, image: Array.isArray(p.images) ? p.images[0] : (p.images || p.image || '/wig1.jpg') })).slice(0, 8));
        } else {
          setProducts(INITIAL_FALLBACK);
        }
      } catch (err) {
        console.error('Failed to load shop section data:', err);
        setProducts(INITIAL_FALLBACK);
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
          <p className="shop-tag" style={{color:"#995544"}}>Shop</p>
          <h1 className="taprom-headline">{colConfig.title}</h1>
        </div>

        <div className="product-grid" aria-label={loading ? 'Loading products' : undefined}>
          {loading
            ? Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)
            : products.map(product => <ProductCard key={product.id} product={product} />)}
        </div>

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

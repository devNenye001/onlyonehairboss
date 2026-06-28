
import { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import './Shop.css';
import ProductCard, { ProductCardSkeleton } from '../../ProductCard/ProductCard';
import { supabase } from '../../../utils/supabase/client';

const FALLBACK = [
  { id: '1', name: "Layered bone straight", price: 270000, image: "/wig1.svg" },
  { id: '2', name: "Short wavy", price: 270000, image: "/wig2.svg" },
  { id: '3', name: "Pixie Curls", price: 270000, image: "/wig3.svg" },
  { id: '4', name: "Bone Straight", price: 270000, image: "/wig4.svg" },
  { id: '5', name: "Layered bone straight", price: 270000, image: "/wig5.svg" },
  { id: '6', name: "Short wavy", price: 270000, image: "/wig6.svg" },
  { id: '7', name: "Pixie Curls", price: 270000, image: "/wig7.svg" },
  { id: '8', name: "Bone Straight", price: 270000, image: "/wig8.svg" },
];

const Shop = () => {
  const [products, setProducts] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [colConfig, setColConfig] = useState({
    title: 'Our Collection',
    description: '',
    image_url: '/logo.svg',
    banner_text: 'Luxury Hair. Timeless Beauty.'
  });

  useEffect(() => {
    const loadShopData = async () => {
      try {
        // 1. Load config
        const { data: configData } = await supabase.from('site_content').select('*').eq('key', 'collection_section').maybeSingle();
        const config = configData?.value || {};
        setColConfig(prev => ({ ...prev, ...config }));

        // 2. Load products
        const { data: prodData } = await supabase.from('products').select('id, name, price, images, created_at').eq('in_stock', true);
        if (prodData && prodData.length > 0) {
          const mapped = prodData.map(p => ({ ...p, image: Array.isArray(p.images) ? p.images[0] : p.images || '/wig1.svg' }));
          
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
          setProducts(sorted.map(p => ({ ...p, image: Array.isArray(p.images) ? p.images[0] : p.images || '/wig1.svg' })).slice(0, 8));
        }
      } catch (err) {
        console.error('Failed to load shop section data:', err);
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
          {colConfig.description && <p className="shop-desc" style={{ color: '#888', marginTop: '8px', fontSize: '0.95rem', textAlign: 'center' }}>{colConfig.description}</p>}
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
            <h2 className="banner-text">{colConfig.banner_text || colConfig.description || "Luxury Hair. Timeless Beauty."}</h2>
          </Motion.div>
        </section>
      </main>
    </div>
  );
};

export default Shop;


import { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import './Shop.css';
import ProductCard from '../../ProductCard/ProductCard';
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
  const [colConfig, setColConfig] = useState({
    title: 'Our Collection',
    description: '',
    image_url: '/logo.svg',
    banner_text: 'Luxury Hair. Timeless Beauty.'
  });

  useEffect(() => {
    // Load config
    supabase.from('site_content').select('*').eq('key', 'collection_section').maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          setColConfig(prev => ({ ...prev, ...data.value }));
        }
      });

    // Load products
    supabase
      .from('products')
      .select('id, name, price, images')
      .eq('in_stock', true)
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setProducts(data.map(p => ({ ...p, image: Array.isArray(p.images) ? p.images[0] : p.images || '/wig1.svg' })));
        }
      });
  }, []);

  return (
    <div className="shop-page">
      <main className="shop-container">
        <div className="shop-header">
          <p className="shop-tag" style={{color:"#995544"}}>Shop</p>
          <h1 className="taprom-headline">{colConfig.title}</h1>
          {colConfig.description && <p className="shop-desc" style={{ color: '#888', marginTop: '8px', fontSize: '0.95rem', textAlign: 'center' }}>{colConfig.description}</p>}
        </div>

        <div className="product-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
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

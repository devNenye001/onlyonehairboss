
import { useState, useEffect } from 'react';
import './NewIn.css';
import ProductCard, { ProductCardSkeleton } from '../../ProductCard/ProductCard';
import { supabase } from '../../../utils/supabase/client';

const FALLBACK = [
  { id: '1', name: "Layered bone straight", price: 270000, image: "/wig3.svg" },
  { id: '2', name: "Short wavy", price: 270000, image: "/wig4.svg" },
  { id: '3', name: "Pixie Curls", price: 270000, image: "/wig5.svg" },
  { id: '4', name: "Bone Straight", price: 270000, image: "/wig6.svg" },
];

const NewIn = () => {
  const [newArrivals, setNewArrivals] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [heading, setHeading] = useState('New Ins');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const loadNewIns = async () => {
      try {
        // Fetch content config
        const { data: configData } = await supabase.from('site_content').select('*').eq('key', 'new_ins').maybeSingle();
        const config = configData?.value || {};
        if (config.heading) setHeading(config.heading);
        if (config.description) setDescription(config.description);

        // Fetch products
        const { data: prodData } = await supabase.from('products').select('id, name, price, images, created_at').eq('in_stock', true);
        if (prodData && prodData.length > 0) {
          const mapped = prodData.map(p => ({ ...p, image: Array.isArray(p.images) ? p.images[0] : p.images || '/wig1.svg' }));
          
          if (config.product_ids && config.product_ids.length > 0) {
            // Filter products matching configured ids in order
            const ordered = config.product_ids
              .map(id => mapped.find(p => p.id === id))
              .filter(Boolean);
            if (ordered.length > 0) {
              setNewArrivals(ordered.slice(0, 4));
              return;
            }
          }
          
          // Default fallback to latest 4 products
          const sorted = [...prodData].sort((a,b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
          setNewArrivals(sorted.map(p => ({ ...p, image: Array.isArray(p.images) ? p.images[0] : p.images || '/wig1.svg' })).slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load New Ins dynamic configuration:', err);
      } finally {
        setLoading(false);
      }
    };

    loadNewIns();
  }, []);

  return (
    <section className="new-in-section">
      <div className="new-in-container">

        <div className="new-in-header">
          <p className="new-in-tag">Shop</p>
          <h2 className="new-in-headline">{heading}</h2>
          {description && <p className="new-in-desc" style={{ color: '#888', marginTop: '8px', fontSize: '0.95rem' }}>{description}</p>}
        </div>

        <div className="new-in-grid" aria-label={loading ? 'Loading new arrivals' : undefined}>
          {loading
            ? Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={i} />)
            : newArrivals.map(product => <ProductCard key={product.id} product={product} />)}
        </div>

      </div>
    </section>
  );
};

export default NewIn;

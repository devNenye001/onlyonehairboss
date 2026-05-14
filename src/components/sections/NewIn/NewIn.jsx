
import { useState, useEffect } from 'react';
import './NewIn.css';
import ProductCard from '../../ProductCard/ProductCard';
import { supabase } from '../../../utils/supabase/client';

const FALLBACK = [
  { id: '1', name: "Layered bone straight", price: 270000, image: "/wig3.svg" },
  { id: '2', name: "Short wavy", price: 270000, image: "/wig4.svg" },
  { id: '3', name: "Pixie Curls", price: 270000, image: "/wig5.svg" },
  { id: '4', name: "Bone Straight", price: 270000, image: "/wig6.svg" },
];

const NewIn = () => {
  const [newArrivals, setNewArrivals] = useState(FALLBACK);

  useEffect(() => {
    supabase
      .from('products')
      .select('id, name, price, images')
      .eq('in_stock', true)
      .order('created_at', { ascending: false })
      .limit(4)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setNewArrivals(data.map(p => ({ ...p, image: p.images?.[0] || '/wig1.svg' })));
        }
      });
  }, []);

  return (
    <section className="new-in-section">
      <div className="new-in-container">

        <div className="new-in-header">
          <p className="new-in-tag">Shop</p>
          <h2 className="new-in-headline">New Ins</h2>
        </div>

        <div className="new-in-grid">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default NewIn;

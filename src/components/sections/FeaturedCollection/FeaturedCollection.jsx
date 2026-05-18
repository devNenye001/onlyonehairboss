
import { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import './FeaturedCollection.css';
import { supabase } from '../../../utils/supabase/client';
import { useCart } from '../../../context/CartContext';

const FALLBACK = {
  id: 'luxury-deep-wave',
  name: 'Luxury Deep Wave Wig',
  description:
    'Soft, full, and effortlessly beautiful — our Luxury Deep Wave Wig is crafted to give you a flawless, natural look with rich volume and a silky finish. Perfect for everyday elegance or special occasions, this wig is designed for confident women who love luxury, comfort, and attention-grabbing beauty.',
};

const FeaturedCollection = () => {
  const [featured, setFeatured] = useState(FALLBACK);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({ id: featured.id, name: featured.name, price: featured.price, image: featured.images });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  useEffect(() => {
    supabase
      .from('products')
      .select('id, name, description, images, price')
      .eq('is_featured', true)
      .eq('in_stock', true)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setFeatured(data);
      });
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut", delay: i * 0.1 }
    })
  };

  return (
    <section className="featured-section">
      <div className="featured-container">

        <Motion.p
          className="featured-tag"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          Featured Collection
        </Motion.p>

        <Motion.h2
          className="featured-headline"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={1}
        >
          {featured.name}
        </Motion.h2>

        <Motion.div
          className="featured-media"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={2}
        >
          {featured.images ? (
            <img src={featured.images} alt={featured.name} className="featured-video" />
          ) : (
            <video
              className="featured-video"
              autoPlay
              loop
              playsInline
              muted
              src="/featured1.mp4"
            />
          )}
        </Motion.div>

        <Motion.p
          className="featured-description"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={3}
        >
          {featured.description || FALLBACK.description}
        </Motion.p>

        <Motion.div
          className="featured-action-wrap"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={4}
        >
          <button onClick={handleAddToCart} className="order-now-btn">
            {added ? 'Added to Cart!' : 'Add to Cart'}
          </button>
        </Motion.div>

      </div>
    </section>
  );
};

export default FeaturedCollection;

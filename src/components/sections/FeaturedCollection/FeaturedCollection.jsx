import { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import './FeaturedCollection.css';
import { supabase } from '../../../utils/supabase/client';
import { useCart } from '../../../context/CartContext';

const FeaturedCollection = () => {
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (!featured) return;
    const img = Array.isArray(featured.images) && featured.images.length > 0
      ? featured.images[0]
      : (featured.image || '');
    addItem({
      id: featured.id,
      name: featured.name,
      price: Number(featured.price),
      image: img
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        // Fetch content config
        const { data: configData } = await supabase.from('site_content').select('*').eq('key', 'featured_collection').maybeSingle();
        const config = configData?.value || {};
        
        let targetProduct = null;

        if (config.product_id) {
          // Fetch specific product
          const { data: prod } = await supabase.from('products').select('id, name, description, images, price').eq('id', config.product_id).maybeSingle();
          if (prod) {
            targetProduct = prod;
          }
        }

        if (!targetProduct) {
          // Query database for any product marked is_featured
          const { data: prod } = await supabase.from('products').select('id, name, description, images, price').eq('is_featured', true).eq('in_stock', true).limit(1).maybeSingle();
          if (prod) {
            targetProduct = prod;
          }
        }

        if (targetProduct) {
          setFeatured({
            ...targetProduct,
            name: config.heading || targetProduct.name,
            description: config.description || targetProduct.description,
            video_url: config.video_url || ''
          });
        } else {
          setFeatured(null);
        }
      } catch (err) {
        console.error('Failed to load Featured Collection dynamic config:', err);
        setFeatured(null);
      } finally {
        setLoading(false);
      }
    };

    loadFeatured();
  }, []);

  if (loading || !featured) {
    return null;
  }

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
          <video
            className="featured-video"
            autoPlay
            loop
            playsInline
            muted
            controls
            src={featured.video_url || "/featured1.mp4"}
          />
        </Motion.div>

        {featured.description && (
          <Motion.p
            className="featured-description"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={3}
          >
            {featured.description}
          </Motion.p>
        )}

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

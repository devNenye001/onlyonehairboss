
import { motion as Motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiOutlineArrowRight } from 'react-icons/hi';
import './FeaturedCollection.css';

const FeaturedCollection = () => {
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
          Luxury Deep Wave Wig
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
            src="/featured1.mp4"

          />
        </Motion.div>

        <Motion.p
          className="featured-description"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={3}
        >
          Soft, full, and effortlessly beautiful — our Luxury Deep Wave Wig
          is crafted to give you a flawless, natural look with rich volume
          and a silky finish. Perfect for everyday elegance or special
          occasions, this wig is designed for confident women who love
          luxury, comfort, and attention-grabbing beauty.
        </Motion.p>

        <Motion.div
          className="featured-action-wrap"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={4}
        >
          <Link to="/product/luxury-deep-wave" className="order-now-btn">
            Order Now <HiOutlineArrowRight className="btn-arrow-icon" />
          </Link>
        </Motion.div>

      </div>
    </section>
  );
};

export default FeaturedCollection;
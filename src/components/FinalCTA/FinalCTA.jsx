
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { HiOutlineArrowRight } from 'react-icons/hi';
import './FinalCTA.css';

const FinalCTA = () => {
  const textVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.7, ease: "easeOut", delay: 0.15 } }
  };

  return (
    <section className="cta-section">
      <div className="cta-container">
        
        {/* Left Section: Content and Call to Action Links */}
        <Motion.div 
          className="cta-content"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-20px" }}
          variants={textVariants}
        >
          <p className="cta-tag">Ready To Elevate Your Look?</p>
          <h2 className="cta-headline">Let's Find Your Perfect Wig.</h2>
          <p className="cta-description">
            Discover premium wigs designed to make you feel confident, beautiful, 
            and unforgettable. Your next favorite look is just one message away.
          </p>
          
          <div className="cta-action-wrap">
            <Link to="/shop" className="cta-order-btn">
              Order Now <HiOutlineArrowRight className="cta-btn-arrow" />
            </Link>
          </div>
        </Motion.div>

        {/* Right Section: Model Display Rendering Image */}
        <Motion.div 
          className="cta-media-wrap"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-20px" }}
          variants={imageVariants}
        >
          <img 
            src="/last.svg" 
            alt="Premium Wavy Wig Showcase Model" 
            className="cta-showcase-img" 
          />
        </Motion.div>

      </div>
    </section>
  );
};

export default FinalCTA;
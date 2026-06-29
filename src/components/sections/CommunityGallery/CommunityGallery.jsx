import { motion as Motion } from 'framer-motion';
import { HiOutlineArrowRight } from 'react-icons/hi';
import './CommunityGallery.css';

const INSTA_IMAGES = [
  { id: 1, src: "/insta1.jpg", alt: "OnlyOne Hairboss Community Look 1" },
  { id: 2, src: "/insta2.jpg", alt: "OnlyOne Hairboss Community Look 2" },
  { id: 3, src: "/insta3.jpg", alt: "OnlyOne Hairboss Community Look 3" },
  { id: 4, src: "/insta4.jpg", alt: "OnlyOne Hairboss Community Look 4" },
  { id: 5, src: "/insta5.jpg", alt: "OnlyOne Hairboss Community Look 5" },
  { id: 6, src: "/insta6.jpg", alt: "OnlyOne Hairboss Community Look 6" },
];

const CommunityGallery = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  return (
    <section className="community-section">
      <div className="community-container">
        
        {/* Header Block */}
        <div className="community-header">
          <p className="community-tag">Socials</p>
          <h2 className="community-headline">Our Beautiful Community</h2>
          <p className="community-subtitle">
            See how our community styles their favorite lace, closures, and custom color units. Real people, flawless hair.
          </p>
        </div>

        {/* 3-Column Image Grid (3 on top, 3 on bottom) */}
        <Motion.div 
          className="community-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {INSTA_IMAGES.map((img) => (
            <Motion.div 
              key={img.id} 
              className="community-card"
              variants={itemVariants}
              whileHover={{ scale: 1.025 }}
              transition={{ duration: 0.3 }}
            >
              <div className="community-img-wrapper">
                <img 
                  src={img.src} 
                  alt={img.alt} 
                  loading="lazy"
                  className="community-img"
                />
              </div>
            </Motion.div>
          ))}
        </Motion.div>

        {/* Explore Feed CTA button */}
        <div className="community-action-wrap">
          <a 
            href="https://www.instagram.com/onlyonehairboss/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="explore-feed-btn"
          >
            Explore Our Feed <HiOutlineArrowRight className="btn-arrow" />
          </a>
        </div>

      </div>
    </section>
  );
};

export default CommunityGallery;


import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { FaPhoneAlt, FaMapMarkerAlt, FaTiktok, FaInstagram } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  return (
    <footer className="main-footer">
      <div className="footer-container">
        
        {/* Core Links & Info Columns */}
        <Motion.div 
          className="footer-row"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }}
        >
          
          {/* Column 1: Identity Brand Logo */}
          <Motion.div className="footer-col brand-col" variants={fadeUpVariants}>
            <Link to="/" className="footer-logo-link">
              <img 
                src="/logo.svg" 
                alt="OnlyOne Hairboss Logo" 
                className="footer-logo-img" 
              />
            </Link>
          </Motion.div>

          {/* Column 2: Navigation Map */}
          <Motion.div className="footer-col" variants={fadeUpVariants}>
            <h3 className="footer-heading">QUICK LINKS</h3>
            <ul className="footer-links-list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/shop">Shop</Link></li>
              <li><Link to="/#about">About Us</Link></li>
              <li><Link to="/#contact">Contact</Link></li>
            </ul>
          </Motion.div>

          {/* Column 3: Category Highlights */}
          <Motion.div className="footer-col" variants={fadeUpVariants}>
            <h3 className="footer-heading">BEST SELLERS</h3>
            <ul className="footer-links-list">
              <li><Link to="/shop?category=frontal">Frontal Wig</Link></li>
              <li><Link to="/shop?category=bob">Bob Wig</Link></li>
              <li><Link to="/shop?category=deepwave">Deep Wave</Link></li>
              <li><Link to="/shop?category=bonestraight">Bone Straight</Link></li>
            </ul>
          </Motion.div>

          {/* Column 4: Contact Core Information */}
          <Motion.div className="footer-col contact-col" variants={fadeUpVariants}>
            <h3 className="footer-heading">CONTACT US</h3>
            <ul className="footer-meta-info">
              <li>
                <FaPhoneAlt className="meta-icon" />
                <span>Call Us: +234 906 930 3261</span>
              </li>
              <li>
                <FaMapMarkerAlt className="meta-icon" />
                <span className="address-text">
                  Shop Address: 19 Ekeninwor Road, Rumuafrikom, Port Harcourt 500001, Rivers.
                </span>
              </li>
            </ul>
          </Motion.div>

          {/* Column 5: Social Channels Hook */}
          <Motion.div className="footer-col social-col" variants={fadeUpVariants}>
            <h3 className="footer-heading">FOLLOW US</h3>
            <div className="social-icon-row">
              <a 
                href="https://www.tiktok.com/@onlyonehairboss/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-circle-link"
                aria-label="Follow OnlyOne Hairboss on TikTok"
              >
                <FaTiktok />
              </a>
              <a 
                href="https://www.instagram.com/onlyonehairboss/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-circle-link"
                aria-label="Follow OnlyOne Hairboss on Instagram"
              >
                <FaInstagram />
              </a>
            </div>
          </Motion.div>

        </Motion.div>

        {/* Thin Separator Line matched from image_91be4a.png */}
        <hr className="footer-divider" />

        {/* Bottom Rights Notice Block */}
        <div className="footer-copyright-row">
          <p>© {currentYear} ONLYONEHAIRBOSS. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
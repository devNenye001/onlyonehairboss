
import { motion as Motion } from 'framer-motion';
import { HiOutlineStar, HiOutlineSparkles, HiOutlineTruck } from 'react-icons/hi2';
import './WhyUs.css';

const WhyUs = () => {
  // Animation presets for staggering the entry elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const leftColumnVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const featureItemVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const features = [
    {
      id: 1,
      icon: <HiOutlineStar />,
      title: "Premium Quality Hair",
      description: "Our wigs are soft, durable, luxury, and worth the money"
    },
    {
      id: 2,
      icon: <HiOutlineSparkles />,
      title: "Custom Installations",
      description: "We also help you style and install it professionally."
    },
    {
      id: 3,
      icon: <HiOutlineTruck />,
      title: "Fast & Reliable Delivery",
      description: "Quick and secure delivery across Port Harcourt and nationwide."
    }
  ];

  return (
    <section className="whyus-section">
      <Motion.div 
        className="whyus-container"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-20px" }}
      >
        
        {/* Left Column: Introductions */}
        <Motion.div className="whyus-intro" variants={leftColumnVariants}>
          <p className="whyus-tag">Why Choose Us</p>
          <h2 className="whyus-headline">Premium Wigs For Premium Girls.</h2>
          <p className="whyus-subtext">
            Our goal is simple — helping every woman feel confident, beautiful, 
            and unforgettable with hair that truly stands out.
          </p>
        </Motion.div>

        {/* Right Column: Features List */}
        <div className="whyus-features-list">
          {features.map((item) => (
            <Motion.div 
              key={item.id} 
              className="feature-item" 
              variants={featureItemVariants}
            >
              <div className="feature-icon-box">
                {item.icon}
              </div>
              <div className="feature-text">
                <h3 className="feature-title">{item.title}</h3>
                <p className="feature-desc">{item.description}</p>
              </div>
            </Motion.div>
          ))}
        </div>

      </Motion.div>
    </section>
  );
};

export default WhyUs;
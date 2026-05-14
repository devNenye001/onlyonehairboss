import { motion as Motion } from 'framer-motion';
import './About.css';

const About = () => {
  // Stagger wrapper for clean text presentation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
  };

  return (
    <section className="about-section">
      <Motion.div 
        className="about-container"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
      >
        {/* Small Section Header */}
        <Motion.p variants={itemVariants} className="about-tag">
          About
        </Motion.p>

        {/* Big Script Headline */}
        <Motion.h2 variants={itemVariants} className="about-headline">
          Designed To Make You Stand Out
        </Motion.h2>

        {/* Body Copy Section */}
        <div className="about-content">
          <Motion.p variants={itemVariants}>
            At OnlyOneHairBoss, beauty begins with confidence. We provide premium-quality wigs 
            designed for women who love elegance, luxury, and flawless style. From sleek straight 
            looks to bold curls, every wig is carefully selected to give you comfort, beauty, 
            and that perfect soft glam finish.
          </Motion.p>
          
          <Motion.p variants={itemVariants}>
            Our goal is simple — helping every woman feel confident, beautiful, and unforgettable 
            with hair that truly stands out.
          </Motion.p>
        </div>

        
      </Motion.div>
    </section>
  );
};

export default About;
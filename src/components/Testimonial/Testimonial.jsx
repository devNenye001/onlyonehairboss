
import { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { AiFillStar } from 'react-icons/ai';
import './Testimonial.css';

const Testimonial = () => {
  // Generated expanded set of high-end testimonials
  const testimonials = [
    {
      id: 1,
      text: "“The hair is super soft and the quality is amazing. I got so many compliments the first day I wore it.”",
      author: "Ndubuisi Chinenye"
    },
    {
      id: 2,
      text: "“Exactly what I ordered. Full, beautiful, and very easy to style. I'm definitely buying again.”",
      author: "Amadi Chioma"
    },
    {
      id: 3,
      text: "“This wig gave me so much confidence. Everyone kept asking where I got my hair from.”",
      author: "Eke Valentina"
    },
    {
      id: 4,
      text: "“The lace blends seamlessly into my skin! Minimal shedding and the texture feels premium.”",
      author: "Okonjo Blessing"
    },
    {
      id: 5,
      text: "“10/10 customer care and fast shipping. The packaging alone feels like pure luxury.”",
      author: "Tunde Morayo"
    },
    {
      id: 6,
      text: "“Stays soft even after washing it multiple times. A worthwhile investment piece.”",
      author: "Yusuf Amina"
    }
  ];

  // Logic to switch sets on mobile/tablet viewports if needed
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="reviews-section">
      <div className="reviews-container">
        
        {/* Header matched perfectly to image layout */}
        <div className="reviews-header">
          <p className="reviews-tag">Testimonials</p>
          <h2 className="reviews-headline">Customer Reviews</h2>
        </div>

        {/* Testimonials Review Row Slider Container */}
        <div className="reviews-window">
          <Motion.div 
            className="reviews-grid"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Maps items natively. Slice logic can be attached here if implementing strict single-row pagination toggles */}
            {[0, 1, 2].map((offset) => testimonials[(currentIndex + offset) % testimonials.length]).map((item) => (
              <Motion.div 
                key={item.id} 
                className="review-card"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {/* 5-Star Rating Block */}
                <div className="star-rating-row">
                  {[...Array(5)].map((_, i) => (
                    <AiFillStar key={i} className="star-icon" />
                  ))}
                </div>
                
                {/* Content Block Quote & Creator details */}
                <p className="review-quote">{item.text}</p>
                <h4 className="review-author">{item.author}</h4>
              </Motion.div>
            ))}
          </Motion.div>
        </div>

        {/* Dark Circular Controls perfectly modeled from image_92375d.png */}
        <div className="reviews-controls">
          <button className="control-btn" onClick={prevSlide} aria-label="Previous Slide">
            <HiChevronLeft />
          </button>
          <button className="control-btn" onClick={nextSlide} aria-label="Next Slide">
            <HiChevronRight />
          </button>
        </div>

      </div>
    </section>
  );
};

export default Testimonial;
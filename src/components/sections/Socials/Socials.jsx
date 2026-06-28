
import { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { HiOutlineArrowRight } from 'react-icons/hi';
import { FaPlay } from 'react-icons/fa';
import { supabase } from '../../../utils/supabase/client';
import './Socials.css';

const FALLBACK = [
  { id: 1, videoUrl: "/video1.mp4", alt: "TikTok Look 1" },
  { id: 2, videoUrl: "/video2.mp4", alt: "TikTok Look 2" },
  { id: 3, videoUrl: "/video3.mp4", alt: "TikTok Look 3" },
  { id: 4, videoUrl: "/video4.mp4", alt: "TikTok Look 4" },
];

const Socials = () => {
  const [socialVideos, setSocialVideos] = useState(FALLBACK);

  useEffect(() => {
    supabase.from('site_content').select('*').eq('key', 'stay_connected').maybeSingle()
      .then(({ data }) => {
        if (data?.value && data.value.videos && data.value.videos.length > 0) {
          const validVideos = data.value.videos.map((v, i) => ({
            id: v.id || i + 1,
            videoUrl: v.videoUrl || FALLBACK[i].videoUrl,
            thumbnailUrl: v.thumbnailUrl || '',
            alt: v.alt || FALLBACK[i].alt
          }));
          setSocialVideos(validVideos);
        }
      })
      .catch(err => {
        console.error('Failed to load stay_connected config:', err);
      });
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const videoCardVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  return (
    <section className="socials-section">
      <div className="socials-container">
        
        {/* Header aligned perfectly with the design reference */}
        <div className="socials-header">
          <p className="socials-tag">Socials</p>
          <h2 className="socials-headline">Stay Connected</h2>
        </div>

        {/* 4-Column Video Feed Grid Container */}
        <Motion.div 
          className="socials-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-20px" }}
        >
          {socialVideos.map((video) => (
            <Motion.div 
              key={video.id} 
              className="video-card"
              variants={videoCardVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="video-wrapper">
                <video 
                  src={video.videoUrl} 
                  poster={video.thumbnailUrl || undefined}
                  preload="none"
                  autoPlay 
                  loop 
                  muted 
                  controls 
                  playsInline 
                  className="social-video-player"
                  aria-label={video.alt}
                />
                {/* Visual play overlay centered above the native video player element stack */}
                <div className="play-overlay-icon">
                  <FaPlay />
                </div>
              </div>
            </Motion.div>
          ))}
        </Motion.div>

        {/* TikTok Brand Redirect solid color CTA */}
        <div className="socials-action-wrap">
          <a 
            href="https://www.tiktok.com/@onlyonehairboss/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="tiktok-follow-btn"
          >
            Follow Us on TikTok <HiOutlineArrowRight className="btn-arrow" />
          </a>
        </div>

      </div>
    </section>
  );
};

export default Socials;
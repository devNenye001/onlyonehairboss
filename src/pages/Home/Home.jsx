import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import FinalCTA from '../../components/FinalCTA/FinalCTA';
import Footer from '../../components/Footer/Footer';
import About from '../../components/sections/About/About';
import Contact from '../../components/sections/Contact/Contact';
import FeaturedCollection from '../../components/sections/FeaturedCollection/FeaturedCollection';
import Hero from '../../components/sections/Hero/Hero';
import NewIn from '../../components/sections/NewIn/NewIn';
import Shop from '../../components/sections/Shop/Shop';
import Socials from '../../components/sections/Socials/Socials';
import WhyUs from '../../components/sections/WhyUs/WhyUs';
import Testimonial from '../../components/Testimonial/Testimonial';

const Home = () => {
  const { hash } = useLocation();

  useEffect(() => {
    // Skip OAuth callback hashes — they contain tokens, not section IDs
    if (!hash || hash.includes('access_token') || hash.includes('refresh_token')) return;
    try {
      const el = document.querySelector(hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {
      // Ignore invalid selectors
    }
  }, [hash]);

  return (
    <div>
      <Hero />
      <Shop />
      <div id="about"><About /></div>
      <FeaturedCollection />
      <NewIn />
      <WhyUs />
      <Testimonial />
      <Socials />
      <div id="contact"><Contact /></div>
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Home;

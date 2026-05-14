
import FinalCTA from '../../components/FinalCTA/FinalCTA'
import Footer from '../../components/Footer/Footer'
import About from '../../components/sections/About/About'
import Contact from '../../components/sections/Contact/Contact'
import FeaturedCollection from '../../components/sections/FeaturedCollection/FeaturedCollection'
import Hero from '../../components/sections/Hero/Hero'
import NewIn from '../../components/sections/NewIn/NewIn'
import Shop from '../../components/sections/Shop/Shop'
import Socials from '../../components/sections/Socials/Socials'
import WhyUs from '../../components/sections/WhyUs/WhyUs'
import Testimonial from '../../components/Testimonial/Testimonial'

const Home = () => {
  return (
    <div>
      <Hero />
      <Shop />
      <About />
      <FeaturedCollection />
      <NewIn />
      <WhyUs />
      <Testimonial />
      <Socials />
      <Contact />
      <FinalCTA />
      <Footer />
    </div>
  )
}

export default Home
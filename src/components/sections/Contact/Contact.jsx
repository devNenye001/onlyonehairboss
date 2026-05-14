
import { motion as Motion } from 'framer-motion';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';
import './Contact.css';

const Contact = () => {
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut", delay: i * 0.1 }
    })
  };

  const infoItems = [
    {
      icon: <HiOutlineLocationMarker />,
      title: "Head Office",
      detail: "19 Ekeninwor Road, Rumuafrikom, Port Harcourt 500001, Rivers."
    },
    {
      icon: <HiOutlineMail />,
      title: "Email",
      detail: "onlyonehairboss@gmail.com"
    },
    {
      icon: <HiOutlinePhone />,
      title: "Phone Number",
      detail: "+234 906 930 3261"
    }
  ];

  return (
    <section className="contact-section">
      <div className="contact-container">
        <div className="contact-grid">

          {/* Left: Info */}
          <Motion.div
            className="contact-info-column"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <p className="contact-tag">Contact</p>
            <h2 className="contact-headline">Get In Touch</h2>
            <p className="contact-description">
              We're always ready to help you find the perfect wig for your next slay.
              Send us a message, place your order, or make an inquiry anytime.
            </p>

            <div className="info-meta-list">
              {infoItems.map((item, i) => (
                <Motion.div
                  key={i}
                  className="meta-card"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i + 1}
                >
                  <div className="meta-icon-box">{item.icon}</div>
                  <div className="meta-text-wrap">
                    <h3 className="meta-title">{item.title}</h3>
                    <p className="meta-desc">{item.detail}</p>
                  </div>
                </Motion.div>
              ))}
            </div>
          </Motion.div>

          {/* Right: Map */}
          <Motion.div
            className="contact-map-column"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127161.73708304958!2d6.945585523992019!3d4.824161109033333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x10650f011be47a83%3A0x6e25f69f2ea7da65!2sPort%20Harcourt%2C%20Rivers!5e0!3m2!1sen!2sng!4v1710000000000!5m2!1sen!2sng"
              className="embedded-google-iframe"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="OnlyOne Hairboss Location Map"
            />
          </Motion.div>

        </div>
      </div>
    </section>
  );
};

export default Contact;

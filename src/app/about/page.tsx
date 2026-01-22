'use client';

export default function AboutPage() {
  const handleWhatsAppContact = () => {
    const message = "Hi! I'd like to learn more about your lighting solutions and services.";
    const whatsappUrl = `https://wa.me/0122150334?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-content">
            <h1>About Relight EAL</h1>
            <p>
              Illuminating UAE with premium lighting solutions since 2010. 
              We bring together quality, design, and innovation to light up your world.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="about-story">
        <div className="container">
          <div className="story-grid">
            <div className="story-content">
              <h2>Our Story</h2>
              <p>
                Founded in 2010, Relight EAL began as a small lighting boutique in Dubai with a simple mission: 
                to bring premium, energy-efficient lighting solutions to homes and businesses across the UAE.
              </p>
              <p>
                Over the years, we've grown to become one of the region's most trusted lighting specialists, 
                serving thousands of satisfied customers from Dubai to Abu Dhabi, and across all seven Emirates.
              </p>
              <p>
                Today, we combine traditional craftsmanship with cutting-edge LED technology, 
                offering everything from elegant chandeliers to smart lighting systems.
              </p>
            </div>
            <div className="story-image">
              <div className="image-placeholder">
                <div className="placeholder-icon">🏢</div>
                <span>Our Showroom</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-values">
        <div className="container">
          <div className="values-header">
            <h2>Why Choose Relight EAL?</h2>
            <p>We're committed to excellence in every aspect of our service</p>
          </div>

          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon premium">
                🏆
              </div>
              <h3>Premium Quality</h3>
              <p>
                We source only the finest lighting fixtures from renowned manufacturers, 
                ensuring durability and elegance in every product.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon delivery">
                🚚
              </div>
              <h3>UAE-Wide Delivery</h3>
              <p>
                Fast and reliable delivery across all Emirates, with professional installation 
                services available throughout the region.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon consultation">
                👥
              </div>
              <h3>Expert Consultation</h3>
              <p>
                Our lighting specialists provide personalized advice to help you choose 
                the perfect lighting solution for your space.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon energy">
                💡
              </div>
              <h3>Energy Efficient</h3>
              <p>
                All our LED products are energy-efficient and eco-friendly, 
                helping you save on electricity bills while protecting the environment.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon warranty">
                🛡️
              </div>
              <h3>Warranty Protection</h3>
              <p>
                Comprehensive warranty coverage on all products, with dedicated after-sales 
                support and maintenance services.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon support">
                💬
              </div>
              <h3>24/7 WhatsApp Support</h3>
              <p>
                Instant support via WhatsApp for all your queries, orders, and technical assistance. 
                We're always here to help.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="about-stats">
        <div className="container">
          <div className="stats-header">
            <h2>Our Impact</h2>
            <p>Numbers that reflect our commitment to excellence</p>
          </div>

          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number customers">5000+</div>
              <div className="stat-label">Happy Customers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number products">1000+</div>
              <div className="stat-label">Products Available</div>
            </div>
            <div className="stat-item">
              <div className="stat-number emirates">7</div>
              <div className="stat-label">Emirates Covered</div>
            </div>
            <div className="stat-item">
              <div className="stat-number experience">13+</div>
              <div className="stat-label">Years of Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Space?</h2>
            <p>
              Let our lighting experts help you create the perfect ambiance for your home or business. 
              Contact us today for a free consultation.
            </p>
            <button 
              onClick={handleWhatsAppContact}
              className="btn btn-whatsapp"
            >
              <span>💬</span>
              Get Free Consultation
            </button>
          </div>
        </div>
      </section>

      <style jsx>{`
        .about-page {
          min-height: 100vh;
          background-color: white;
        }

        .about-hero {
          background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
          padding: 3rem 0;
        }

        @media (min-width: 768px) {
          .about-hero {
            padding: 5rem 0;
          }
        }

        .about-hero-content {
          text-align: center;
        }

        .about-hero-content h1 {
          font-size: 2rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1rem;
          font-family: 'Poppins', sans-serif;
        }

        @media (min-width: 768px) {
          .about-hero-content h1 {
            font-size: 3rem;
          }
        }

        .about-hero-content p {
          font-size: 1rem;
          color: #d1d5db;
          max-width: 800px;
          margin: 0 auto;
          font-family: 'Inter', sans-serif;
        }

        @media (min-width: 768px) {
          .about-hero-content p {
            font-size: 1.2rem;
          }
        }

        .about-story {
          padding: 3rem 0;
        }

        @media (min-width: 768px) {
          .about-story {
            padding: 4rem 0;
          }
        }

        .story-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          align-items: center;
        }

        @media (min-width: 768px) {
          .story-grid {
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
          }
        }

        .story-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
          font-family: 'Poppins', sans-serif;
        }

        @media (min-width: 768px) {
          .story-content h2 {
            font-size: 2rem;
          }
        }

        .story-content p {
          font-size: 1rem;
          color: #6b7280;
          margin-bottom: 1.5rem;
          line-height: 1.7;
          font-family: 'Inter', sans-serif;
        }

        .story-image {
          position: relative;
        }

        .image-placeholder {
          width: 100%;
          height: 300px;
          background-color: #f3f4f6;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        @media (min-width: 768px) {
          .image-placeholder {
            height: 400px;
          }
        }

        .placeholder-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .image-placeholder span {
          color: #6b7280;
          font-size: 1rem;
          font-weight: 500;
          font-family: 'Inter', sans-serif;
        }

        @media (min-width: 768px) {
          .image-placeholder span {
            font-size: 1.1rem;
          }
        }

        .about-values {
          padding: 3rem 0;
          background-color: #f9fafb;
        }

        @media (min-width: 768px) {
          .about-values {
            padding: 4rem 0;
          }
        }

        .values-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .values-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
          font-family: 'Poppins', sans-serif;
        }

        @media (min-width: 768px) {
          .values-header h2 {
            font-size: 2rem;
          }
        }

        .values-header p {
          font-size: 1rem;
          color: #6b7280;
          font-family: 'Inter', sans-serif;
        }

        @media (min-width: 768px) {
          .values-header p {
            font-size: 1.1rem;
          }
        }

        .values-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        @media (min-width: 640px) {
          .values-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
          }
        }

        @media (min-width: 1024px) {
          .values-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .value-card {
          text-align: center;
          padding: 1.5rem;
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .value-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          margin-bottom: 1rem;
          font-size: 2rem;
        }

        .value-icon.premium {
          background-color: #dbeafe;
        }

        .value-icon.delivery {
          background-color: #dcfce7;
        }

        .value-icon.consultation {
          background-color: #f3e8ff;
        }

        .value-icon.energy {
          background-color: #fef3c7;
        }

        .value-icon.warranty {
          background-color: #fee2e2;
        }

        .value-icon.support {
          background-color: #dcfce7;
        }

        .value-card h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.75rem;
          font-family: 'Poppins', sans-serif;
        }

        @media (min-width: 768px) {
          .value-card h3 {
            font-size: 1.2rem;
          }
        }

        .value-card p {
          color: #6b7280;
          line-height: 1.6;
          font-family: 'Inter', sans-serif;
        }

        .about-stats {
          padding: 3rem 0;
        }

        @media (min-width: 768px) {
          .about-stats {
            padding: 4rem 0;
          }
        }

        .stats-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .stats-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
          font-family: 'Poppins', sans-serif;
        }

        @media (min-width: 768px) {
          .stats-header h2 {
            font-size: 2rem;
          }
        }

        .stats-header p {
          font-size: 1rem;
          color: #6b7280;
          font-family: 'Inter', sans-serif;
        }

        @media (min-width: 768px) {
          .stats-header p {
            font-size: 1.1rem;
          }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        @media (min-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        @media (min-width: 768px) {
          .stat-number {
            font-size: 2.5rem;
          }
        }

        .stat-number.customers {
          color: #3b82f6;
        }

        .stat-number.products {
          color: #059669;
        }

        .stat-number.emirates {
          color: #8b5cf6;
        }

        .stat-number.experience {
          color: #f59e0b;
        }

        .stat-label {
          color: #6b7280;
          font-family: 'Inter', sans-serif;
        }

        .about-cta {
          padding: 3rem 0;
          background-color: #1f2937;
        }

        @media (min-width: 768px) {
          .about-cta {
            padding: 4rem 0;
          }
        }

        .cta-content {
          text-align: center;
        }

        .cta-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: white;
          margin-bottom: 1rem;
          font-family: 'Poppins', sans-serif;
        }

        @media (min-width: 768px) {
          .cta-content h2 {
            font-size: 2rem;
          }
        }

        .cta-content p {
          font-size: 1rem;
          color: #d1d5db;
          margin-bottom: 2rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          font-family: 'Inter', sans-serif;
        }

        @media (min-width: 768px) {
          .cta-content p {
            font-size: 1.1rem;
          }
        }

        .btn-whatsapp {
          background-color: #25d366;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 auto;
        }

        .btn-whatsapp:hover {
          background-color: #22c55e;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .about-hero-content h1 {
            font-size: 1.75rem !important;
          }

          .story-content h2,
          .values-header h2,
          .stats-header h2,
          .cta-content h2 {
            font-size: 1.25rem !important;
          }

          .story-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }

          .values-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1rem !important;
          }

          .value-card {
            padding: 1rem !important;
          }

          .btn-whatsapp {
            padding: 0.625rem 1.25rem !important;
            font-size: 0.875rem !important;
          }
        }
      `}</style>
    </div>
  );
} 

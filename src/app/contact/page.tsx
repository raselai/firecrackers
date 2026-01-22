'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleWhatsAppContact = () => {
    const message = `Hi! I'd like to inquire about your lighting products. 

My details:
Name: ${formData.name || 'Not provided'}
Email: ${formData.email || 'Not provided'}
Phone: ${formData.phone || 'Not provided'}
Subject: ${formData.subject || 'General Inquiry'}

Message: ${formData.message || 'I would like more information about your lighting solutions.'}`;
    
    const whatsappUrl = `https://wa.me/0122150334?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleWhatsAppContact();
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <div className="contact-hero-content">
            <h1>Contact Us</h1>
            <p>Get in touch for lighting solutions across UAE</p>
          </div>
        </div>
      </section>

      <div className="container contact-content">
        <div className="contact-grid">
          {/* Contact Information */}
          <div className="contact-info">
            <h2>Get In Touch</h2>
            
            <div className="contact-methods">
              <div className="contact-method">
                <div className="contact-icon whatsapp">
                  💬
                </div>
                <div className="contact-details">
                  <h3>WhatsApp</h3>
                  <p className="contact-value">+971 50 697 0154</p>
                  <p className="contact-note">Available 24/7 for instant support</p>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-icon phone">
                  📞
                </div>
                <div className="contact-details">
                  <h3>Phone</h3>
                  <p className="contact-value">+971 50 697 0154</p>
                  <p className="contact-note">Mon-Sat: 9:00 AM - 8:00 PM</p>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-icon email">
                  📧
                </div>
                <div className="contact-details">
                  <h3>Email</h3>
                  <p className="contact-value">kingon503@gmail.com</p>
                  <p className="contact-note">We'll respond within 24 hours</p>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-icon address">
                  📍
                </div>
                <div className="contact-details">
                  <h3>Address</h3>
                  <p className="contact-value">
                    International City, Dragon Mart<br />
                    Near EB2 Gate, Dubai<br />
                    United Arab Emirates
                  </p>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-icon hours">
                  🕒
                </div>
                <div className="contact-details">
                  <h3>Business Hours</h3>
                  <div className="contact-value">
                    <p>Monday - Saturday: 9:00 AM - 8:00 PM</p>
                    <p>Sunday: 10:00 AM - 6:00 PM</p>
                    <p className="whatsapp-note">WhatsApp: Available 24/7</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-cta">
              <button 
                onClick={() => window.open('https://wa.me/0122150334', '_blank')}
                className="btn btn-whatsapp"
              >
                <span>💬</span>
                Chat on WhatsApp
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-container">
            <h2>Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+971 50 697 0154"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="What can we help you with?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us about your lighting needs..."
                />
              </div>

              <div className="form-submit">
                <button type="submit" className="btn btn-primary">
                  <span>💬</span>
                  Send via WhatsApp
                </button>
                <p className="form-note">
                  This will open WhatsApp with your message pre-filled
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .contact-page {
          min-height: 100vh;
          background-color: #f9fafb;
        }

        .contact-hero {
          background-color: white;
          padding: 3rem 0;
        }

        @media (min-width: 768px) {
          .contact-hero {
            padding: 4rem 0;
          }
        }

        .contact-hero-content {
          text-align: center;
        }

        .contact-hero-content h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1rem;
          font-family: 'Poppins', sans-serif;
        }

        @media (min-width: 768px) {
          .contact-hero-content h1 {
            font-size: 3rem;
          }
        }

        .contact-hero-content p {
          font-size: 1rem;
          color: #6b7280;
          font-family: 'Inter', sans-serif;
        }

        @media (min-width: 768px) {
          .contact-hero-content p {
            font-size: 1.2rem;
          }
        }

        .contact-content {
          padding: 2rem 0;
        }

        @media (min-width: 768px) {
          .contact-content {
            padding: 4rem 0;
          }
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        @media (min-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
          }
        }

        .contact-info h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 2rem;
          font-family: 'Poppins', sans-serif;
        }

        @media (min-width: 768px) {
          .contact-info h2 {
            font-size: 2rem;
          }
        }

        .contact-methods {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .contact-method {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .contact-icon {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
        }

        .contact-icon.whatsapp {
          background-color: #25d366;
        }

        .contact-icon.phone {
          background-color: #3b82f6;
        }

        .contact-icon.email {
          background-color: #dc2626;
        }

        .contact-icon.address {
          background-color: #8b5cf6;
        }

        .contact-icon.hours {
          background-color: #f59e0b;
        }

        .contact-details h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
          font-family: 'Poppins', sans-serif;
        }

        @media (min-width: 768px) {
          .contact-details h3 {
            font-size: 1.1rem;
          }
        }

        .contact-value {
          color: #374151;
          margin-bottom: 0.25rem;
          font-family: 'Inter', sans-serif;
        }

        .contact-note {
          font-size: 0.9rem;
          color: #6b7280;
          font-family: 'Inter', sans-serif;
        }

        .whatsapp-note {
          font-size: 0.9rem;
          color: #25d366;
          font-weight: 600;
          margin-top: 0.5rem;
        }

        .contact-cta {
          margin-top: 2rem;
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
        }

        .btn-whatsapp:hover {
          background-color: #22c55e;
          transform: translateY(-2px);
        }

        .contact-form-container {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
        }

        @media (min-width: 768px) {
          .contact-form-container {
            padding: 2rem;
          }
        }

        .contact-form-container h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 2rem;
          font-family: 'Poppins', sans-serif;
        }

        @media (min-width: 768px) {
          .contact-form-container h2 {
            font-size: 2rem;
          }
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        @media (min-width: 640px) {
          .form-row {
            grid-template-columns: 1fr 1fr;
          }
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          display: block;
          font-size: 0.9rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
          font-family: 'Inter', sans-serif;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.9rem;
          font-family: 'Inter', sans-serif;
          transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
          outline: none;
        }

        .form-group textarea {
          resize: vertical;
        }

        .form-submit {
          text-align: center;
        }

        .btn-primary {
          background-color: #8b5cf6;
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

        .btn-primary:hover {
          background-color: #7c3aed;
          transform: translateY(-2px);
        }

        .form-note {
          font-size: 0.8rem;
          color: #6b7280;
          margin-top: 0.5rem;
          font-family: 'Inter', sans-serif;
        }

        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }

          .contact-hero-content h1 {
            font-size: 1.75rem !important;
          }

          .contact-info h2,
          .contact-form-container h2 {
            font-size: 1.25rem !important;
          }

          .contact-form-container {
            padding: 1rem !important;
          }

          .form-row {
            grid-template-columns: 1fr !important;
          }

          .btn-whatsapp,
          .btn-primary {
            padding: 0.625rem 1.25rem !important;
            font-size: 0.875rem !important;
          }
        }
      `}</style>
    </div>
  );
} 

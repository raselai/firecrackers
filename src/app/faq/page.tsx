'use client';

import React, { useState } from 'react';
import WhatsAppIcon from '@/components/WhatsAppIcon';

const faqs = [
  {
    id: 1,
    question: "Do you provide installation services?",
    answer: "Yes, we provide professional installation services across UAE. Our certified electricians ensure safe and proper installation of all lighting fixtures. Installation charges vary based on the complexity and location."
  },
  {
    id: 2,
    question: "What is your warranty policy?",
    answer: "We offer comprehensive warranty coverage: LED products come with 2-3 years warranty, traditional lighting fixtures have 1-2 years warranty, and outdoor lights have weather-resistant warranty for 2 years."
  },
  {
    id: 3,
    question: "Do you deliver across UAE?",
    answer: "Yes, we deliver to all Emirates including Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah, and Umm Al Quwain. Delivery charges apply based on location and order value."
  },
  {
    id: 4,
    question: "How do I place an order?",
    answer: "Simply click 'Inquire on WhatsApp' on any product page or contact us directly. Our team will assist you with product selection, pricing, availability, and delivery arrangements."
  },
  {
    id: 5,
    question: "What payment methods do you accept?",
    answer: "We accept cash on delivery, bank transfers, credit/debit cards, and installment plans for bulk orders. Payment terms can be discussed based on order value."
  },
  {
    id: 6,
    question: "Can I see products before purchasing?",
    answer: "Absolutely! Visit our showroom on Sheikh Zayed Road, Dubai, or we can arrange product demonstrations at your location for bulk orders."
  },
  {
    id: 7,
    question: "Do you offer bulk discounts?",
    answer: "Yes, we offer attractive discounts for bulk orders, commercial projects, and contractors. Contact us with your requirements for a customized quote."
  },
  {
    id: 8,
    question: "What about energy efficiency?",
    answer: "All our LED products are energy-efficient and comply with UAE energy standards. We provide detailed energy consumption information for each product to help you make informed decisions."
  },
  {
    id: 9,
    question: "Can you help with lighting design?",
    answer: "Yes, our lighting consultants can help design lighting solutions for your space. We offer free consultations for residential projects and detailed planning for commercial spaces."
  },
  {
    id: 10,
    question: "What if I need to return a product?",
    answer: "We have a 7-day return policy for unused products in original packaging. Custom-made or installed products cannot be returned unless there's a manufacturing defect."
  },
  {
    id: 11,
    question: "Do you have smart lighting options?",
    answer: "Yes, we offer a wide range of smart lighting solutions including WiFi-enabled bulbs, app-controlled fixtures, and automated lighting systems compatible with major smart home platforms."
  },
  {
    id: 12,
    question: "How long does delivery take?",
    answer: "Standard delivery takes 2-5 business days within UAE. Express delivery is available for urgent orders. Custom or imported products may take 7-14 days."
  }
];

export default function FAQPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  const handleWhatsAppContact = () => {
    const message = "Hi! I have a question that's not covered in your FAQ. Can you help me?";
    const whatsappUrl = `https://wa.me/0122150334?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Hero Section */}
      <section style={{ 
        background: 'white', 
        padding: '4rem 0',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ 
              fontSize: '3rem', 
              fontWeight: 'bold', 
              color: '#1f2937',
              marginBottom: '1rem'
            }}>
              Frequently Asked Questions
            </h1>
            <p style={{ 
              fontSize: '1.25rem', 
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Find answers to common questions about our lighting products and services
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ 
            maxWidth: '800px', 
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {faqs.map((faq) => (
              <div key={faq.id} style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                transition: 'all 0.2s ease'
              }}>
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  style={{
                    width: '100%',
                    padding: '1.5rem',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#374151',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{ flex: 1, marginRight: '1rem' }}>
                    {faq.question}
                  </span>
                  <span style={{
                    fontSize: '1.2rem',
                    color: '#6b7280',
                    transition: 'transform 0.2s ease'
                  }}>
                    {openFAQ === faq.id ? '−' : '+'}
                  </span>
                </button>
                
                {openFAQ === faq.id && (
                  <div style={{
                    padding: '0 1.5rem 1.5rem',
                    borderTop: '1px solid #f3f4f6'
                  }}>
                    <p style={{
                      color: '#6b7280',
                      lineHeight: '1.6',
                      margin: 0,
                      fontSize: '0.95rem'
                    }}>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div style={{
            maxWidth: '800px',
            margin: '4rem auto 0',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            padding: '3rem',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '1rem'
            }}>
              Still have questions?
            </h2>
            <p style={{
              color: '#6b7280',
              marginBottom: '2rem',
              fontSize: '1.1rem',
              lineHeight: '1.6'
            }}>
              Can't find the answer you're looking for? Our friendly team is here to help via WhatsApp.
            </p>
            <WhatsAppIcon 
              onClick={handleWhatsAppContact}
              size={24}
            />
          </div>
        </div>
      </section>
    </div>
  );
} 

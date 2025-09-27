import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins'
});

export const metadata: Metadata = {
  title: 'Relight EAL - Premium Lighting Solutions',
  description: 'Premium lighting solutions for indoor and outdoor spaces. Quality LED lights, chandeliers, and modern lighting fixtures.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${poppins.variable}`} suppressHydrationWarning={true}>
        <Navbar />
        <main>
          {children}
        </main>
        
        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <div className="footer-content">
              {/* Row 1: AL MESBAH ALABYAD LIGHTS TRADING L.L.C | Quick Links */}
              <div className="footer-row">
                <div className="footer-section">
                  <h3>AL MESBAH ALABYAD LIGHTS TRADING L.L.C</h3>
                  <p>Premium lighting solutions for your home and business. Quality LED lights and modern fixtures.</p>
                  <div className="footer-contact">
                    <p>📍 International City, Dragon Mart, Near EB2 Gate</p>
                    <p>📧 kingon503@gmail.com</p>
                    <p>📞 +971 50 697 0154</p>
                  </div>
                </div>
                
                <div className="footer-section">
                  <h3>Quick Links</h3>
                  <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/about">About Us</a></li>
                    <li><a href="/contact">Contact</a></li>

                  </ul>
                </div>
              </div>
              
              {/* Row 2: Categories | Customer Service */}
              <div className="footer-row">
                <div className="footer-section">
                  <h3>Categories</h3>
                  <ul>
                    <li><a href="/categories/indoor-lights">Indoor Lights</a></li>
                    <li><a href="/categories/outdoor-lights">Outdoor Lights</a></li>
                    <li><a href="/categories/led-strip">LED Strip</a></li>
                    <li><a href="/categories/spotlight">Spotlight</a></li>
                  </ul>
                </div>
                
                <div className="footer-section">
                  <h3>Customer Service</h3>
                  <ul>
                    <li><a href="/contact">Contact Support</a></li>
                    <li><a href="/faq">FAQ</a></li>
                    <li><a href="/shipping">Shipping Info</a></li>
                    <li><a href="/returns">Returns</a></li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="footer-bottom">
              <p>&copy; 2024 AL MESBAH ALABYAD LIGHTS TRADING L.L.C. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

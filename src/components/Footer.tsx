'use client';

import { useI18n } from '@/i18n/I18nProvider';
import { categories } from '@/app/data/categories';

export default function Footer() {
  const { t } = useI18n();
  const categoryColumns = [[], [], []] as typeof categories[];

  categories.forEach((category, index) => {
    categoryColumns[index % 3].push(category);
  });

  return (
    <footer className="footer-premium">
      <div className="footer-glow-top"></div>
      <div className="container">
        <div className="footer-grid-premium">
          <div className="footer-column-premium footer-brand">
            <h3 className="footer-heading-premium">{t('footer.brandName')}</h3>
            <p className="footer-tagline">{t('footer.tagline')}</p>
            <p className="footer-description">{t('footer.description')}</p>
            <div className="footer-contact-premium">
              <div className="contact-item-premium">
                <svg className="contact-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{t('footer.address')}</span>
              </div>
              <div className="contact-item-premium">
                <svg className="contact-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>{t('footer.email')}</span>
              </div>
              <div className="contact-item-premium">
                <svg className="contact-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>{t('footer.phone')}</span>
              </div>
            </div>
          </div>

          <div className="footer-column-premium">
            <h4 className="footer-column-heading-premium">{t('footer.categories.title')}</h4>
            <div className="footer-categories-grid">
              {categoryColumns.map((column, columnIndex) => (
                <ul className="footer-links-premium" key={`footer-category-col-${columnIndex}`}>
                  {column.map((category) => (
                    <li key={category.href}>
                      <a href={category.href} className="footer-link-premium">{category.name}</a>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>

        </div>

        <div className="footer-divider-premium"></div>
        <div className="footer-bottom-premium">
          <p className="footer-copyright-premium">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
      <div className="footer-glow-bottom"></div>
    </footer>
  );
}

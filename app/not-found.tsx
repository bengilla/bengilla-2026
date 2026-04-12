'use client';

import Link from 'next/link';
import { tContactMe } from '@/lib/i18n';

export default function NotFound() {
  function handleEmailClick(e: React.MouseEvent) {
    e.preventDefault();
    const email = 'bengilla@outlook.com';
    
    const link = document.createElement('a');
    link.href = `mailto:${email}`;
    link.style.display = 'none';
    document.body.appendChild(link);
    
    try {
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      document.body.removeChild(link);
    }
    
    setTimeout(() => {
      navigator.clipboard.writeText(email).then(() => {
        alert(`${tContactMe()}\n\n${email}`);
      }).catch(() => {});
    }, 100);
  }

  return (
    <div className="error-page">
      {/* Logo */}
      <Link href="/" className="error-logo">BENGILLA</Link>

      {/* 404 内容 */}
      <div className="error-content">
        <div className="error-code">404</div>
        <div className="error-line" />
        <div className="error-message">Page not found</div>
        <Link href="/" className="error-back">
          Back to home
        </Link>
      </div>

      {/* Footer */}
      <div className="error-footer">
        <button onClick={handleEmailClick} className="error-email">
          bengilla@outlook.com
        </button>
        <p className="error-copy">© 2026 bengilla.com. All rights reserved.</p>
      </div>

      <style jsx>{`
        .error-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #050505;
          padding: 20px;
          position: relative;
        }

        .error-logo {
          position: fixed;
          top: 20px;
          left: 20px;
          font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 4px;
          color: rgba(255, 255, 255, 0.9);
          text-transform: uppercase;
          text-decoration: none;
          opacity: 0.9;
        }

        .error-content {
          text-align: center;
        }

        .error-code {
          font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 80px;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.12);
          letter-spacing: 8px;
          margin-bottom: 24px;
        }

        .error-line {
          width: 40px;
          height: 1px;
          background: rgba(255, 255, 255, 0.2);
          margin: 0 auto 24px;
        }

        .error-message {
          font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.4);
          letter-spacing: 2px;
          margin-bottom: 40px;
        }

        .error-back {
          font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.3);
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .error-back:hover {
          color: rgba(255, 255, 255, 0.7);
        }

        .error-footer {
          position: fixed;
          bottom: 20px;
          left: 20px;
          right: 20px;
          text-align: center;
        }

        .error-email {
          font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.3);
          text-decoration: none;
          display: block;
          margin-bottom: 8px;
          transition: color 0.3s ease;
          background: none;
          border: none;
          cursor: pointer;
        }

        .error-email:hover {
          color: rgba(255, 255, 255, 0.6);
        }

        .error-copy {
          font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 1px;
        }

        @media (max-width: 600px) {
          .error-logo {
            top: 16px;
            left: 16px;
            font-size: 12px;
          }

          .error-code {
            font-size: 60px;
            letter-spacing: 4px;
          }

          .error-message {
            font-size: 13px;
          }

          .error-footer {
            bottom: 16px;
            left: 16px;
            right: 16px;
          }
        }
      `}</style>
    </div>
  );
}

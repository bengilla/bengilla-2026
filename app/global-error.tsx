'use client';

import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="error-page">
          <div className="error-content">
            <div className="error-code">Error</div>
            <div className="error-line" />
            <div className="error-message">Something went wrong</div>
            <button onClick={reset} className="error-back">
              Try again
            </button>
            <Link href="/" className="error-home">
              Back to home
            </Link>
          </div>
        </div>

        <style jsx>{`
          .error-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #050505;
            padding: 20px;
          }

          .error-content {
            text-align: center;
          }

          .error-code {
            font-family: var(--font-en), -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 48px;
            font-weight: 300;
            color: rgba(255, 255, 255, 0.15);
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
            font-family: var(--font-cn), -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.4);
            letter-spacing: 2px;
            margin-bottom: 40px;
          }

          .error-back,
          .error-home {
            display: block;
            font-family: var(--font-en), -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 11px;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.3);
            text-decoration: none;
            transition: color 0.3s ease;
            cursor: pointer;
            margin-bottom: 16px;
            background: none;
            border: none;
          }

          .error-back:hover,
          .error-home:hover {
            color: rgba(255, 255, 255, 0.7);
          }
        `}</style>
      </body>
    </html>
  );
}

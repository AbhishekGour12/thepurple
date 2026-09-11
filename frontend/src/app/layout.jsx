import './globals.css';
import AppProviders from '@/store/provider';

export const metadata = {
  title: 'ThePurple — Premium E-Commerce Platform',
  description: 'Scalable fashion and jewellery e-commerce platform built on Next.js, Node.js, PostgreSQL, Redis, BullMQ, and Meilisearch.',
  keywords: 'ecommerce, thepurple, jewellery, fashion, online store',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}


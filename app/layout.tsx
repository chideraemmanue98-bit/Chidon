import React from 'react';
import '../src/index.css';

export const metadata = {
  title: 'Chidon IQ',
  description: 'Master AI content writing, growth strategies, and automated video workflows.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#070A13] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}

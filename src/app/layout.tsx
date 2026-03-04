
import type {Metadata} from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'IndigoPDF | Free, Private & Powerful PDF Tools',
  description: 'Manage, convert, edit, and secure your PDF files completely free and private in your browser.',
  icons: {
    icon: 'https://res.cloudinary.com/dodhvvewu/image/upload/v1772620326/4a04717a-d297-45cc-a834-61ee0a1d0247_o4cliy.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <link rel="icon" href="https://res.cloudinary.com/dodhvvewu/image/upload/v1772620326/4a04717a-d297-45cc-a834-61ee0a1d0247_o4cliy.png" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-background selection:bg-primary/20">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

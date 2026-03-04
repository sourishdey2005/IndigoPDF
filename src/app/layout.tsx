import type {Metadata} from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'IndigoPDF | Free, Private & Secure Online PDF Tools',
  description: 'The ultimate privacy-first PDF suite. Effortlessly merge, split, compress, edit, and convert PDFs 100% locally in your browser. No uploads, no limits, all free.',
  keywords: 'PDF tools, merge PDF, split PDF, compress PDF, PDF to Word, PDF OCR, free PDF editor, secure PDF, private PDF converter',
  icons: {
    icon: 'https://res.cloudinary.com/dodhvvewu/image/upload/v1772620326/4a04717a-d297-45cc-a834-61ee0a1d0247_o4cliy.png',
  },
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<any>;
}) {
  // Await params to prevent Next.js 15 enumeration warnings
  await props.params;
  const { children } = props;

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

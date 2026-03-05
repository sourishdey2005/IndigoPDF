
import Link from "next/link";
import Image from "next/image";
import { Github, Linkedin, Globe, ExternalLink, Smartphone, Mail, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t py-16 dark:bg-slate-900 transition-colors">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand & Mission */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-4">
              <div className="relative w-14 h-14 bg-white rounded-2xl flex items-center justify-center overflow-hidden border shadow-sm transition-transform hover:rotate-3">
                <Image 
                  src="https://res.cloudinary.com/dodhvvewu/image/upload/v1772620326/4a04717a-d297-45cc-a834-61ee0a1d0247_o4cliy.png" 
                  alt="IndigoPDF Logo" 
                  fill
                  className="object-contain p-1"
                />
              </div>
              <span className="text-2xl font-bold tracking-tight font-headline">
                Indigo<span className="text-primary">PDF</span>
              </span>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              The ultimate privacy-first PDF utility suite. Effortlessly manage your documents locally without ever uploading sensitive data to a server.
            </p>
            <div className="flex items-center gap-4">
              <Link 
                href="https://github.com/sourishdey2005/IndigoPDF" 
                target="_blank" 
                className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border shadow-sm hover:text-primary transition-all hover:-translate-y-1"
              >
                <Github size={18} />
              </Link>
              <Link 
                href="https://www.linkedin.com/in/sourish-dey-20b170206/" 
                target="_blank" 
                className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border shadow-sm hover:text-primary transition-all hover:-translate-y-1"
              >
                <Linkedin size={18} />
              </Link>
              <Link 
                href="/contact" 
                className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border shadow-sm hover:text-primary transition-all hover:-translate-y-1"
              >
                <Mail size={18} />
              </Link>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-slate-400">Popular Tools</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-600 dark:text-slate-400">
              <li><Link href="/merge-pdf" className="hover:text-primary transition-colors flex items-center gap-2">Merge PDF</Link></li>
              <li><Link href="/compress-pdf" className="hover:text-primary transition-colors flex items-center gap-2">Compress PDF</Link></li>
              <li><Link href="/ocr-pdf" className="hover:text-primary transition-colors flex items-center gap-2">OCR PDF</Link></li>
              <li><Link href="/organize-pdf" className="hover:text-primary transition-colors flex items-center gap-2">Organize PDF</Link></li>
              <li><Link href="/unlock-pdf" className="hover:text-primary transition-colors flex items-center gap-2">Unlock PDF</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-slate-400">Company</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-600 dark:text-slate-400">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li>
                <Link 
                  href="https://sourishdeyportfolio.vercel.app/" 
                  target="_blank" 
                  className="inline-flex items-center gap-1 group hover:text-primary transition-colors"
                >
                  Portfolio <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Mobile App Promo */}
          <div className="lg:col-span-4 bg-primary/5 dark:bg-primary/10 rounded-3xl p-8 border border-primary/10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center">
                <Smartphone size={20} />
              </div>
              <div>
                <h4 className="font-bold text-lg leading-tight">Mobile Suite</h4>
                <p className="text-xs text-muted-foreground">IndigoPDF for Android</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Process documents on the go with our native Android application. Lightweight, fast, and secure.
            </p>
            <Link 
              href="https://www.upload-apk.com/jeHEIWT6ev8dxos" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block transition-transform hover:scale-105 active:scale-95"
            >
              <div className="relative w-full h-[70px] overflow-hidden rounded-xl shadow-2xl border bg-white dark:bg-slate-800 flex items-center justify-center p-2">
                <Image 
                  src="https://res.cloudinary.com/dodhvvewu/image/upload/v1772635160/IndigoPDF_kw0cqb.png" 
                  alt="Download IndigoPDF APK" 
                  fill
                  className="object-contain p-2"
                />
              </div>
            </Link>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-1 text-center md:text-left">
            <p className="text-[13px] text-slate-500 font-medium">
              © {new Date().getFullYear()} IndigoPDF. Native browser-based processing.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-1 text-[13px] text-slate-400">
              <span>Developed with</span>
              <Heart size={12} className="fill-red-500 text-red-500" />
              <span>by</span>
              <Link 
                href="https://sourishdeyportfolio.vercel.app/" 
                target="_blank" 
                className="text-primary font-bold hover:underline underline-offset-4"
              >
                Sourish Dey
              </Link>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            <span>Security First</span>
            <span>Zero Server Uploads</span>
            <span>100% Free</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

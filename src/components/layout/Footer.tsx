
import Link from "next/link";
import Image from "next/image";
import { Github, Linkedin, Globe, ExternalLink, Smartphone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t py-16 dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-1 lg:col-span-1">
            <Link href="/" className="flex items-center gap-4 mb-6">
              <div className="relative w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden border shadow-sm">
                <Image 
                  src="https://res.cloudinary.com/dodhvvewu/image/upload/v1772620326/4a04717a-d297-45cc-a834-61ee0a1d0247_o4cliy.png" 
                  alt="IndigoPDF Logo" 
                  fill
                  className="object-contain p-1"
                />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                Indigo<span className="text-primary">PDF</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Modern, privacy-first PDF tools. Your files never leave your browser. 100% free, forever.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-6 text-sm uppercase tracking-wider text-slate-400">Tools</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/merge-pdf" className="hover:text-primary transition-colors">Merge PDF</Link></li>
              <li><Link href="/compress-pdf" className="hover:text-primary transition-colors">Compress PDF</Link></li>
              <li><Link href="/ocr-pdf" className="hover:text-primary transition-colors">OCR PDF</Link></li>
              <li><Link href="/translate-pdf" className="hover:text-primary transition-colors">Translate PDF</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-6 text-sm uppercase tracking-wider text-slate-400">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-6 text-sm uppercase tracking-wider text-slate-400">Developer</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>
                <Link 
                  href="https://sourishdeyportfolio.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 hover:text-primary transition-colors group"
                >
                  <Globe size={14} />
                  <span>Portfolio</span>
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link 
                  href="https://www.linkedin.com/in/sourish-dey-20b170206/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 hover:text-primary transition-colors group"
                >
                  <Linkedin size={14} />
                  <span>LinkedIn</span>
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link 
                  href="https://github.com/sourishdey2005" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 hover:text-primary transition-colors group"
                >
                  <Github size={14} />
                  <span>GitHub</span>
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Smartphone size={16} />
              Mobile App
            </h4>
            <Link 
              href="https://www.upload-apk.com/jeHEIWT6ev8dxos" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block transition-transform hover:scale-105 active:scale-95"
            >
              <div className="relative w-[280px] h-[84px] overflow-hidden rounded-2xl shadow-xl border bg-white flex items-center justify-center">
                <Image 
                  src="https://res.cloudinary.com/dodhvvewu/image/upload/v1772635160/IndigoPDF_kw0cqb.png" 
                  alt="Download IndigoPDF APK" 
                  fill
                  className="object-contain p-1"
                />
              </div>
            </Link>
            <p className="text-xs text-muted-foreground leading-tight max-w-[280px]">
              Take IndigoPDF on the go. Download the official APK for your Android device and process documents anywhere.
            </p>
          </div>
        </div>
        
        <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-1 text-center md:text-left">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} IndigoPDF. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Developed by <Link href="https://sourishdeyportfolio.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-primary font-medium underline underline-offset-2">Sourish Dey</Link>
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Link 
              href="https://github.com/sourishdey2005/IndigoPDF" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-muted-foreground hover:text-primary transition-colors"
              title="GitHub Repository"
            >
              <Github size={20} />
            </Link>
            <Link 
              href="https://www.linkedin.com/in/sourish-dey-20b170206/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-muted-foreground hover:text-primary transition-colors"
              title="LinkedIn"
            >
              <Linkedin size={20} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

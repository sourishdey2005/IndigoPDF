
import Link from "next/link";
import { FileText, Github, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t py-12 dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <FileText size={18} />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Indigo<span className="text-primary">PDF</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Modern, privacy-first PDF tools. Your files never leave your browser. 100% free, forever.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-slate-400">Organize</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/merge-pdf" className="hover:text-primary transition-colors">Merge PDF</Link></li>
              <li><Link href="/split-pdf" className="hover:text-primary transition-colors">Split PDF</Link></li>
              <li><Link href="/organize-pdf" className="hover:text-primary transition-colors">Organize PDF</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-slate-400">Convert</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/jpg-to-pdf" className="hover:text-primary transition-colors">JPG to PDF</Link></li>
              <li><Link href="/pdf-to-jpg" className="hover:text-primary transition-colors">PDF to JPG</Link></li>
              <li><Link href="/word-to-pdf" className="hover:text-primary transition-colors">Word to PDF</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-slate-400">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1 text-center md:text-left">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} IndigoPDF. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Made By <Link href="https://sourishdeyportfolio.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-primary font-medium underline underline-offset-2">Sourish Dey</Link>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="https://github.com/sourishdey2005" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-muted-foreground hover:text-primary transition-colors"
              title="GitHub"
            >
              <Github size={18} />
            </Link>
            <Link 
              href="https://www.linkedin.com/in/sourish-dey-20b170206/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-muted-foreground hover:text-primary transition-colors"
              title="LinkedIn"
            >
              <Linkedin size={18} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

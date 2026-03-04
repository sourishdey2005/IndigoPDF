
"use client";

import Link from "next/link";
import { FileText, Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  return (
    <header className="glass-header">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white transition-transform group-hover:rotate-6">
            <FileText size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight font-headline">
            Indigo<span className="text-primary">PDF</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors">
                All Tools <ChevronDown size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem asChild><Link href="/merge-pdf">Merge PDF</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/split-pdf">Split PDF</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/compress-pdf">Compress PDF</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/ocr-pdf">OCR PDF</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/protect-pdf">Protect PDF</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How it Works</Link>
          <Link href="/#faq" className="text-sm font-medium hover:text-primary transition-colors">FAQ</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="hidden sm:flex">Login</Button>
          <Button size="sm" className="rounded-full shadow-lg shadow-primary/20">Get Started</Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu size={20} />
          </Button>
        </div>
      </div>
    </header>
  );
}

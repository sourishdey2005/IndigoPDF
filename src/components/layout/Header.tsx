
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, ChevronDown, Combine, Scissors, Zap, Lock, FileSearch, Languages, Camera, FileText, Sun, Moon, X, Info, ShieldCheck, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

const NAV_TOOLS = [
  { group: "Organize", items: [
    { name: "Merge PDF", href: "/merge-pdf", icon: Combine },
    { name: "Split PDF", href: "/split-pdf", icon: Scissors },
    { name: "Organize PDF", href: "/organize-pdf", icon: FileText },
  ]},
  { group: "Optimize & Convert", items: [
    { name: "Compress PDF", href: "/compress-pdf", icon: Zap },
    { name: "PDF to Word", href: "/pdf-to-word", icon: FileText },
    { name: "JPG to PDF", href: "/jpg-to-pdf", icon: FileText },
  ]},
  { group: "Advanced", items: [
    { name: "OCR PDF", href: "/ocr-pdf", icon: FileSearch },
    { name: "Translate PDF", href: "/translate-pdf", icon: Languages },
    { name: "Scan to PDF", href: "/scan-to-pdf", icon: Camera },
  ]}
];

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="glass-header">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 sm:gap-5 group">
          <div className="relative w-14 h-14 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center overflow-hidden border transition-transform group-hover:rotate-6 shadow-md">
            <Image 
              src="https://res.cloudinary.com/dodhvvewu/image/upload/v1772620326/4a04717a-d297-45cc-a834-61ee0a1d0247_o4cliy.png" 
              alt="IndigoPDF Logo" 
              fill
              className="object-contain p-1"
            />
          </div>
          <span className="text-xl sm:text-3xl font-bold tracking-tight font-headline">
            Indigo<span className="text-primary">PDF</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors outline-none">
                All Tools <ChevronDown size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 p-2">
              {NAV_TOOLS.map((group) => (
                <div key={group.group}>
                  <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2 first:mt-0">
                    {group.group}
                  </DropdownMenuLabel>
                  {group.items.map((item) => (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link href={item.href} className="flex items-center gap-2">
                        <item.icon size={14}/> {item.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How it Works</Link>
          <Link href="/#faq" className="text-sm font-medium hover:text-primary transition-colors">FAQ</Link>
        </nav>

        <div className="flex items-center gap-2">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full h-9 w-9 sm:h-10 sm:w-10"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
          )}
          
          <div className="hidden sm:block">
            {mounted ? (
              <Button size="lg" className="rounded-full shadow-lg shadow-primary/20 font-bold px-8">
                Get Started
              </Button>
            ) : (
              <div className="h-10 w-28 bg-primary/10 animate-pulse rounded-full" />
            )}
          </div>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden rounded-full h-9 w-9">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
              <SheetHeader className="p-6 border-b text-left">
                <SheetTitle className="flex items-center gap-2">
                  <div className="relative w-10 h-10 bg-white rounded-lg border overflow-hidden">
                    <Image 
                      src="https://res.cloudinary.com/dodhvvewu/image/upload/v1772620326/4a04717a-d297-45cc-a834-61ee0a1d0247_o4cliy.png" 
                      alt="Logo" 
                      fill
                      className="object-contain p-0.5"
                    />
                  </div>
                  IndigoPDF
                </SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-80px)] p-6">
                <div className="space-y-8 pb-10">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">General</h4>
                    <div className="grid gap-2">
                      <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                        <Info size={18} className="text-primary" />
                        <span className="font-medium">Home</span>
                      </Link>
                      <Link href="/#how-it-works" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                        <Settings size={18} className="text-primary" />
                        <span className="font-medium">How it Works</span>
                      </Link>
                      <Link href="/#faq" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                        <ShieldCheck size={18} className="text-primary" />
                        <span className="font-medium">FAQ</span>
                      </Link>
                    </div>
                  </div>

                  {NAV_TOOLS.map((group) => (
                    <div key={group.group} className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{group.group}</h4>
                      <div className="grid gap-2">
                        {group.items.map((item) => (
                          <Link 
                            key={item.name} 
                            href={item.href} 
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                          >
                            <item.icon size={18} className="text-primary" />
                            <span className="font-medium">{item.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

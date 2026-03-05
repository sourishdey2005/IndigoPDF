"use client";

import { useState, use } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Combine, 
  Scissors, 
  Zap, 
  Image as ImageIcon, 
  ShieldCheck, 
  FileSearch, 
  RotateCw, 
  Type, 
  Grid3X3,
  FileText,
  LayoutGrid,
  FileSpreadsheet,
  Presentation,
  Layers,
  Wrench,
  Search,
  Crop,
  ArrowRight,
  HelpCircle,
  XCircle,
  Hash,
  Palette,
  Edit3,
  Code,
  PenTool,
  Globe,
  Camera,
  Cpu,
  MousePointer2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolCard } from "@/components/tools/ToolCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const tools = [
  // Organize
  { id: 'merge', title: "Merge PDF", description: "Combine multiple PDF files into one single document in seconds.", icon: Combine, href: "/merge-pdf", category: "Organize" },
  { id: 'split', title: "Split PDF", description: "Extract specific page ranges or split every page into separate files.", icon: Scissors, href: "/split-pdf", category: "Organize" },
  { id: 'organize', title: "Organize PDF", description: "Sort, delete, and reorder pages however you like in your browser.", icon: Grid3X3, href: "/organize-pdf", category: "Organize" },
  { id: 'delete-pages', title: "Delete Pages", description: "Instantly remove unwanted pages from any PDF document.", icon: XCircle, href: "/delete-pages", category: "Organize" },
  { id: 'batch-rename', title: "Batch Rename", description: "Automatically rename multiple PDF files using custom sequence patterns.", icon: Edit3, href: "/batch-rename", category: "Organize" },
  
  // Optimize
  { id: 'compress', title: "Compress PDF", description: "Reduce PDF file size while maintaining the highest possible quality.", icon: Zap, href: "/compress-pdf", category: "Optimize" },
  { id: 'repair', title: "Repair PDF", description: "Fix damaged or corrupt PDF documents and recover your critical data.", icon: Wrench, href: "/repair-pdf", category: "Optimize" },
  { id: 'flatten', title: "Flatten PDF", description: "Merge form fields and layers into page content to prevent editing.", icon: Layers, href: "/flatten-pdf", category: "Optimize" },
  { id: 'grayscale', title: "PDF Grayscale", description: "Convert color PDF documents to monochrome to save printing costs.", icon: Palette, href: "/pdf-grayscale", category: "Optimize" },
  
  // Convert From PDF
  { id: 'pdf-to-word', title: "PDF to Word", description: "Convert PDF files into high-accuracy editable Word documents.", icon: FileText, href: "/pdf-to-word", category: "Convert" },
  { id: 'pdf-to-excel', title: "PDF to Excel", description: "Extract table data from PDF into Excel spreadsheets instantly.", icon: FileSpreadsheet, href: "/pdf-to-excel", category: "Convert" },
  { id: 'pdf-to-ppt', title: "PDF to PowerPoint", description: "Turn PDF files into fully editable PowerPoint slideshows.", icon: Presentation, href: "/pdf-to-ppt", category: "Convert" },
  { id: 'pdf-to-jpg', title: "PDF to JPG", description: "Convert each PDF page into high-resolution JPG images.", icon: ImageIcon, href: "/pdf-to-jpg", category: "Convert" },
  { id: 'pdf-to-text', title: "PDF to Text", description: "Extract raw text data from digital PDF files with ease.", icon: FileText, href: "/pdf-to-text", category: "Convert" },
  { id: 'pdf-to-html', title: "PDF to HTML", description: "Convert PDF to clean, responsive, web-ready HTML code.", icon: Code, href: "/pdf-to-html", category: "Convert" },
  
  // Convert To PDF
  { id: 'word-to-pdf', title: "Word to PDF", description: "Convert DOC and DOCX documents into high-quality PDF files.", icon: FileText, href: "/word-to-pdf", category: "Convert" },
  { id: 'excel-to-pdf', title: "Excel to PDF", description: "Transform Excel spreadsheets into portable PDF documents.", icon: FileSpreadsheet, href: "/excel-to-pdf", category: "Convert" },
  { id: 'ppt-to-pdf', title: "PowerPoint to PDF", description: "Convert PowerPoint presentations into universal PDF format.", icon: Presentation, href: "/ppt-to-pdf", category: "Convert" },
  { id: 'jpg-to-pdf', title: "JPG to PDF", description: "Convert JPG and PNG images into a single PDF document.", icon: ImageIcon, href: "/jpg-to-pdf", category: "Convert" },
  { id: 'html-to-pdf', title: "HTML to PDF", description: "Capture any webpage URL and save it as a high-fidelity PDF.", icon: Globe, href: "/html-to-pdf", category: "Convert" },
  
  // Edit
  { id: 'edit-pdf', title: "Edit PDF", description: "Add text, annotations, and shapes directly to your document.", icon: PenTool, href: "/edit-pdf", category: "Edit" },
  { id: 'ocr', title: "OCR PDF", description: "Convert scanned PDFs into searchable and selectable digital text.", icon: FileSearch, href: "/ocr-pdf", category: "Edit" },
  { id: 'rotate', title: "Rotate PDF", description: "Rotate PDF pages clockwise or counter-clockwise permanently.", icon: RotateCw, href: "/rotate-pdf", category: "Edit" },
  { id: 'watermark', title: "Watermark", description: "Stamp custom text or images over your PDF for branding.", icon: ShieldCheck, href: "/watermark-pdf", category: "Edit" },
  { id: 'page-nums', title: "Page Numbers", description: "Add sequential page numbering with custom positioning.", icon: Type, href: "/page-numbers", category: "Edit" },
  { id: 'bates', title: "Bates Numbering", description: "Apply legal-grade Bates numbering to your business documents.", icon: Hash, href: "/bates-numbering", category: "Edit" },
  { id: 'crop', title: "Crop PDF", description: "Precisely crop margins or specific areas of your PDF document.", icon: Crop, href: "/crop-pdf", category: "Edit" },
  { id: 'metadata', title: "Metadata Editor", description: "Edit Title, Author, Subject, and Keywords of your PDF files.", icon: ShieldCheck, href: "/add-metadata", category: "Edit" },
  
  // Security
  { id: 'sign', title: "Sign PDF", description: "Draw or upload your signature to sign documents instantly.", icon: PenTool, href: "/sign-pdf", category: "Security" },

  // Specialized
  { id: 'scan-to-pdf', title: "Scan to PDF", description: "Use your device camera to scan paper documents into PDF.", icon: Camera, href: "/scan-to-pdf", category: "Specialized" },
  { id: 'compare', title: "Compare PDF", description: "Spot differences and changes between two PDF versions instantly.", icon: Search, href: "/compare-pdf", category: "Specialized" },
  { id: 'extract-images', title: "Extract Images", description: "Pull all high-resolution images from a PDF into separate files.", icon: LayoutGrid, href: "/extract-images", category: "Specialized" },
];

const faqs = [
  {
    question: "Is IndigoPDF really free?",
    answer: "Yes, absolutely! All our PDF tools are 100% free to use with no hidden subscriptions, watermarks, or page limits."
  },
  {
    question: "How secure is my data?",
    answer: "IndigoPDF processes your files directly in your browser. Your documents are never uploaded to our servers, meaning your sensitive data never leaves your device."
  },
  {
    question: "Do I need to install software?",
    answer: "No installation is required. IndigoPDF works directly in any modern browser."
  }
];

export default function Home(props: { params: Promise<any>; searchParams: Promise<any> }) {
  // Await promises in Client Component to prevent Next.js 15 enumeration warnings
  use(props.params);
  use(props.searchParams);
  
  const [activeTab, setActiveTab] = useState("All");

  const filteredTools = activeTab === "All" 
    ? tools 
    : tools.filter(t => t.category === activeTab);

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center pt-20 pb-16 lg:pt-32 lg:pb-40 overflow-hidden bg-slate-50 dark:bg-slate-900/50">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] -left-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[80px] sm:blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              x: [0, -40, 0],
              y: [0, 60, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] -right-[10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[70px] sm:blur-[100px]" 
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-bold mb-6 sm:mb-8 border border-primary/20">
                <Zap size={14} className="fill-primary" />
                <span>100% Private Browser-Based PDF Tools</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 sm:mb-8 font-headline leading-[1.1] text-slate-900 dark:text-white">
                The Ultimate <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">PDF Power Suite</span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 mb-8 sm:mb-12 leading-relaxed font-medium">
                Professional-grade PDF management without the privacy risk. <strong>Merge, Split, Compress, OCR, and Convert</strong> your documents 100% locally in your browser.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-5">
                <a href="#tools" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto rounded-full h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg font-bold shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95">
                    Explore 30+ Tools
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <a href="#how-it-works" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg font-bold border-2 hover:bg-slate-100 transition-all active:scale-95">
                    How it Works
                  </Button>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="mt-10 sm:mt-12 pt-8 sm:pt-12 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-4 sm:gap-8">
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">100%</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest font-bold">Private</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">0</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest font-bold">Costs</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Instant</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest font-bold leading-tight">Speed</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, type: "spring" }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full max-w-lg aspect-square mx-auto">
                <motion.div 
                  animate={{ 
                    y: [0, -20, 0],
                    rotate: [0, 2, 0, -2, 0]
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative w-full h-full"
                >
                  <Image 
                    src="https://res.cloudinary.com/dodhvvewu/image/upload/v1772620326/4a04717a-d297-45cc-a834-61ee0a1d0247_o4cliy.png"
                    alt="IndigoPDF Hero Logo"
                    fill
                    className="object-contain drop-shadow-[0_20px_50px_rgba(79,70,229,0.3)]"
                    priority
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Benefits Section */}
      <section className="py-16 sm:py-24 bg-white dark:bg-slate-950 border-y border-slate-100 dark:border-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12">
            {[
              { icon: ShieldCheck, title: "Privacy First", color: "emerald", desc: "Documents are processed entirely within your browser's local sandbox. No data ever leaves your device." },
              { icon: Cpu, title: "Native Speed", color: "amber", desc: "Leveraging the full power of your machine's hardware for high-speed PDF manipulation without server latency." },
              { icon: MousePointer2, title: "Zero Friction", color: "indigo", desc: "No signups, no watermarks, and no annoying download limits. Just upload, process, and download." }
            ].map((benefit, i) => (
              <motion.div key={i} whileHover={{ y: -5 }} className="space-y-4 text-center sm:text-left">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner mx-auto sm:mx-0",
                  benefit.color === "emerald" ? "bg-emerald-100 text-emerald-600" :
                  benefit.color === "amber" ? "bg-amber-100 text-amber-600" :
                  "bg-indigo-100 text-indigo-600"
                )}>
                  <benefit.icon size={28} />
                </div>
                <h3 className="text-xl font-bold">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  {benefit.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-16 sm:py-24 container mx-auto px-4 scroll-mt-20">
        <div className="flex flex-col items-center justify-between mb-12 sm:mb-16 gap-8 text-center lg:flex-row lg:text-left">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold font-headline">Professional Toolset</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl">
              Everything you need to manage your PDF documents securely, organized by category for easy access.
            </p>
          </div>
          
          <Tabs defaultValue="All" onValueChange={setActiveTab} className="w-full lg:w-auto">
            <TabsList className="bg-white dark:bg-slate-800 p-1 h-auto sm:h-14 rounded-2xl border shadow-xl flex flex-wrap sm:flex-nowrap justify-center overflow-hidden">
              {["All", "Organize", "Optimize", "Convert", "Edit", "Security", "Specialized"].map((tab) => (
                <TabsTrigger 
                  key={tab} 
                  value={tab} 
                  className="rounded-xl px-3 sm:px-6 py-2 sm:h-full text-xs sm:text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
        >
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} {...tool} />
          ))}
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-950 scroll-mt-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12 sm:mb-16">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
              <HelpCircle size={32} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-headline tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground mt-2">Everything you need to know about IndigoPDF.</p>
          </div>
          
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="bg-white dark:bg-slate-900 px-6 sm:px-8 rounded-3xl border shadow-sm overflow-hidden border-none">
                <AccordionTrigger className="text-base sm:text-lg font-bold hover:no-underline py-5 sm:py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 dark:text-slate-400 text-sm sm:text-base pb-6 sm:pb-8">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

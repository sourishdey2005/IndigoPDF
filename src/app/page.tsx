
"use client";

import { useState } from "react";
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
  Lock, 
  Unlock, 
  Grid3X3,
  FileText,
  LayoutGrid,
  FileSpreadsheet,
  Presentation,
  FileCode,
  PenTool,
  Globe,
  Camera,
  Layers,
  Wrench,
  Search,
  EyeOff,
  Crop,
  Languages,
  ArrowRight,
  HelpCircle,
  FileQuestion,
  Info,
  XCircle,
  Hash,
  Palette,
  Edit3,
  Code
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
  { id: 'metadata', title: "Metadata Editor", description: "Edit Title, Author, Subject, and Keywords of your PDF files.", icon: Info, href: "/add-metadata", category: "Edit" },
  
  // Security
  { id: 'protect', title: "Protect PDF", description: "Secure your PDF files with high-strength password encryption.", icon: Lock, href: "/protect-pdf", category: "Security" },
  { id: 'unlock', title: "Unlock PDF", description: "Remove passwords and security restrictions from PDF files.", icon: Unlock, href: "/unlock-pdf", category: "Security" },
  { id: 'redact', title: "Redact PDF", description: "Permanently black out sensitive information from your PDF.", icon: EyeOff, href: "/redact-pdf", category: "Security" },
  { id: 'sign', title: "Sign PDF", description: "Draw or upload your signature to sign documents instantly.", icon: PenTool, href: "/sign-pdf", category: "Security" },

  // Specialized
  { id: 'translate', title: "Translate PDF", description: "AI-powered translation that preserves your original PDF layout.", icon: Languages, href: "/translate-pdf", category: "Specialized" },
  { id: 'pdf-to-pdfa', title: "PDF to PDF/A", description: "Transform standard PDFs into PDF/A for long-term archiving.", icon: Layers, href: "/pdf-to-pdfa", category: "Specialized" },
  { id: 'scan-to-pdf', title: "Scan to PDF", description: "Use your device camera to scan paper documents into PDF.", icon: Camera, href: "/scan-to-pdf", category: "Specialized" },
  { id: 'compare', title: "Compare PDF", description: "Spot differences and changes between two PDF versions instantly.", icon: Search, href: "/compare-pdf", category: "Specialized" },
  { id: 'extract-images', title: "Extract Images", description: "Pull all high-resolution images from a PDF into separate files.", icon: LayoutGrid, href: "/extract-images", category: "Specialized" },
];

const faqs = [
  {
    question: "Is IndigoPDF really free?",
    answer: "Yes, absolutely! All our PDF tools are 100% free to use with no hidden subscriptions, watermarks, or page limits. We provide high-quality PDF processing because we believe privacy-respecting tools should be accessible to everyone."
  },
  {
    question: "How secure is my data?",
    answer: "IndigoPDF is uniquely secure. Unlike standard online PDF converters, our tools process your files directly in your browser using WebAssembly. Your documents are never uploaded to our servers, meaning your sensitive data never leaves your device."
  },
  {
    question: "Do I need to install software?",
    answer: "No installation is required. IndigoPDF is a progressive web app that works directly in any modern browser on Windows, macOS, Linux, iOS, and Android."
  },
  {
    question: "Are there file size limits?",
    answer: "The only limit is your device's memory. Since all processing happens locally, extremely large files (e.g., over 1GB) might be limited by your browser's RAM, but IndigoPDF does not impose any artificial software limits."
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("All");

  const filteredTools = activeTab === "All" 
    ? tools 
    : tools.filter(t => t.category === activeTab);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section - Optimized for SEO */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-slate-50 dark:bg-slate-900/50">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-30 pointer-events-none">
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              <Zap size={14} className="fill-primary" />
              <span>100% Private Browser-Based PDF Tools</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 font-headline leading-tight">
              Free & Secure <br />
              <span className="text-primary">PDF Power Tools</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
              Professional-grade PDF management without the privacy risk. <strong>Merge, Split, Compress, OCR, and Convert</strong> your documents locally in your browser. Fast, free, and no file uploads required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#tools">
                <Button size="lg" className="rounded-full h-14 px-8 text-lg font-semibold shadow-xl shadow-primary/20" aria-label="Explore all PDF tools">
                  Explore Tools
                </Button>
              </a>
              <a href="#how-it-works">
                <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-lg bg-white dark:bg-slate-800" aria-label="Learn how IndigoPDF works">
                  How it Works
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-20 container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold mb-2">Our PDF Toolset</h2>
            <p className="text-muted-foreground">Everything you need to manage your PDF documents securely.</p>
          </div>
          
          <Tabs defaultValue="All" onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="bg-white dark:bg-slate-800 p-1 h-12 rounded-xl border shadow-sm flex overflow-x-auto no-scrollbar">
              {["All", "Organize", "Optimize", "Convert", "Edit", "Security", "Specialized"].map((tab) => (
                <TabsTrigger 
                  key={tab} 
                  value={tab} 
                  className="rounded-lg px-6 h-full data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} {...tool} />
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-white dark:bg-slate-900/20 border-y">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How it Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Get professional results in three simple steps, without your files ever leaving your device.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "Select Tool", desc: "Choose from over 35+ professional PDF tools designed for every document need.", icon: Grid3X3 },
              { step: "02", title: "Upload & Process", desc: "Drag and drop your files. High-speed processing happens instantly in your local browser.", icon: Zap },
              { step: "03", title: "Download Result", desc: "Get your optimized document immediately. Fast, secure, and always 100% free.", icon: ArrowRight }
            ].map((item, idx) => (
              <div key={idx} className="relative group p-8 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl transition-all">
                <div className="text-6xl font-black text-primary/5 absolute top-4 right-8" aria-hidden="true">{item.step}</div>
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                  <item.icon size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-16">Why Choose IndigoPDF?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 text-primary">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Unmatched Privacy</h3>
              <p className="text-slate-400">Processing occurs entirely in your browser. Your files never touch our servers, ensuring your sensitive data stays strictly yours.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mb-6 text-secondary">
                <Zap size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Elite Performance</h3>
              <p className="text-slate-400">Powered by advanced WebAssembly and browser-side AI, our tools provide near-instant results without internet latency.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mb-6 text-accent">
                <Languages size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">AI Smart Features</h3>
              <p className="text-slate-400">From intelligent OCR to layout-preserving translation, we use next-gen local AI models to simplify your PDF workflow.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <HelpCircle className="text-primary" />
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">Everything you need to know about IndigoPDF security, privacy, and features.</p>
          </div>
          
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="bg-white dark:bg-slate-900 px-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                <AccordionTrigger className="text-lg font-bold hover:no-underline">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-slate-600 dark:text-slate-400 text-base pb-6 leading-relaxed">
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

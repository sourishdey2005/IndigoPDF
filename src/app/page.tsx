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
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolCard } from "@/components/tools/ToolCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tools = [
  // Organize
  { id: 'merge', title: "Merge PDF", description: "Combine PDFs in the order you want.", icon: Combine, href: "/merge-pdf", category: "Organize" },
  { id: 'split', title: "Split PDF", description: "Separate one page or a whole set into independent files.", icon: Scissors, href: "/split-pdf", category: "Organize" },
  { id: 'organize', title: "Organize PDF", description: "Sort, delete, and reorder pages however you like.", icon: Grid3X3, href: "/organize-pdf", category: "Organize" },
  
  // Optimize
  { id: 'compress', title: "Compress PDF", description: "Reduce file size while optimizing for quality.", icon: Zap, href: "/compress-pdf", category: "Optimize" },
  { id: 'repair', title: "Repair PDF", description: "Repair a damaged PDF and recover data.", icon: Wrench, href: "/repair-pdf", category: "Optimize" },
  
  // Convert From PDF
  { id: 'pdf-to-word', title: "PDF to Word", description: "Convert PDFs into editable DOC and DOCX documents.", icon: FileText, href: "/pdf-to-word", category: "Convert" },
  { id: 'pdf-to-excel', title: "PDF to Excel", description: "Pull data from PDFs into Excel spreadsheets.", icon: FileSpreadsheet, href: "/pdf-to-excel", category: "Convert" },
  { id: 'pdf-to-ppt', title: "PDF to PowerPoint", description: "Turn PDF files into PPT and PPTX slideshows.", icon: Presentation, href: "/pdf-to-ppt", category: "Convert" },
  { id: 'pdf-to-jpg', title: "PDF to JPG", description: "Convert each PDF page into a high-quality JPG.", icon: ImageIcon, href: "/pdf-to-jpg", category: "Convert" },
  
  // Convert To PDF
  { id: 'word-to-pdf', title: "Word to PDF", description: "Convert DOC and DOCX files to PDF.", icon: FileText, href: "/word-to-pdf", category: "Convert" },
  { id: 'excel-to-pdf', title: "Excel to PDF", description: "Make Excel spreadsheets easy to read as PDF.", icon: FileSpreadsheet, href: "/excel-to-pdf", category: "Convert" },
  { id: 'ppt-to-pdf', title: "PowerPoint to PDF", description: "Convert PPT and PPTX slideshows to PDF.", icon: Presentation, href: "/ppt-to-pdf", category: "Convert" },
  { id: 'jpg-to-pdf', title: "JPG to PDF", description: "Convert JPG images to PDF in seconds.", icon: ImageIcon, href: "/jpg-to-pdf", category: "Convert" },
  { id: 'html-to-pdf', title: "HTML to PDF", description: "Convert webpages to PDF using URLs.", icon: Globe, href: "/html-to-pdf", category: "Convert" },
  
  // Edit
  { id: 'edit-pdf', title: "Edit PDF", description: "Add text, images, shapes or freehand annotations.", icon: PenTool, href: "/edit-pdf", category: "Edit" },
  { id: 'ocr', title: "OCR PDF", description: "Convert scanned PDFs into searchable documents.", icon: FileSearch, href: "/ocr-pdf", category: "Edit" },
  { id: 'rotate', title: "Rotate PDF", description: "Rotate your PDFs precisely how you need.", icon: RotateCw, href: "/rotate-pdf", category: "Edit" },
  { id: 'watermark', title: "Watermark", description: "Stamp image or text over your PDF.", icon: ShieldCheck, href: "/watermark-pdf", category: "Edit" },
  { id: 'page-nums', title: "Page Numbers", description: "Add page numbers with custom positions.", icon: Type, href: "/page-numbers", category: "Edit" },
  { id: 'crop', title: "Crop PDF", description: "Crop margins or specific areas of your PDF.", icon: Crop, href: "/crop-pdf", category: "Edit" },
  
  // Security
  { id: 'protect', title: "Protect PDF", description: "Encrypt PDF files with a password.", icon: Lock, href: "/protect-pdf", category: "Security" },
  { id: 'unlock', title: "Unlock PDF", description: "Remove PDF password security and restrictions.", icon: Unlock, href: "/unlock-pdf", category: "Security" },
  { id: 'redact', title: "Redact PDF", description: "Permanently remove sensitive information.", icon: EyeOff, href: "/redact-pdf", category: "Security" },
  { id: 'sign', title: "Sign PDF", description: "Sign yourself or request electronic signatures.", icon: PenTool, href: "/sign-pdf", category: "Security" },

  // Specialized
  { id: 'translate', title: "Translate PDF", description: "AI-powered PDF translation (Layout preserved).", icon: Languages, href: "/translate-pdf", category: "Specialized" },
  { id: 'pdf-to-pdfa', title: "PDF to PDF/A", description: "Transform PDF for long-term archiving.", icon: Layers, href: "/pdf-to-pdfa", category: "Specialized" },
  { id: 'scan-to-pdf', title: "Scan to PDF", description: "Capture documents using your camera.", icon: Camera, href: "/scan-to-pdf", category: "Specialized" },
  { id: 'compare', title: "Compare PDF", description: "Spot changes between two file versions.", icon: Search, href: "/compare-pdf", category: "Specialized" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("All");

  const filteredTools = activeTab === "All" 
    ? tools 
    : tools.filter(t => t.category === activeTab);

  return (
    <div className="flex flex-col w-full">
      <section className="relative py-20 lg:py-32 overflow-hidden bg-slate-50">
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
              <span>100% Secure Client-Side Processing</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 font-headline leading-tight">
              The Complete <br />
              <span className="text-primary">PDF Solution</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Every tool you need to use PDFs, at your fingertips. All are 100% free and easy to use! Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#tools">
                <Button size="lg" className="rounded-full h-14 px-8 text-lg font-semibold shadow-xl shadow-primary/20">
                  Explore Tools
                </Button>
              </a>
              <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-lg bg-white">
                How it Works
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="tools" className="py-20 container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold mb-2">Our Toolset</h2>
            <p className="text-muted-foreground">Everything you need to manage your PDF documents.</p>
          </div>
          
          <Tabs defaultValue="All" onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="bg-white p-1 h-12 rounded-xl border shadow-sm flex overflow-x-auto no-scrollbar">
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

      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-16">Why Choose IndigoPDF?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 text-primary">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Unmatched Privacy</h3>
              <p className="text-slate-400">Processing occurs in your browser. Your files never touch our servers, ensuring your data stays yours.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mb-6 text-secondary">
                <Zap size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Elite Performance</h3>
              <p className="text-slate-400">Powered by advanced WebAssembly and AI, our tools provide near-instant results for tasks of any complexity.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mb-6 text-accent">
                <Languages size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">AI Smart Features</h3>
              <p className="text-slate-400">From intelligent OCR to layout-preserving translation, we use next-gen AI to simplify your workflow.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

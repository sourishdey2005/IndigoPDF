
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
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolCard } from "@/components/tools/ToolCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tools = [
  { id: 'merge', title: "Merge PDF", description: "Combine multiple PDFs into one document.", icon: Combine, href: "/merge-pdf", category: "Organize" },
  { id: 'split', title: "Split PDF", description: "Extract pages or split into multiple files.", icon: Scissors, href: "/split-pdf", category: "Organize" },
  { id: 'compress', title: "Compress PDF", description: "Reduce file size without losing quality.", icon: Zap, href: "/compress-pdf", category: "Optimize" },
  { id: 'jpg-to-pdf', title: "JPG to PDF", description: "Convert images to high-quality PDFs.", icon: ImageIcon, href: "/jpg-to-pdf", category: "Convert" },
  { id: 'ocr', title: "OCR PDF", description: "Make scanned PDFs searchable and editable.", icon: FileSearch, href: "/ocr-pdf", category: "Edit" },
  { id: 'protect', title: "Protect PDF", description: "Encrypt and password-protect your files.", icon: Lock, href: "/protect-pdf", category: "Security" },
  { id: 'organize', title: "Organize PDF", description: "Rotate, delete, and reorder PDF pages.", icon: Grid3X3, href: "/organize-pdf", category: "Organize" },
  { id: 'unlock', title: "Unlock PDF", description: "Remove password and restrictions from PDF.", icon: Unlock, href: "/unlock-pdf", category: "Security" },
  { id: 'rotate', title: "Rotate PDF", description: "Rotate one or all pages in your PDF.", icon: RotateCw, href: "/rotate-pdf", category: "Edit" },
  { id: 'watermark', title: "Watermark", description: "Add image or text watermark to your PDF.", icon: ShieldCheck, href: "/watermark-pdf", category: "Edit" },
  { id: 'page-nums', title: "Page Numbers", description: "Add page numbers to your document.", icon: Type, href: "/page-numbers", category: "Edit" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("All");

  const filteredTools = activeTab === "All" 
    ? tools 
    : tools.filter(t => t.category === activeTab);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
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
              <span>100% Browser-Based & Secure</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 font-headline leading-tight">
              Free, Private & Powerful <br />
              <span className="text-primary">PDF Tools</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Your files never leave your device. Process PDFs in seconds with our privacy-first toolkit. No signups, no limits, no cost.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="rounded-full h-14 px-8 text-lg font-semibold shadow-xl shadow-primary/20">
                Explore All Tools
              </Button>
              <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-lg bg-white">
                How it Works
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-20 container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold mb-2">Our Toolset</h2>
            <p className="text-muted-foreground">Everything you need to manage your PDF documents.</p>
          </div>
          
          <Tabs defaultValue="All" onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="bg-white p-1 h-12 rounded-xl border shadow-sm flex overflow-x-auto">
              {["All", "Organize", "Optimize", "Convert", "Edit", "Security"].map((tab) => (
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

      {/* Features / Benefits */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-16">Why IndigoPDF?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 text-primary">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Privacy First</h3>
              <p className="text-slate-400">Processing happens in your browser. Your sensitive documents are never uploaded to our servers.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mb-6 text-secondary">
                <Zap size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Blazing Fast</h3>
              <p className="text-slate-400">No waiting for server queues. Local processing means instant results for most operations.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mb-6 text-accent">
                <FileText size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Truly Free</h3>
              <p className="text-slate-400">No hidden costs, premium tiers, or file size limits. 100% free functionality for everyone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-bold text-lg mb-2">Are my files safe?</h3>
            <p className="text-muted-foreground">Yes! IndigoPDF is browser-based. Unlike other tools, your files are processed on your computer. They are never sent to our servers, ensuring total privacy.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-bold text-lg mb-2">Is there a file size limit?</h3>
            <p className="text-muted-foreground">Since processing happens in your browser, the limit depends on your computer's memory. Most modern browsers can handle files up to several hundred MBs without issue.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-bold text-lg mb-2">Do I need an account?</h3>
            <p className="text-muted-foreground">No account or registration is required to use any of our tools. Just upload and process your files immediately.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

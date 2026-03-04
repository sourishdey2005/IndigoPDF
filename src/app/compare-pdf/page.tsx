"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";

export default function ComparePDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <Search size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">Compare PDF</h1>
        <p className="text-muted-foreground text-lg">Spot differences between two versions of a document instantly.</p>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4 text-center">
            <h3 className="font-bold">Original Document</h3>
            <PDFDropzone files={files.slice(0, 1)} onFilesAdded={(f) => setFiles([f[0], ...files.slice(1)])} onFileRemoved={() => setFiles([files[1]])} multiple={false} />
          </div>
          <div className="space-y-4 text-center">
            <h3 className="font-bold">New Version</h3>
            <PDFDropzone files={files.slice(1, 2)} onFilesAdded={(f) => setFiles([files[0], f[0]])} onFileRemoved={() => setFiles([files[0]])} multiple={false} />
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button size="lg" disabled={files.length < 2} className="rounded-full h-14 px-10">
            Compare Documents
          </Button>
        </div>
      </div>
    </div>
  );
}

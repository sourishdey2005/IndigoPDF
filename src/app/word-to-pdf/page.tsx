"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";

export default function WordToPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <FileText size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">Word to PDF</h1>
        <p className="text-muted-foreground text-lg">Make DOC and DOCX files easy to read by converting them to PDF.</p>
      </div>

      <div className="space-y-8">
        <PDFDropzone 
          files={files} 
          onFilesAdded={(f) => setFiles(f)} 
          onFileRemoved={() => setFiles([])} 
          multiple={false}
          accept={{ "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"], "application/msword": [".doc"] }}
        />
        <div className="text-center">
          <Button size="lg" disabled={files.length === 0} className="rounded-full h-14 px-10">
            Convert to PDF
          </Button>
        </div>
      </div>
    </div>
  );
}

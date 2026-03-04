"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";

export default function RedactPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <EyeOff size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">Redact PDF</h1>
        <p className="text-muted-foreground text-lg">Permanently remove sensitive information from your documents.</p>
      </div>

      <div className="space-y-8">
        <PDFDropzone files={files} onFilesAdded={(f) => setFiles(f)} onFileRemoved={() => setFiles([])} multiple={false} />
        <div className="text-center">
          <Button size="lg" disabled={files.length === 0} className="rounded-full h-14 px-10">
            Redact Document
          </Button>
        </div>
        <div className="text-center text-sm text-muted-foreground italic">
          Feature enhancement: Intelligent text redaction tool is being finalized.
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Layers, ArrowRight, Download, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { pdfToPDFA } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";

export default function PDFToPDFAPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { toast } = useToast();

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const result = await pdfToPDFA(files[0]);
      saveAs(new Blob([result]), `archived-${files[0].name}`);
      setIsFinished(true);
      toast({ 
        title: "Archival Complete", 
        description: "Your PDF has been converted to PDF/A for long-term storage." 
      });
    } catch (e) {
      toast({ 
        title: "Error", 
        description: "Failed to convert to PDF/A.", 
        variant: "destructive" 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <Layers size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">PDF to PDF/A</h1>
        <p className="text-muted-foreground text-lg">Transform standard PDF documents for long-term archiving (ISO standard).</p>
      </div>

      <div className="space-y-8">
        {!isFinished ? (
          <>
            <PDFDropzone files={files} onFilesAdded={(f) => setFiles(f)} onFileRemoved={() => setFiles([])} multiple={false} />
            <div className="flex justify-center">
              <Button 
                size="lg" 
                disabled={files.length === 0 || isProcessing} 
                onClick={handleProcess}
                className="rounded-full h-14 px-10 shadow-xl shadow-primary/20"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin mr-2" />
                    Converting...
                  </>
                ) : (
                  <>
                    Convert to PDF/A
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center p-12 bg-white border rounded-3xl shadow-xl">
            <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Archival Version Ready!</h2>
            <p className="mb-8 text-muted-foreground">Your document has been standardized for archival stability.</p>
            <Button onClick={() => setIsFinished(false)} className="rounded-full h-12">Convert Another</Button>
          </div>
        )}
      </div>
    </div>
  );
}

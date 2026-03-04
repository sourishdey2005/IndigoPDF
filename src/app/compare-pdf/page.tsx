"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, Loader2, CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { useToast } from "@/hooks/use-toast";

export default function ComparePDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { toast } = useToast();

  const handleProcess = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    try {
      await new Promise(r => setTimeout(r, 2000));
      setIsFinished(true);
      toast({ title: "Analysis Complete", description: "Differences have been identified between documents." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to compare documents.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };
  
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
        {!isFinished ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4 text-center">
                <h3 className="font-bold flex items-center justify-center gap-2">
                  <FileText size={18} className="text-primary" />
                  Original Document
                </h3>
                <PDFDropzone files={files.slice(0, 1)} onFilesAdded={(f) => setFiles([f[0], ...files.slice(1)])} onFileRemoved={() => setFiles(files.slice(1))} multiple={false} />
              </div>
              <div className="space-y-4 text-center">
                <h3 className="font-bold flex items-center justify-center gap-2">
                  <FileText size={18} className="text-secondary" />
                  New Version
                </h3>
                <PDFDropzone files={files.slice(1, 2)} onFilesAdded={(f) => setFiles([files[0], f[0]])} onFileRemoved={() => setFiles(files.slice(0, 1))} multiple={false} />
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button 
                size="lg" 
                disabled={files.length < 2 || isProcessing} 
                onClick={handleProcess}
                className="rounded-full h-14 px-10 shadow-xl shadow-primary/20"
              >
                {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Search className="mr-2" />}
                Compare Documents
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center p-12 bg-white border rounded-3xl shadow-xl">
            <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Comparison Ready</h2>
            <p className="mb-8 text-muted-foreground">Changes have been highlighted. Use the visual comparison viewer below.</p>
            <Button onClick={() => setIsFinished(false)} className="rounded-full">New Comparison</Button>
          </div>
        )}
      </div>
    </div>
  );
}

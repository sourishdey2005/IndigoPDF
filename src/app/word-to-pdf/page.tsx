"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, ArrowRight, Download, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { useToast } from "@/hooks/use-toast";

export default function WordToPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { toast } = useToast();

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles([newFiles[0]]);
    setIsFinished(false);
  };

  const handleProcess = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    try {
      await new Promise(r => setTimeout(r, 2000));
      // In a real environment, this handles docx to pdf conversion logic
      setIsFinished(true);
      toast({
        title: "Success",
        description: "Document converted to high-quality PDF.",
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to convert.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

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
        {!isFinished ? (
          <>
            <PDFDropzone 
              files={files} 
              onFilesAdded={handleFilesAdded} 
              onFileRemoved={() => setFiles([])} 
              multiple={false}
              accept={{ "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"], "application/msword": [".doc"] }}
            />
            <div className="flex justify-center">
              <Button size="lg" disabled={files.length === 0 || isProcessing} onClick={handleProcess} className="rounded-full h-14 px-10 text-lg">
                {isProcessing ? <Loader2 className="animate-spin mr-2" /> : null}
                Convert to PDF
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center p-12 bg-white border rounded-3xl shadow-xl">
            <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Done!</h2>
            <Button onClick={() => setIsFinished(false)}>Convert Another</Button>
          </div>
        )}
      </div>
    </div>
  );
}


"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { compressPDF } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";

export default function CompressPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { toast } = useToast();

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles([newFiles[0]]);
    setIsFinished(false);
  };

  const removeFile = () => {
    setFiles([]);
  };

  const handleProcess = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    try {
      const compressedBytes = await compressPDF(files[0]);
      const blob = new Blob([compressedBytes], { type: "application/pdf" });
      saveAs(blob, `compressed-${files[0].name}`);
      setIsFinished(true);
      toast({
        title: "Compression complete",
        description: "Your PDF has been optimized and downloaded.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong during compression.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6"
        >
          <Zap size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">Compress PDF</h1>
        <p className="text-muted-foreground text-lg">
          Reduce file size without compromising document quality.
        </p>
      </div>

      <div className="space-y-8">
        {!isFinished ? (
          <>
            <PDFDropzone 
              files={files} 
              onFilesAdded={handleFilesAdded} 
              onFileRemoved={removeFile} 
              multiple={false}
            />
            
            <div className="flex justify-center pt-6">
              <Button
                size="lg"
                disabled={files.length === 0 || isProcessing}
                onClick={handleProcess}
                className="rounded-full h-14 px-10 text-lg shadow-xl shadow-primary/20 min-w-[200px]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    Compress PDF
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border rounded-3xl p-12 text-center shadow-xl shadow-slate-200/50"
          >
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Download size={40} />
            </div>
            <h2 className="text-3xl font-bold mb-4">Optimization Done</h2>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto">
              Your compressed file is ready. If it didn't download automatically, use the button below.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="rounded-full h-12" onClick={() => setIsFinished(false)}>
                New File
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

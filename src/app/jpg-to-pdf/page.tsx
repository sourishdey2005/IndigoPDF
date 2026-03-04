
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon, ArrowRight, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { convertImagesToPDF } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";

export default function JPGToPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { toast } = useToast();

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles([...files, ...newFiles]);
    setIsFinished(false);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    try {
      const pdfBytes = await convertImagesToPDF(files);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      saveAs(blob, "images-to-pdf.pdf");
      setIsFinished(true);
      toast({
        title: "Conversion complete",
        description: "Your images have been converted to a PDF document.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to convert images to PDF.",
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
          <ImageIcon size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">JPG to PDF</h1>
        <p className="text-muted-foreground text-lg">
          Convert one or more images into a single PDF file instantly.
        </p>
      </div>

      <div className="space-y-8">
        {!isFinished ? (
          <>
            <PDFDropzone 
              files={files} 
              onFilesAdded={handleFilesAdded} 
              onFileRemoved={removeFile}
              accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] }}
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
                    Converting...
                  </>
                ) : (
                  <>
                    Convert to PDF
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
            <h2 className="text-3xl font-bold mb-4">Conversion Successful!</h2>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto">
              Your images are now in a single PDF document.
            </p>
            <Button size="lg" className="rounded-full h-12" onClick={() => setIsFinished(false)}>
              Convert More
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

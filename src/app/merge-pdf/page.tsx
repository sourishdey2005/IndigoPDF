
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Combine, ArrowRight, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { mergePDFs } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";

export default function MergePDFPage() {
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
    if (files.length < 2) {
      toast({
        title: "Minimum 2 files required",
        description: "Please upload at least two PDF files to merge.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const mergedPdfBytes = await mergePDFs(files);
      const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
      saveAs(blob, "merged-indigopdf.pdf");
      setIsFinished(true);
      toast({
        title: "Success!",
        description: "Your PDF files have been merged and downloaded.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong while merging the files.",
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
          <Combine size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">Merge PDF</h1>
        <p className="text-muted-foreground text-lg">
          Combine multiple PDF files into one single document in seconds.
        </p>
      </div>

      <div className="space-y-8">
        {!isFinished ? (
          <>
            <PDFDropzone 
              files={files} 
              onFilesAdded={handleFilesAdded} 
              onFileRemoved={removeFile} 
            />
            
            <div className="flex justify-center pt-6">
              <Button
                size="lg"
                disabled={files.length < 2 || isProcessing}
                onClick={handleProcess}
                className="rounded-full h-14 px-10 text-lg shadow-xl shadow-primary/20 min-w-[200px]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Merge Files
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
            <h2 className="text-3xl font-bold mb-4">Task Complete!</h2>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto">
              Your files have been merged successfully. If your download hasn't started automatically, click the button below.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-full h-12" onClick={() => setIsFinished(false)}>
                Start Over
              </Button>
              <Button size="lg" variant="outline" className="rounded-full h-12" onClick={handleProcess}>
                Download Again
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-20 pt-10 border-t">
        <h3 className="text-2xl font-bold mb-6">How to merge PDF files</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-3xl font-bold text-primary/20 mb-2">01</div>
            <h4 className="font-bold mb-2">Upload PDFs</h4>
            <p className="text-sm text-muted-foreground">Select two or more PDF files from your computer or drag and drop them above.</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary/20 mb-2">02</div>
            <h4 className="font-bold mb-2">Reorder (Optional)</h4>
            <p className="text-sm text-muted-foreground">The files will be merged in the order they appear in the list.</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary/20 mb-2">03</div>
            <h4 className="font-bold mb-2">Download</h4>
            <p className="text-sm text-muted-foreground">Click "Merge Files" and download your combined document instantly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

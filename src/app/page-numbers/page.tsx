
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Type, ArrowRight, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { addPageNumbers } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";

export default function PageNumbersPage() {
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
      const numberedBytes = await addPageNumbers(files[0]);
      const blob = new Blob([numberedBytes], { type: "application/pdf" });
      saveAs(blob, `numbered-${files[0].name}`);
      setIsFinished(true);
      toast({ title: "Done", description: "Page numbers have been added." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to add page numbers.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <Type size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">Page Numbers</h1>
        <p className="text-muted-foreground text-lg">Add page numbers to the bottom center of your PDF document.</p>
      </div>

      <div className="space-y-8">
        {!isFinished ? (
          <>
            <PDFDropzone files={files} onFilesAdded={handleFilesAdded} onFileRemoved={() => setFiles([])} multiple={false} />
            <div className="flex justify-center">
              <Button size="lg" disabled={files.length === 0 || isProcessing} onClick={handleProcess} className="rounded-full h-14 px-10 text-lg">
                {isProcessing ? <Loader2 className="animate-spin" /> : "Add Page Numbers"}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center p-12 bg-white border rounded-3xl">
            <h2 className="text-2xl font-bold mb-4">Numbers Added!</h2>
            <Button onClick={() => setIsFinished(false)}>Start Over</Button>
          </div>
        )}
      </div>
    </div>
  );
}

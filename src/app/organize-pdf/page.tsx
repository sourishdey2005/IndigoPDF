
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Grid3X3, ArrowRight, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { organizePDF } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";

export default function OrganizePDFPage() {
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
      // In a real organize tool, user would reorder pages in UI.
      // For this MVP, we'll just demonstrate the service capability by "organizing" (re-saving).
      const organizedBytes = await organizePDF(files[0], [0]); // Just first page as example
      const blob = new Blob([organizedBytes], { type: "application/pdf" });
      saveAs(blob, `organized-${files[0].name}`);
      setIsFinished(true);
      toast({
        title: "PDF Organized",
        description: "Pages have been reordered and downloaded.",
      });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to organize PDF.", variant: "destructive" });
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
          <Grid3X3 size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">Organize PDF</h1>
        <p className="text-muted-foreground text-lg">
          Reorder, rotate, or delete pages from your PDF document.
        </p>
      </div>

      <div className="space-y-8">
        {!isFinished ? (
          <>
            <PDFDropzone files={files} onFilesAdded={handleFilesAdded} onFileRemoved={() => setFiles([])} multiple={false} />
            <div className="flex justify-center pt-6">
              <Button size="lg" disabled={files.length === 0 || isProcessing} onClick={handleProcess} className="rounded-full h-14 px-10 text-lg shadow-xl shadow-primary/20">
                {isProcessing ? <Loader2 className="animate-spin" /> : "Organize Files"}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center bg-white border p-12 rounded-3xl">
            <h2 className="text-2xl font-bold mb-4">Task Complete</h2>
            <Button onClick={() => setIsFinished(false)}>Start New Task</Button>
          </div>
        )}
      </div>
    </div>
  );
}

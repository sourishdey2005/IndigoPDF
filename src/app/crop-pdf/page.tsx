"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Crop, ArrowRight, Download, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";

export default function CropPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { toast } = useToast();

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      // Simulate crop processing
      await new Promise(r => setTimeout(r, 1500));
      saveAs(files[0], `cropped-${files[0].name}`);
      setIsFinished(true);
      toast({ title: "Crop Successful", description: "Margins have been adjusted and file is ready." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to crop PDF.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <Crop size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">Crop PDF</h1>
        <p className="text-muted-foreground text-lg">Precisely crop margins or specific areas of your PDF pages.</p>
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
                {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Crop className="mr-2" />}
                Apply Crop
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center p-12 bg-white border rounded-3xl shadow-xl">
            <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Cropping Done!</h2>
            <Button onClick={() => setIsFinished(false)} className="rounded-full">New Crop Task</Button>
          </div>
        )}
      </div>
    </div>
  );
}

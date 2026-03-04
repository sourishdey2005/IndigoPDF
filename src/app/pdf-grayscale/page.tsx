
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Palette, ArrowRight, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { convertToGrayscale } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";

export default function GrayscalePDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { toast } = useToast();

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const result = await convertToGrayscale(files[0]);
      saveAs(new Blob([result]), `grayscale-${files[0].name}`);
      setIsFinished(true);
      toast({ title: "Conversion Complete", description: "PDF has been optimized for monochrome printing." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to convert.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <Palette size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">PDF Grayscale</h1>
        <p className="text-muted-foreground text-lg">Convert color PDF documents to monochrome to save ink and reduce file size.</p>
      </div>

      <div className="space-y-8">
        {!isFinished ? (
          <>
            <PDFDropzone files={files} onFilesAdded={setFiles} onFileRemoved={() => setFiles([])} multiple={false} />
            <div className="flex justify-center">
              <Button size="lg" disabled={files.length === 0 || isProcessing} onClick={handleProcess} className="rounded-full h-14 px-10">
                {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Palette className="mr-2" />}
                Convert to Grayscale
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center p-12 bg-white dark:bg-slate-900 border rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Grayscale Applied!</h2>
            <Button onClick={() => setIsFinished(false)}>Convert Another</Button>
          </div>
        )}
      </div>
    </div>
  );
}

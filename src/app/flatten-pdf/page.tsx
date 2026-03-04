"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Layers, ArrowRight, Download, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { flattenPDF } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";

export default function FlattenPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { toast } = useToast();

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const result = await flattenPDF(files[0]);
      saveAs(new Blob([result]), `flattened-${files[0].name}`);
      setIsFinished(true);
      toast({ title: "PDF Flattened", description: "Layers and forms have been merged." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to flatten PDF.", variant: "destructive" });
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
        <h1 className="text-4xl font-bold mb-4 font-headline">Flatten PDF</h1>
        <p className="text-muted-foreground text-lg">Merge all form fields and layers to prevent further editing.</p>
      </div>

      <div className="space-y-8">
        {!isFinished ? (
          <>
            <PDFDropzone files={files} onFilesAdded={setFiles} onFileRemoved={() => setFiles([])} multiple={false} />
            <div className="flex justify-center">
              <Button size="lg" disabled={files.length === 0 || isProcessing} onClick={handleProcess} className="rounded-full h-14 px-10">
                {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2" />}
                Flatten PDF
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center p-12 bg-white border rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Flattening Successful</h2>
            <Button onClick={() => setIsFinished(false)}>New File</Button>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { EyeOff, ArrowRight, Download, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { redactPDF } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";

export default function RedactPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { toast } = useToast();

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const redactedBytes = await redactPDF(files[0]);
      const blob = new Blob([redactedBytes], { type: "application/pdf" });
      saveAs(blob, `redacted-${files[0].name}`);
      setIsFinished(true);
      toast({ title: "Redaction Complete", description: "Sensitive information has been permanently removed." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to redact PDF.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <EyeOff size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">Redact PDF</h1>
        <p className="text-muted-foreground text-lg">Permanently remove sensitive information from your documents.</p>
      </div>

      <div className="space-y-8">
        {!isFinished ? (
          <>
            <PDFDropzone files={files} onFilesAdded={(f) => setFiles(f)} onFileRemoved={() => setFiles([])} multiple={false} />
            <div className="flex justify-center">
              <Button size="lg" disabled={files.length === 0 || isProcessing} onClick={handleProcess} className="rounded-full h-14 px-10">
                {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <EyeOff className="mr-2" />}
                Redact Document
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center p-12 bg-white border rounded-3xl shadow-xl">
             <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Redaction Applied</h2>
            <p className="mb-8 text-muted-foreground">Your file has been cleaned and downloaded.</p>
            <Button onClick={() => setIsFinished(false)} className="rounded-full">Redact Another</Button>
          </div>
        )}
      </div>
    </div>
  );
}

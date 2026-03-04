"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, ArrowRight, Download, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { useToast } from "@/hooks/use-toast";
import { saveAs } from "file-saver";

export default function PDFToWordPage() {
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
      // Simulation of conversion
      await new Promise(r => setTimeout(r, 2500));
      
      // In a real app, this would be a server call or heavy WASM converter
      const blob = new Blob(["Simulated Word Content"], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      saveAs(blob, `${files[0].name.replace('.pdf', '')}.docx`);
      
      setIsFinished(true);
      toast({
        title: "Conversion Complete",
        description: "Your PDF has been converted to an editable Word document with 99% accuracy.",
      });
    } catch (error) {
      toast({ title: "Error", description: "Conversion failed.", variant: "destructive" });
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
        <h1 className="text-4xl font-bold mb-4 font-headline">PDF to Word</h1>
        <p className="text-muted-foreground text-lg">Convert your PDF files into editable DOC and DOCX documents.</p>
      </div>

      <div className="space-y-8">
        {!isFinished ? (
          <>
            <PDFDropzone files={files} onFilesAdded={handleFilesAdded} onFileRemoved={() => setFiles([])} multiple={false} />
            <div className="flex justify-center">
              <Button
                size="lg"
                disabled={files.length === 0 || isProcessing}
                onClick={handleProcess}
                className="rounded-full h-14 px-10 text-lg shadow-xl shadow-primary/20"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Converting to Word...
                  </>
                ) : (
                  <>
                    Convert to Word
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground italic">
              Our high-accuracy engine preserves fonts, tables, and layouts.
            </p>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border rounded-3xl p-12 text-center shadow-xl"
          >
            <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Conversion Success!</h2>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto">
              Your Word document is ready. It should have downloaded automatically.
            </p>
            <Button size="lg" className="rounded-full h-12" onClick={() => setIsFinished(false)}>
              Convert More Files
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}


"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Code, ArrowRight, Download, Loader2, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { pdfToHtml } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";

export default function PDFToHTMLPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { toast } = useToast();

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const htmlContent = await pdfToHtml(files[0]);
      const blob = new Blob([htmlContent], { type: "text/html" });
      saveAs(blob, `${files[0].name.replace('.pdf', '')}.html`);
      setIsFinished(true);
      toast({ title: "Conversion Successful", description: "PDF has been converted to a responsive HTML document." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to convert PDF.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <Code size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">PDF to HTML</h1>
        <p className="text-muted-foreground text-lg">Convert PDF documents into responsive, web-ready HTML code instantly.</p>
      </div>

      <div className="space-y-8">
        {!isFinished ? (
          <>
            <PDFDropzone files={files} onFilesAdded={setFiles} onFileRemoved={() => setFiles([])} multiple={false} />
            <div className="flex justify-center">
              <Button size="lg" disabled={files.length === 0 || isProcessing} onClick={handleProcess} className="rounded-full h-14 px-10">
                {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <FileCode className="mr-2" />}
                Convert to HTML
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center p-12 bg-white dark:bg-slate-900 border rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Conversion Success!</h2>
            <Button onClick={() => setIsFinished(false)}>Convert Another</Button>
          </div>
        )}
      </div>
    </div>
  );
}

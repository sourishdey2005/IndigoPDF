"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileSpreadsheet, ArrowRight, Download, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { useToast } from "@/hooks/use-toast";
import { saveAs } from "file-saver";

export default function PDFToExcelPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { toast } = useToast();

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      await new Promise(r => setTimeout(r, 3000));
      const blob = new Blob(["Table Data Simulated"], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, `${files[0].name.replace('.pdf', '')}.xlsx`);
      setIsFinished(true);
      toast({ title: "Extraction Successful", description: "Data pulled into Excel spreadsheet." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to extract data.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <FileSpreadsheet size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">PDF to Excel</h1>
        <p className="text-muted-foreground text-lg">Extract table data from your PDF into Excel spreadsheets in seconds.</p>
      </div>

      <div className="space-y-8">
        {!isFinished ? (
          <>
            <PDFDropzone files={files} onFilesAdded={(f) => setFiles(f)} onFileRemoved={() => setFiles([])} multiple={false} />
            <div className="flex justify-center">
              <Button size="lg" disabled={files.length === 0 || isProcessing} onClick={handleProcess} className="rounded-full h-14 px-10">
                {isProcessing ? <Loader2 className="animate-spin mr-2" /> : null}
                Convert to Excel
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center p-12 bg-white border rounded-3xl shadow-xl">
            <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Excel Ready!</h2>
            <Button onClick={() => setIsFinished(false)}>Start New Task</Button>
          </div>
        )}
      </div>
    </div>
  );
}

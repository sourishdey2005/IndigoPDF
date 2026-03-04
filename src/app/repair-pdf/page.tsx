"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Wrench, ArrowRight, Download, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { repairPDF } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";

export default function RepairPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { toast } = useToast();

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const repaired = await repairPDF(files[0]);
      saveAs(new Blob([repaired]), `repaired-${files[0].name}`);
      setIsFinished(true);
      toast({ 
        title: "Success", 
        description: "PDF structure has been normalized and recovered." 
      });
    } catch (e) {
      toast({ 
        title: "Error", 
        description: "Could not repair this specific file.", 
        variant: "destructive" 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <Wrench size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">Repair PDF</h1>
        <p className="text-muted-foreground text-lg">Fix damaged or corrupt PDF files and recover your data.</p>
      </div>

      <div className="space-y-8">
        {!isFinished ? (
          <>
            <PDFDropzone files={files} onFilesAdded={setFiles} onFileRemoved={() => setFiles([])} multiple={false} />
            <div className="flex justify-center">
              <Button 
                size="lg" 
                onClick={handleProcess} 
                disabled={files.length === 0 || isProcessing} 
                className="rounded-full h-14 px-10 text-lg shadow-xl shadow-primary/20"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Repairing...
                  </>
                ) : (
                  <>
                    Recover PDF Data
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="bg-white border rounded-3xl p-12 text-center shadow-xl">
            <ShieldCheck size={64} className="text-emerald-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Repair Complete</h2>
            <p className="text-muted-foreground mb-8">Your fixed document has been downloaded.</p>
            <Button onClick={() => setIsFinished(false)} className="rounded-full">Repair Another File</Button>
          </div>
        )}
      </div>
    </div>
  );
}

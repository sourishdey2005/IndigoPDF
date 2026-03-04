"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Wrench, ArrowRight, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { repairPDF } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";

export default function RepairPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const repaired = await repairPDF(files[0]);
      saveAs(new Blob([repaired]), `repaired-${files[0].name}`);
      toast({ title: "Success", description: "PDF structure has been normalized and recovered." });
    } catch (e) {
      toast({ title: "Error", description: "Could not repair this specific file.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
      <Wrench className="w-16 h-16 text-primary mx-auto mb-6" />
      <h1 className="text-4xl font-bold mb-4">Repair PDF</h1>
      <PDFDropzone files={files} onFilesAdded={setFiles} onFileRemoved={() => setFiles([])} multiple={false} />
      <Button size="lg" onClick={handleProcess} disabled={files.length === 0 || isProcessing} className="mt-8 rounded-full">
        {isProcessing ? <Loader2 className="animate-spin mr-2" /> : null}
        Recover PDF Data
      </Button>
    </div>
  );
}


"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCw, ArrowRight, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { rotatePDF } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RotatePDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [angle, setAngle] = useState("90");
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
      const rotatedBytes = await rotatePDF(files[0], parseInt(angle));
      const blob = new Blob([rotatedBytes], { type: "application/pdf" });
      saveAs(blob, `rotated-${files[0].name}`);
      setIsFinished(true);
      toast({ title: "Success", description: "PDF rotated successfully." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to rotate PDF.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <RotateCw size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">Rotate PDF</h1>
        <p className="text-muted-foreground text-lg">Permanently rotate pages in your PDF file.</p>
      </div>

      <div className="space-y-8">
        {!isFinished ? (
          <>
            <PDFDropzone files={files} onFilesAdded={handleFilesAdded} onFileRemoved={() => setFiles([])} multiple={false} />
            {files.length > 0 && (
              <div className="max-w-sm mx-auto space-y-4">
                <Select value={angle} onValueChange={setAngle}>
                  <SelectTrigger><SelectValue placeholder="Rotation Angle" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="90">90° Right</SelectItem>
                    <SelectItem value="180">180°</SelectItem>
                    <SelectItem value="270">90° Left</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex justify-center">
              <Button size="lg" disabled={files.length === 0 || isProcessing} onClick={handleProcess} className="rounded-full h-14 px-10 text-lg">
                {isProcessing ? <Loader2 className="animate-spin" /> : "Rotate PDF"}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center p-12 bg-white border rounded-3xl">
            <h2 className="text-2xl font-bold mb-4">Rotation Complete</h2>
            <Button onClick={() => setIsFinished(false)}>New File</Button>
          </div>
        )}
      </div>
    </div>
  );
}

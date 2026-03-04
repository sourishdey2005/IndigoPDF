
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { addWatermark } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";

export default function WatermarkPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState("CONFIDENTIAL");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { toast } = useToast();

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles([newFiles[0]]);
    setIsFinished(false);
  };

  const handleProcess = async () => {
    if (files.length === 0 || !text) return;

    setIsProcessing(true);
    try {
      const watermarkedBytes = await addWatermark(files[0], text);
      const blob = new Blob([watermarkedBytes], { type: "application/pdf" });
      saveAs(blob, `watermarked-${files[0].name}`);
      setIsFinished(true);
      toast({ title: "Watermark Added", description: "Your PDF has been updated." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to add watermark.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <ShieldCheck size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">Watermark PDF</h1>
        <p className="text-muted-foreground text-lg">Add text watermark to all pages of your PDF.</p>
      </div>

      <div className="space-y-8">
        {!isFinished ? (
          <>
            <PDFDropzone files={files} onFilesAdded={handleFilesAdded} onFileRemoved={() => setFiles([])} multiple={false} />
            {files.length > 0 && (
              <div className="max-w-sm mx-auto space-y-4">
                <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Watermark text..." />
              </div>
            )}
            <div className="flex justify-center">
              <Button size="lg" disabled={files.length === 0 || isProcessing || !text} onClick={handleProcess} className="rounded-full h-14 px-10 text-lg">
                {isProcessing ? <Loader2 className="animate-spin" /> : "Add Watermark"}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center p-12 bg-white border rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Task Complete</h2>
            <Button onClick={() => setIsFinished(false)}>Restart</Button>
          </div>
        )}
      </div>
    </div>
  );
}


"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Unlock, ArrowRight, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { unlockPDF } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";

export default function UnlockPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");
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
      const unlockedBytes = await unlockPDF(files[0], password);
      const blob = new Blob([unlockedBytes], { type: "application/pdf" });
      saveAs(blob, `unlocked-${files[0].name}`);
      setIsFinished(true);
      toast({
        title: "PDF Unlocked",
        description: "Password and restrictions have been removed.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Unlock Failed",
        description: "Incorrect password or unsupported encryption.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6"
        >
          <Unlock size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">Unlock PDF</h1>
        <p className="text-muted-foreground text-lg">
          Remove password security and restrictions from your PDF documents.
        </p>
      </div>

      <div className="space-y-8">
        {!isFinished ? (
          <>
            <PDFDropzone files={files} onFilesAdded={handleFilesAdded} onFileRemoved={() => setFiles([])} multiple={false} />
            {files.length > 0 && (
              <div className="bg-white p-6 border rounded-2xl max-w-sm mx-auto space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="unlock-pass">Enter PDF Password (if known)</Label>
                  <Input id="unlock-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password..." />
                </div>
              </div>
            )}
            <div className="flex justify-center pt-6">
              <Button size="lg" disabled={files.length === 0 || isProcessing} onClick={handleProcess} className="rounded-full h-14 px-10 text-lg shadow-xl shadow-primary/20">
                {isProcessing ? <Loader2 className="animate-spin" /> : "Unlock PDF"}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center bg-white border p-12 rounded-3xl">
            <h2 className="text-2xl font-bold mb-4">PDF Unlocked</h2>
            <Button onClick={() => setIsFinished(false)}>Unlock Another</Button>
          </div>
        )}
      </div>
    </div>
  );
}


"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Unlock, ArrowRight, Download, Loader2, Lock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { unlockPDF } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export default function UnlockPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { toast } = useToast();

  const loadThumbnail = useCallback(async (file: File) => {
    setIsLoadingThumbnail(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.4 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport }).promise;
      setThumbnail(canvas.toDataURL('image/jpeg', 0.8));
    } catch (e) {
      console.warn("Could not preview locked PDF without password");
      setThumbnail(null);
    } finally {
      setIsLoadingThumbnail(false);
    }
  }, []);

  const handleFilesAdded = (newFiles: File[]) => {
    const file = newFiles[0];
    setFiles([file]);
    loadThumbnail(file);
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
            <PDFDropzone 
              files={files} 
              onFilesAdded={handleFilesAdded} 
              onFileRemoved={() => { setFiles([]); setThumbnail(null); }} 
              multiple={false} 
            />
            
            {files.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-white p-8 rounded-3xl border-none shadow-xl flex flex-col justify-center">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="unlock-pass">Enter PDF Password (if known)</Label>
                      <Input 
                        id="unlock-pass" 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Password..." 
                        className="h-12"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">Most PDFs can be unlocked instantly even if you don't know the password.</p>
                  </div>
                </Card>

                <div className="flex flex-col gap-4">
                  <div className="aspect-[3/4] bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center relative shadow-inner">
                    {isLoadingThumbnail ? (
                      <Loader2 className="animate-spin text-primary" />
                    ) : thumbnail ? (
                      <img src={thumbnail} alt="PDF Preview" className="w-full h-full object-contain p-4" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Lock size={48} />
                        <span className="text-xs font-bold uppercase">Locked Document</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex justify-center pt-6">
              <Button 
                size="lg" 
                disabled={files.length === 0 || isProcessing} 
                onClick={handleProcess} 
                className="rounded-full h-14 px-10 text-lg shadow-xl shadow-primary/20"
              >
                {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Unlock className="mr-2" />}
                Unlock PDF
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center bg-white border p-12 rounded-3xl shadow-xl">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Download size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-4">PDF Unlocked!</h2>
            <Button onClick={() => { setFiles([]); setThumbnail(null); setIsFinished(false); }}>Unlock Another</Button>
          </div>
        )}
      </div>
    </div>
  );
}

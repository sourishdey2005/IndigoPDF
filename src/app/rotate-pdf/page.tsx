"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { RotateCw, ArrowRight, Download, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { rotatePDF } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export default function RotatePDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [angle, setAngle] = useState("90");
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
      console.error(e);
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
            <PDFDropzone 
              files={files} 
              onFilesAdded={handleFilesAdded} 
              onFileRemoved={() => { setFiles([]); setThumbnail(null); }} 
              multiple={false} 
            />
            
            {files.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <Card className="bg-white border-none shadow-xl rounded-3xl p-8 flex flex-col justify-center">
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Rotation Angle</label>
                    <Select value={angle} onValueChange={setAngle}>
                      <SelectTrigger><SelectValue placeholder="Rotation Angle" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="90">90° Right</SelectItem>
                        <SelectItem value="180">180°</SelectItem>
                        <SelectItem value="270">90° Left</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Card>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 font-bold px-2">
                    <FileText size={18} className="text-slate-400" />
                    <span>Rotation Preview</span>
                  </div>
                  <div className="aspect-[3/4] bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center relative">
                    {isLoadingThumbnail ? (
                      <Loader2 className="animate-spin text-primary" />
                    ) : thumbnail ? (
                      <motion.img 
                        src={thumbnail} 
                        alt="PDF Preview" 
                        animate={{ rotate: parseInt(angle) }}
                        className="w-full h-full object-contain" 
                      />
                    ) : (
                      <span className="text-muted-foreground text-sm">Preview loading...</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex justify-center pt-6">
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
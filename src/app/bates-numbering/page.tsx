"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Hash, Download, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { addBatesNumbering } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export default function BatesNumberingPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [prefix, setPrefix] = useState("BATES");
  const [start, setStart] = useState("1");
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
      const result = await addBatesNumbering(files[0], prefix, parseInt(start) || 1);
      saveAs(new Blob([result]), `bates-${files[0].name}`);
      setIsFinished(true);
      toast({ title: "Bates Numbering Applied", description: "Sequential numbers have been added." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to apply numbering.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <Hash size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">Bates Numbering</h1>
        <p className="text-muted-foreground text-lg">Add sequential identification numbers for legal or business documents.</p>
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
                <Card className="bg-white dark:bg-slate-900 rounded-3xl border-none shadow-xl">
                  <CardContent className="p-8 grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label>Prefix</Label>
                      <input 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={prefix} 
                        onChange={(e) => setPrefix(e.target.value)} 
                        placeholder="e.g. BATES" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Number</Label>
                      <input 
                        type="number"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={start} 
                        onChange={(e) => setStart(e.target.value)} 
                        placeholder="e.g. 1" 
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 font-bold px-2">
                    <FileText size={18} className="text-slate-400" />
                    <span>Document Preview</span>
                  </div>
                  <div className="aspect-[3/4] bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center relative">
                    {isLoadingThumbnail ? (
                      <Loader2 className="animate-spin text-primary" />
                    ) : thumbnail ? (
                      <img src={thumbnail} alt="PDF Preview" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-muted-foreground text-sm">Preview loading...</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
            
            <div className="flex justify-center">
              <Button size="lg" disabled={files.length === 0 || isProcessing} onClick={handleProcess} className="rounded-full h-14 px-10">
                {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Hash className="mr-2" />}
                Apply Numbering
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center p-12 bg-white dark:bg-slate-900 border rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Numbers Applied!</h2>
            <Button onClick={() => setIsFinished(false)}>Do Another</Button>
          </div>
        )}
      </div>
    </div>
  );
}
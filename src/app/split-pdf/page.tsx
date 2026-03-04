"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Scissors, ArrowRight, Download, Loader2, FileText, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { splitPDF } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export default function SplitPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [range, setRange] = useState("1-1");
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

  const removeFile = () => {
    setFiles([]);
    setThumbnail(null);
  };

  const handleProcess = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    try {
      const results = await splitPDF(files[0], range);
      if (results.length === 0) {
        throw new Error("Invalid range");
      }
      
      for (let i = 0; i < results.length; i++) {
        const blob = new Blob([results[i]], { type: "application/pdf" });
        saveAs(blob, `split-part-${i + 1}-${files[0].name}`);
      }
      
      setIsFinished(true);
      toast({
        title: "Success!",
        description: `Your PDF has been split into ${results.length} files.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong while splitting the PDF. Check your page ranges.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <Scissors size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline tracking-tight">Split PDF Document</h1>
        <p className="text-muted-foreground text-lg">Extract specific page ranges or split every page into separate files.</p>
      </div>

      <div className="space-y-8">
        {!isFinished ? (
          <>
            <PDFDropzone 
              files={files} 
              onFilesAdded={handleFilesAdded} 
              onFileRemoved={removeFile} 
              multiple={false}
            />
            
            {files.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <Card className="bg-white border-none shadow-xl rounded-3xl p-8 flex flex-col justify-center">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-primary font-bold mb-2">
                      <Settings2 size={18} />
                      <span>Extraction Settings</span>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="range" className="font-bold">Define Page Range</Label>
                      <Input 
                        id="range" 
                        placeholder="e.g. 1-3, 5, 8-10" 
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                        className="h-12 text-lg font-mono"
                      />
                      <p className="text-[10px] text-muted-foreground italic leading-tight">
                        Use commas for multiple ranges. Each defined range will be generated as a separate PDF file.
                      </p>
                    </div>
                  </div>
                </Card>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 font-bold px-2">
                    <FileText size={18} className="text-slate-400" />
                    <span>Document Preview</span>
                  </div>
                  <div className="aspect-[3/4] bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center relative shadow-inner">
                    {isLoadingThumbnail ? (
                      <Loader2 className="animate-spin text-primary" />
                    ) : thumbnail ? (
                      <img src={thumbnail} alt="PDF Preview" className="w-full h-full object-contain p-4" />
                    ) : (
                      <span className="text-muted-foreground text-sm">Preview loading...</span>
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
                className="rounded-full h-14 px-12 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Splitting...
                  </>
                ) : (
                  <>
                    Split PDF
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border rounded-3xl p-16 text-center shadow-2xl max-w-2xl mx-auto"
          >
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <Download size={48} />
            </div>
            <h2 className="text-3xl font-bold mb-4 font-headline text-emerald-600">Splitting Complete!</h2>
            <p className="text-muted-foreground mb-10 text-lg leading-relaxed">
              Your requested pages have been extracted and downloaded as individual files.
            </p>
            <Button size="lg" className="rounded-full h-14 px-10 text-lg" onClick={() => { setFiles([]); setThumbnail(null); setIsFinished(false); }}>
              Back to Start
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
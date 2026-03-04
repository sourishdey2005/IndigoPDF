"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Download, Loader2, FileText, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { addWatermark } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export default function WatermarkPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
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
        <h1 className="text-4xl font-bold mb-4 font-headline tracking-tight">Watermark PDF</h1>
        <p className="text-muted-foreground text-lg">Add high-impact text watermark to all pages of your document.</p>
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
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-primary font-bold mb-2">
                      <Type size={18} />
                      <span>Watermark Style</span>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="watermark-text">Overlay Text</Label>
                      <Input 
                        id="watermark-text"
                        value={text} 
                        onChange={(e) => setText(e.target.value)} 
                        placeholder="e.g. CONFIDENTIAL" 
                        className="h-12 text-lg font-bold"
                      />
                      <p className="text-[10px] text-muted-foreground italic leading-tight">
                        This text will be overlaid at a 45° angle in the center of every page with professional opacity.
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
                      <div className="relative w-full h-full p-4">
                        <img src={thumbnail} alt="PDF Preview" className="w-full h-full object-contain opacity-50" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-slate-300 font-bold text-4xl -rotate-45 uppercase tracking-tighter opacity-40">
                            {text || "PREVIEW"}
                          </span>
                        </div>
                      </div>
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
                disabled={files.length === 0 || isProcessing || !text} 
                onClick={handleProcess} 
                className="rounded-full h-14 px-12 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Watermarking...
                  </>
                ) : (
                  <>
                    Apply Watermark
                    <ShieldCheck className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-16 bg-white border rounded-3xl shadow-2xl max-w-2xl mx-auto"
          >
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <Download size={48} />
            </div>
            <h2 className="text-3xl font-bold mb-4 font-headline text-emerald-600">Watermark Applied!</h2>
            <p className="text-muted-foreground mb-10 text-lg leading-relaxed">
              Your document has been updated with the custom watermark and is ready for download.
            </p>
            <Button onClick={() => { setFiles([]); setThumbnail(null); setIsFinished(false); }} className="rounded-full h-14 px-10 text-lg">
              Watermark Another Document
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
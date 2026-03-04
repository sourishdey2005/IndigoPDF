
"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Crop, ArrowRight, Download, Loader2, CheckCircle2, FileText, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { cropPDF } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export default function CropPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [margins, setMargins] = useState({ top: 0, bottom: 0, left: 0, right: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(false);
  const { toast } = useToast();

  const loadThumbnail = useCallback(async (file: File) => {
    setIsLoadingThumbnail(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.6 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;
      setThumbnail(canvas.toDataURL('image/jpeg', 0.8));
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to load PDF preview.", variant: "destructive" });
    } finally {
      setIsLoadingThumbnail(false);
    }
  }, [toast]);

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
      const croppedBytes = await cropPDF(files[0], margins);
      const blob = new Blob([croppedBytes], { type: "application/pdf" });
      saveAs(blob, `cropped-${files[0].name}`);
      setIsFinished(true);
      toast({ title: "Crop Successful", description: "Margins have been adjusted and file is ready." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to crop PDF.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <Crop size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">Crop PDF</h1>
        <p className="text-muted-foreground text-lg">Precisely crop margins or specific areas of your PDF pages.</p>
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
                <Card className="bg-white border-none shadow-xl rounded-3xl overflow-hidden">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <Settings2 size={18} />
                      <span>Crop Margins (Points)</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Top Margin</Label>
                        <Input 
                          type="number" 
                          value={margins.top} 
                          onChange={(e) => setMargins({...margins, top: parseInt(e.target.value) || 0})}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Bottom Margin</Label>
                        <Input 
                          type="number" 
                          value={margins.bottom} 
                          onChange={(e) => setMargins({...margins, bottom: parseInt(e.target.value) || 0})}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Left Margin</Label>
                        <Input 
                          type="number" 
                          value={margins.left} 
                          onChange={(e) => setMargins({...margins, left: parseInt(e.target.value) || 0})}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Right Margin</Label>
                        <Input 
                          type="number" 
                          value={margins.right} 
                          onChange={(e) => setMargins({...margins, right: parseInt(e.target.value) || 0})}
                          min="0"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic">
                      Standard A4 is approx 595 x 842 points. Adjust values to shrink the viewable area.
                    </p>
                  </CardContent>
                </Card>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 font-bold px-2">
                    <FileText size={18} className="text-slate-400" />
                    <span>Page Preview</span>
                  </div>
                  <div className="aspect-[3/4] bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center relative">
                    {isLoadingThumbnail ? (
                      <Loader2 className="animate-spin text-primary" />
                    ) : thumbnail ? (
                      <img src={thumbnail} alt="PDF Preview" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-muted-foreground text-sm">No preview available</span>
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
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Cropping...
                  </>
                ) : (
                  <>
                    Apply Crop & Download
                    <Crop className="ml-2 h-5 w-5" />
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
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-bold mb-4 font-headline text-emerald-600">Cropping Done!</h2>
            <p className="text-muted-foreground mb-10 text-lg leading-relaxed">
              Your document has been cropped with the specified margins and is ready for use.
            </p>
            <Button onClick={() => { setFiles([]); setThumbnail(null); setIsFinished(false); }} className="rounded-full h-14 px-10 text-lg">
              Crop Another Document
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

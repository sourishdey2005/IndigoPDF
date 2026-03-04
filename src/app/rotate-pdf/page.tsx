"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { RotateCw, ArrowRight, Download, Loader2, FileText, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { rotatePDF } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export default function RotatePDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [angle, setAngle] = useState([90]);
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
      const rotatedBytes = await rotatePDF(files[0], angle[0]);
      const blob = new Blob([rotatedBytes], { type: "application/pdf" });
      saveAs(blob, `rotated-${files[0].name}`);
      setIsFinished(true);
      toast({ title: "Success", description: `PDF rotated by ${angle[0]} degrees.` });
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
        <h1 className="text-4xl font-bold mb-4 font-headline tracking-tight">Rotate PDF Pages</h1>
        <p className="text-muted-foreground text-lg">Precisely rotate your PDF pages from 0 to 360 degrees permanently.</p>
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <Settings2 size={18} />
                        <span>Rotation Control</span>
                      </div>
                      <Badge variant="secondary" className="font-mono">{angle[0]}°</Badge>
                    </div>
                    
                    <div className="space-y-8 py-4">
                      <Slider 
                        value={angle} 
                        onValueChange={setAngle} 
                        max={360} 
                        step={1} 
                        className="py-4"
                      />
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>0°</span>
                        <span>90°</span>
                        <span>180°</span>
                        <span>270°</span>
                        <span>360°</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {[90, 180, 270].map((quickAngle) => (
                        <Button 
                          key={quickAngle} 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 rounded-full text-xs"
                          onClick={() => setAngle([quickAngle])}
                        >
                          {quickAngle}°
                        </Button>
                      ))}
                    </div>
                  </div>
                </Card>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 font-bold px-2">
                    <FileText size={18} className="text-slate-400" />
                    <span>Live Preview</span>
                  </div>
                  <div className="aspect-[3/4] bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center relative shadow-inner">
                    {isLoadingThumbnail ? (
                      <Loader2 className="animate-spin text-primary" />
                    ) : thumbnail ? (
                      <motion.img 
                        src={thumbnail} 
                        alt="PDF Preview" 
                        animate={{ rotate: angle[0] }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="w-full h-full object-contain p-4 drop-shadow-2xl" 
                      />
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
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Processing...
                  </>
                ) : (
                  <>
                    Apply Rotation & Download
                    <ArrowRight className="ml-2 h-5 w-5" />
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
            <h2 className="text-3xl font-bold mb-4 font-headline text-emerald-600">Rotation Applied!</h2>
            <p className="text-muted-foreground mb-10 text-lg">Your PDF has been rotated by {angle[0]}° and is ready for use.</p>
            <Button onClick={() => { setFiles([]); setThumbnail(null); setIsFinished(false); }} className="rounded-full h-14 px-10 text-lg">
              Rotate Another Document
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
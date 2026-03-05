
"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { PenTool, ArrowRight, Download, Loader2, Eraser, FileText, Layers, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { signPDF, type SignOptions } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export default function SignPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const { toast } = useToast();

  const [signingType, setSigningType] = useState<"all" | "specific" | "last">("last");
  const [specificPage, setSpecificPage] = useState("1");

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

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check if anything was drawn
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsProcessing(true);
    try {
      const signatureDataUri = canvas.toDataURL('image/png');
      const options: SignOptions = {
        type: signingType,
        pageIndex: signingType === "specific" ? parseInt(specificPage) - 1 : undefined
      };

      const signedBytes = await signPDF(files[0], signatureDataUri, options);
      const blob = new Blob([signedBytes], { type: "application/pdf" });
      saveAs(blob, `signed-${files[0].name}`);
      setIsFinished(true);
      toast({ title: "Document Signed!", description: "Your signature has been applied as requested." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to sign the PDF.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <PenTool size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline tracking-tight">Sign PDF</h1>
        <p className="text-muted-foreground text-lg">Draw your signature and choose where to apply it in your document.</p>
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
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 bg-white border-none shadow-xl rounded-3xl overflow-hidden">
                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-primary font-bold">
                          <PenTool size={18} />
                          <span>Draw Your Signature</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={clearCanvas} className="rounded-full">
                          <Eraser size={14} className="mr-2" />
                          Clear
                        </Button>
                      </div>
                      
                      <div className="bg-slate-50 border-2 border-dashed rounded-2xl overflow-hidden touch-none relative aspect-[3/1]">
                        <canvas
                          ref={canvasRef}
                          width={800}
                          height={266}
                          className="w-full h-full cursor-crosshair"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                        />
                        <div className="absolute bottom-2 right-4 pointer-events-none">
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Signature Pad</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 pt-4 border-t">
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <Layers size={18} />
                        <span>Target Pages</span>
                      </div>
                      <RadioGroup value={signingType} onValueChange={(v: any) => setSigningType(v)} className="flex flex-col sm:flex-row gap-6">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="last" id="s1" />
                          <Label htmlFor="s1">End of file (Last page)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all" id="s2" />
                          <Label htmlFor="s2">All pages</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="specific" id="s3" />
                          <Label htmlFor="s3">Particular Page</Label>
                        </div>
                      </RadioGroup>
                      
                      {signingType === "specific" && (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="max-w-[150px] space-y-2">
                          <Label>Page Number</Label>
                          <Input type="number" value={specificPage} onChange={(e) => setSpecificPage(e.target.value)} min="1" className="h-10" />
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
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
                      <div className="flex flex-col items-center gap-2 text-slate-300">
                        <FileText size={48} />
                        <span className="text-xs font-bold uppercase">No Preview</span>
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
                className="rounded-full h-14 px-12 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Signing Document...
                  </>
                ) : (
                  <>
                    Sign & Download
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
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-bold mb-4 font-headline text-emerald-600">Signature Applied!</h2>
            <p className="text-muted-foreground mb-10 text-lg leading-relaxed">
              Your document has been signed locally and downloaded. No data ever left your browser.
            </p>
            <Button size="lg" className="rounded-full h-14 px-10 text-lg" onClick={() => { setFiles([]); setThumbnail(null); setIsFinished(false); }}>
              Sign Another Document
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

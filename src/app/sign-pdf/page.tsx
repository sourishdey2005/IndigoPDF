"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { PenTool, ArrowRight, Download, Loader2, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { signPDF } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

export default function SignPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const { toast } = useToast();

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles([newFiles[0]]);
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

    ctx.lineWidth = 2;
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

    setIsProcessing(true);
    try {
      const signatureDataUri = canvas.toDataURL('image/png');
      const signedBytes = await signPDF(files[0], signatureDataUri);
      const blob = new Blob([signedBytes], { type: "application/pdf" });
      saveAs(blob, `signed-${files[0].name}`);
      setIsFinished(true);
      toast({ title: "Signed!", description: "Your signature has been applied to the last page." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to sign the PDF.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <PenTool size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">Sign PDF</h1>
        <p className="text-muted-foreground text-lg">Draw your signature and apply it to any document instantly.</p>
      </div>

      <div className="space-y-8">
        {!isFinished ? (
          <>
            <PDFDropzone files={files} onFilesAdded={handleFilesAdded} onFileRemoved={() => setFiles([])} multiple={false} />
            
            {files.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <Card className="bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold">Draw your signature</h3>
                      <Button variant="outline" size="sm" onClick={clearCanvas}>
                        <Eraser size={14} className="mr-2" />
                        Clear
                      </Button>
                    </div>
                    <div className="bg-slate-50 border rounded-xl overflow-hidden touch-none">
                      <canvas
                        ref={canvasRef}
                        width={600}
                        height={200}
                        className="w-full cursor-crosshair"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                      />
                    </div>
                  </CardContent>
                </Card>
                <div className="flex justify-center">
                  <Button size="lg" disabled={isProcessing} onClick={handleProcess} className="rounded-full h-14 px-10 text-lg shadow-xl shadow-primary/20">
                    {isProcessing ? <Loader2 className="animate-spin mr-2" /> : "Sign & Download"}
                  </Button>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <div className="text-center bg-white border p-12 rounded-3xl">
            <Download size={48} className="mx-auto mb-4 text-emerald-500" />
            <h2 className="text-2xl font-bold mb-2">Signature Applied</h2>
            <Button onClick={() => setIsFinished(false)}>Sign Another</Button>
          </div>
        )}
      </div>
    </div>
  );
}

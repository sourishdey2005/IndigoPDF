"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, ArrowRight, Download, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { convertImagesToPDF } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ScanToPDFPage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };
    getCameraPermission();
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        setCapturedImages(prev => [...prev, dataUri]);
        toast({ title: "Captured!", description: "Page added to your scan." });
      }
    }
  };

  const handleCreatePDF = async () => {
    if (capturedImages.length === 0) return;
    setIsProcessing(true);
    try {
      const files = await Promise.all(capturedImages.map(async (uri, i) => {
        const res = await fetch(uri);
        const blob = await res.blob();
        return new File([blob], `scan-${i}.jpg`, { type: 'image/jpeg' });
      }));
      const pdfBytes = await convertImagesToPDF(files);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      saveAs(blob, "scanned-document.pdf");
      toast({ title: "PDF Created", description: "Your scan has been downloaded." });
      setCapturedImages([]);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to create PDF from scan.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <Camera size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">Scan to PDF</h1>
        <p className="text-muted-foreground text-lg">Use your device camera to capture document pages directly.</p>
      </div>

      <div className="space-y-8">
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 aspect-video shadow-2xl border-4 border-white">
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
            <Button size="lg" className="rounded-full w-16 h-16 bg-white hover:bg-slate-100 text-primary border-4 border-primary/20" onClick={captureFrame}>
              <div className="w-8 h-8 rounded-full border-2 border-primary" />
            </Button>
          </div>
        </div>

        {hasCameraPermission === false && (
          <Alert variant="destructive">
            <AlertTitle>Camera Access Required</AlertTitle>
            <AlertDescription>Please allow camera access to use this feature.</AlertDescription>
          </Alert>
        )}

        {capturedImages.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-bold text-lg">Scanned Pages ({capturedImages.length})</h3>
              <Button variant="ghost" size="sm" onClick={() => setCapturedImages([])} className="text-destructive">Clear All</Button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
              {capturedImages.map((uri, idx) => (
                <div key={idx} className="relative aspect-[3/4] bg-white rounded-lg border shadow-sm overflow-hidden">
                  <img src={uri} alt={`Page ${idx}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="flex justify-center pt-6">
              <Button size="lg" disabled={isProcessing} onClick={handleCreatePDF} className="rounded-full h-14 px-10 text-lg shadow-xl shadow-primary/20">
                {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Download className="mr-2" />}
                Generate PDF
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

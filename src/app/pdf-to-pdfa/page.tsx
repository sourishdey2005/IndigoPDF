
"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Layers, ArrowRight, Download, Loader2, CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { pdfToPDFA } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export default function PDFToPDFAPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
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
      const result = await pdfToPDFA(files[0]);
      saveAs(new Blob([result]), `archived-${files[0].name}`);
      setIsFinished(true);
      toast({ 
        title: "Archival Complete", 
        description: "Your PDF has been converted to PDF/A for long-term storage." 
      });
    } catch (e) {
      toast({ 
        title: "Error", 
        description: "Failed to convert to PDF/A.", 
        variant: "destructive" 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <Layers size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">PDF to PDF/A</h1>
        <p className="text-muted-foreground text-lg">Transform standard PDF documents for long-term archiving (ISO standard).</p>
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
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6">
                <Card className="max-w-xs w-full bg-white shadow-xl rounded-3xl overflow-hidden border-none relative">
                  <CardContent className="p-0 aspect-[3/4] flex items-center justify-center relative bg-slate-50">
                    {isLoadingThumbnail ? (
                      <Loader2 className="animate-spin text-primary" />
                    ) : thumbnail ? (
                      <img src={thumbnail} alt="PDF Preview" className="w-full h-full object-contain p-4" />
                    ) : (
                      <FileText size={48} className="text-slate-200" />
                    )}
                  </CardContent>
                </Card>
                <div className="text-center">
                  <p className="font-bold">{files[0].name}</p>
                </div>
              </motion.div>
            )}

            <div className="flex justify-center">
              <Button 
                size="lg" 
                disabled={files.length === 0 || isProcessing} 
                onClick={handleProcess}
                className="rounded-full h-14 px-10 shadow-xl shadow-primary/20"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin mr-2" />
                    Converting...
                  </>
                ) : (
                  <>
                    Convert to PDF/A
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center p-12 bg-white border rounded-3xl shadow-xl">
            <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Archival Version Ready!</h2>
            <p className="mb-8 text-muted-foreground">Your document has been standardized for archival stability.</p>
            <Button onClick={() => { setFiles([]); setThumbnail(null); setIsFinished(false); }} className="rounded-full h-12">Convert Another</Button>
          </div>
        )}
      </div>
    </div>
  );
}

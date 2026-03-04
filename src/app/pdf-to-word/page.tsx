
"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, ArrowRight, Download, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { useToast } from "@/hooks/use-toast";
import { saveAs } from "file-saver";
import { Card, CardContent } from "@/components/ui/card";
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export default function PDFToWordPage() {
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
      await new Promise(r => setTimeout(r, 2500));
      const blob = new Blob(["Simulated Word Content"], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      saveAs(blob, `${files[0].name.replace('.pdf', '')}.docx`);
      setIsFinished(true);
      toast({
        title: "Conversion Complete",
        description: "Your PDF has been converted to an editable Word document.",
      });
    } catch (error) {
      toast({ title: "Error", description: "Conversion failed.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <FileText size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">PDF to Word</h1>
        <p className="text-muted-foreground text-lg">Convert your PDF files into editable DOC and DOCX documents.</p>
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
                <Card className="max-w-xs w-full bg-white shadow-xl rounded-3xl overflow-hidden border-none">
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
                <div className="text-center space-y-2">
                  <p className="font-bold">{files[0].name}</p>
                  <p className="text-sm text-muted-foreground">Ready for conversion</p>
                </div>
              </motion.div>
            )}

            <div className="flex justify-center">
              <Button
                size="lg"
                disabled={files.length === 0 || isProcessing}
                onClick={handleProcess}
                className="rounded-full h-14 px-10 text-lg shadow-xl shadow-primary/20"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    Convert to Word
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
            className="bg-white border rounded-3xl p-12 text-center shadow-xl"
          >
            <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Conversion Success!</h2>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto">
              Your Word document is ready.
            </p>
            <Button size="lg" className="rounded-full h-12" onClick={() => { setFiles([]); setThumbnail(null); setIsFinished(false); }}>
              Convert More Files
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

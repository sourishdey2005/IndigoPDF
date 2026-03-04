
"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Combine, ArrowRight, Download, Loader2, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { mergePDFs } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

interface FileWithThumbnail {
  file: File;
  thumbnail: string | null;
}

export default function MergePDFPage() {
  const [files, setFiles] = useState<FileWithThumbnail[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { toast } = useToast();

  const generateThumbnail = async (file: File): Promise<string | null> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.3 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return null;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport }).promise;
      return canvas.toDataURL('image/jpeg', 0.7);
    } catch (e) {
      return null;
    }
  };

  const handleFilesAdded = async (newFiles: File[]) => {
    const filesWithThumbnails = await Promise.all(
      newFiles.map(async (file) => ({
        file,
        thumbnail: await generateThumbnail(file)
      }))
    );
    setFiles((prev) => [...prev, ...filesWithThumbnails]);
    setIsFinished(false);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    if (files.length < 2) {
      toast({
        title: "Minimum 2 files required",
        description: "Please upload at least two PDF files to merge.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const actualFiles = files.map(f => f.file);
      const mergedPdfBytes = await mergePDFs(actualFiles);
      const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
      saveAs(blob, "merged-indigopdf.pdf");
      setIsFinished(true);
      toast({
        title: "Success!",
        description: "Your PDF files have been merged and downloaded.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong while merging the files.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6"
        >
          <Combine size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">Merge PDF</h1>
        <p className="text-muted-foreground text-lg">
          Combine multiple PDF files into one single document in seconds.
        </p>
      </div>

      <div className="space-y-8">
        {!isFinished ? (
          <>
            <PDFDropzone 
              files={files.map(f => f.file)} 
              onFilesAdded={handleFilesAdded} 
              onFileRemoved={removeFile} 
            />
            
            {files.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                <AnimatePresence>
                  {files.map((item, idx) => (
                    <motion.div
                      key={`${item.file.name}-${idx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group relative"
                    >
                      <Card className="overflow-hidden border-2 bg-white hover:border-primary/50 transition-colors">
                        <CardContent className="p-0 aspect-[3/4] flex items-center justify-center relative">
                          {item.thumbnail ? (
                            <img src={item.thumbnail} alt={item.file.name} className="w-full h-full object-contain p-2" />
                          ) : (
                            <FileText size={32} className="text-slate-300" />
                          )}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="destructive" className="h-6 w-6 rounded-full" onClick={() => removeFile(idx)}>
                              <X size={12} />
                            </Button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                            <p className="text-[10px] text-white truncate text-center">{item.file.name}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            <div className="flex justify-center pt-6">
              <Button
                size="lg"
                disabled={files.length < 2 || isProcessing}
                onClick={handleProcess}
                className="rounded-full h-14 px-10 text-lg shadow-xl shadow-primary/20 min-w-[200px]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Merge {files.length} Files
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
            className="bg-white border rounded-3xl p-12 text-center shadow-xl shadow-slate-200/50"
          >
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Download size={40} />
            </div>
            <h2 className="text-3xl font-bold mb-4">Task Complete!</h2>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto">
              Your files have been merged successfully.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-full h-12" onClick={() => { setFiles([]); setIsFinished(false); }}>
                Start Over
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

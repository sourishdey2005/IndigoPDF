
"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle, ArrowRight, Download, Loader2, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { deletePages } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from 'pdfjs-dist';
import { Card, CardContent } from "@/components/ui/card";

// Configure pdfjs worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

interface PagePreview {
  id: string;
  index: number;
  thumbnail: string;
}

export default function DeletePagesPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [pages, setPages] = useState<PagePreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { toast } = useToast();

  const loadPagePreviews = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const previews: PagePreview[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.4 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        previews.push({
          id: `page-${i}-${Date.now()}`,
          index: i,
          thumbnail: canvas.toDataURL('image/jpeg', 0.6)
        });
      }
      setPages(previews);
    } catch (e) {
      toast({ title: "Error", description: "Failed to load PDF pages.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles([newFiles[0]]);
    loadPagePreviews(newFiles[0]);
    setIsFinished(false);
  };

  const removePageFromList = (id: string) => {
    setPages(prev => prev.filter(p => p.id !== id));
  };

  const handleProcess = async () => {
    if (files.length === 0 || pages.length === 0) return;
    setIsProcessing(true);
    try {
      // Find which pages were removed
      const arrayBuffer = await files[0].arrayBuffer();
      const originalPdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const originalCount = originalPdf.numPages;
      
      const currentIndices = pages.map(p => p.index);
      const pagesToDelete = Array.from({ length: originalCount }, (_, i) => i + 1)
        .filter(idx => !currentIndices.includes(idx));

      const result = await deletePages(files[0], pagesToDelete);
      saveAs(new Blob([result]), `cleaned-${files[0].name}`);
      setIsFinished(true);
      toast({ title: "Success", description: "Selected pages have been removed." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete pages.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <XCircle size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">Delete PDF Pages</h1>
        <p className="text-muted-foreground text-lg">Visually select and remove unwanted pages from your document.</p>
      </div>

      <div className="space-y-8">
        {!isFinished ? (
          <>
            {files.length === 0 ? (
              <PDFDropzone files={files} onFilesAdded={handleFilesAdded} onFileRemoved={() => setFiles([])} multiple={false} />
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between bg-white p-6 rounded-3xl border shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">{files[0].name}</h3>
                      <p className="text-xs text-muted-foreground">{pages.length} pages remaining</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => { setFiles([]); setPages([]); }} disabled={isProcessing}>Change File</Button>
                    <Button onClick={handleProcess} disabled={isProcessing || pages.length === 0} className="rounded-full px-8 shadow-lg shadow-primary/20">
                      {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Download className="mr-2" />}
                      Save & Download
                    </Button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground text-sm">Loading page previews...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    <AnimatePresence>
                      {pages.map((page) => (
                        <motion.div
                          key={page.id}
                          layout
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="relative group"
                        >
                          <Card className="overflow-hidden border-2 hover:border-destructive transition-colors bg-white">
                            <CardContent className="p-0">
                              <div className="aspect-[3/4] bg-slate-50 relative flex items-center justify-center">
                                <img src={page.thumbnail} alt={`Page ${page.index}`} className="w-full h-full object-contain" />
                                <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
                                  {page.index}
                                </div>
                                <div className="absolute inset-0 bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    className="rounded-full h-8 w-8 p-0"
                                    onClick={() => removePageFromList(page.id)}
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-12 bg-white border rounded-3xl shadow-xl max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Download size={40} />
            </div>
            <h2 className="text-3xl font-bold mb-4">Task Complete!</h2>
            <p className="text-muted-foreground mb-8">Your modified PDF has been downloaded. All selected pages were removed successfully.</p>
            <Button onClick={() => { setFiles([]); setPages([]); setIsFinished(false); }} className="rounded-full">Start New Task</Button>
          </div>
        )}
      </div>
    </div>
  );
}

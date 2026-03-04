"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { 
  Grid3X3, 
  ArrowRight, 
  Download, 
  Loader2, 
  RotateCw, 
  Trash2, 
  GripVertical,
  Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { organizePDF, processOrganizedPDF } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from 'pdfjs-dist';
import { Card, CardContent } from "@/components/ui/card";

// Configure pdfjs worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

interface PageItem {
  id: string;
  originalIndex: number;
  rotation: number;
  thumbnail: string;
}

export default function OrganizePDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { toast } = useToast();

  const loadPages = useCallback(async (file: File) => {
    setIsLoadingPages(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const loadedPages: PageItem[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        
        loadedPages.push({
          id: `page-${i}-${Date.now()}`,
          originalIndex: i - 1,
          rotation: 0,
          thumbnail: canvas.toDataURL('image/jpeg', 0.7)
        });
      }
      setPages(loadedPages);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to load PDF pages.", variant: "destructive" });
    } finally {
      setIsLoadingPages(false);
    }
  }, [toast]);

  const handleFilesAdded = (newFiles: File[]) => {
    const file = newFiles[0];
    setFiles([file]);
    loadPages(file);
    setIsFinished(false);
  };

  const handleRotate = (id: string) => {
    setPages(prev => prev.map(p => 
      p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p
    ));
  };

  const handleRemove = (id: string) => {
    setPages(prev => prev.filter(p => p.id !== id));
    toast({ title: "Page Removed", description: "The page has been removed from the final export." });
  };

  const handleProcess = async () => {
    if (files.length === 0 || pages.length === 0) return;

    setIsProcessing(true);
    try {
      const pageData = pages.map(p => ({
        index: p.originalIndex,
        rotation: p.rotation
      }));
      
      const organizedBytes = await processOrganizedPDF(files[0], pageData);
      const blob = new Blob([organizedBytes], { type: "application/pdf" });
      saveAs(blob, `organized-${files[0].name}`);
      setIsFinished(true);
      toast({
        title: "PDF Organized",
        description: "Your customized document has been generated and downloaded.",
      });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to generate organized PDF.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6"
        >
          <Grid3X3 size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">Organize PDF</h1>
        <p className="text-muted-foreground text-lg">
          Rearrange, rotate, and delete pages visually. Everything stays in your browser.
        </p>
      </div>

      <div className="space-y-8">
        {!isFinished ? (
          <>
            {files.length === 0 ? (
              <PDFDropzone files={files} onFilesAdded={handleFilesAdded} onFileRemoved={() => setFiles([])} multiple={false} />
            ) : (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-3xl border shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                      <Grid3X3 size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold">{files[0].name}</h3>
                      <p className="text-xs text-muted-foreground">{pages.length} pages ready to organize</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => { setFiles([]); setPages([]); }} disabled={isProcessing}>
                      Change File
                    </Button>
                    <Button onClick={handleProcess} disabled={isProcessing || pages.length === 0} className="rounded-full px-8 shadow-lg shadow-primary/20">
                      {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Download className="mr-2" />}
                      Save & Download
                    </Button>
                  </div>
                </div>

                {isLoadingPages ? (
                  <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium">Generating page previews...</p>
                  </div>
                ) : (
                  <Reorder.Group 
                    axis="y" 
                    values={pages} 
                    onReorder={setPages} 
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
                  >
                    <AnimatePresence>
                      {pages.map((page) => (
                        <Reorder.Item
                          key={page.id}
                          value={page}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          whileDrag={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                          className="relative cursor-grab active:cursor-grabbing group"
                        >
                          <Card className="overflow-hidden border-2 hover:border-primary transition-colors bg-white">
                            <CardContent className="p-0">
                              <div className="aspect-[3/4] bg-slate-100 relative overflow-hidden flex items-center justify-center">
                                <motion.img 
                                  src={page.thumbnail} 
                                  alt={`Page ${page.originalIndex + 1}`}
                                  animate={{ rotate: page.rotation }}
                                  className="w-full h-full object-contain"
                                />
                                <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                                  {page.originalIndex + 1}
                                </div>
                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <GripVertical className="text-primary" />
                                </div>
                              </div>
                              <div className="p-2 flex items-center justify-between border-t bg-slate-50/50">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-slate-500 hover:text-primary"
                                  onClick={(e) => { e.stopPropagation(); handleRotate(page.id); }}
                                >
                                  <RotateCw size={14} />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-slate-500 hover:text-destructive"
                                  onClick={(e) => { e.stopPropagation(); handleRemove(page.id); }}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </Reorder.Item>
                      ))}
                    </AnimatePresence>
                  </Reorder.Group>
                )}
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border rounded-3xl p-12 text-center shadow-xl max-w-2xl mx-auto"
          >
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Download size={40} />
            </div>
            <h2 className="text-3xl font-bold mb-4">PDF Organized!</h2>
            <p className="text-muted-foreground mb-10">
              Your new document with custom page order and rotations has been downloaded.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="rounded-full h-12" onClick={() => { setFiles([]); setPages([]); setIsFinished(false); }}>
                Start Over
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-20 pt-10 border-t">
        <h3 className="text-2xl font-bold mb-8">Professional Workspace Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-slate-50 rounded-2xl border">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm mb-4">
              <Maximize2 size={18} />
            </div>
            <h4 className="font-bold mb-2">Visual Previews</h4>
            <p className="text-sm text-muted-foreground">See exactly what's on every page before you make changes.</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm mb-4">
              <RotateCw size={18} />
            </div>
            <h4 className="font-bold mb-2">Instant Rotation</h4>
            <p className="text-sm text-muted-foreground">Fix upside-down or sideways pages with a single click.</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm mb-4">
              <GripVertical size={18} />
            </div>
            <h4 className="font-bold mb-2">Drag & Drop</h4>
            <p className="text-sm text-muted-foreground">Reorder pages intuitively by dragging them into your desired sequence.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

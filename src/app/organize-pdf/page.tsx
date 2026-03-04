
"use client";

import { useState, useCallback } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { 
  Grid3X3, 
  Download, 
  Loader2, 
  RotateCw, 
  Trash2, 
  GripVertical,
  Maximize2,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { processOrganizedPDF } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from 'pdfjs-dist';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    toast({ title: "Page Removed", description: "The page has been removed from the final sequence." });
  };

  const movePage = (index: number, direction: 'prev' | 'next') => {
    const newPages = [...pages];
    const targetIndex = direction === 'prev' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newPages.length) return;
    
    const [movedItem] = newPages.splice(index, 1);
    newPages.splice(targetIndex, 0, movedItem);
    setPages(newPages);
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
        title: "PDF Generated",
        description: "Your document with the new page sequence has been downloaded.",
      });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to generate organized PDF.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-6xl">
      <div className="text-center mb-8 sm:mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4 sm:mb-6"
        >
          <Grid3X3 size={32} />
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 font-headline tracking-tight">Organize & Reorder</h1>
        <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto px-4">
          Drag pages or use the arrows to change their sequence. Fix rotations or remove unwanted pages visually.
        </p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {!isFinished ? (
          <>
            {files.length === 0 ? (
              <PDFDropzone files={files} onFilesAdded={handleFilesAdded} onFileRemoved={() => setFiles([])} multiple={false} />
            ) : (
              <div className="space-y-6 sm:space-y-8">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border shadow-lg sticky top-20 sm:top-24 z-30">
                  <div className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-inner shrink-0">
                      <FileText size={24} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm sm:text-lg truncate max-w-[200px] sm:max-w-md">{files[0].name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono text-[9px] sm:text-[10px] h-5">{pages.length} Pages</Badge>
                        <p className="text-[10px] sm:text-xs text-muted-foreground italic hidden sm:block">Drag or use arrows to reorder</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:gap-3 w-full lg:w-auto">
                    <Button variant="outline" className="flex-1 lg:flex-none rounded-full h-10 sm:h-12 text-xs sm:text-sm" onClick={() => { setFiles([]); setPages([]); }} disabled={isProcessing}>
                      Change
                    </Button>
                    <Button onClick={handleProcess} disabled={isProcessing || pages.length === 0} className="flex-1 lg:flex-none rounded-full h-10 sm:h-12 px-4 sm:px-8 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-xs sm:text-sm">
                      {isProcessing ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
                      {isProcessing ? "Processing..." : "Generate PDF"}
                    </Button>
                  </div>
                </div>

                {isLoadingPages ? (
                  <div className="flex flex-col items-center justify-center py-20 sm:py-32 space-y-6">
                    <div className="relative">
                      <Loader2 className="h-12 w-12 sm:h-16 sm:h-16 animate-spin text-primary opacity-20" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FileText size={20} className="text-primary animate-pulse" />
                      </div>
                    </div>
                    <p className="text-muted-foreground font-medium text-sm animate-pulse">Rendering page previews...</p>
                  </div>
                ) : (
                  <div className="p-3 sm:p-6 bg-slate-50/50 dark:bg-slate-900/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    <Reorder.Group 
                      axis="y" 
                      values={pages} 
                      onReorder={setPages} 
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-8"
                    >
                      <AnimatePresence initial={false}>
                        {pages.map((page, index) => (
                          <Reorder.Item
                            key={page.id}
                            value={page}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            whileDrag={{ scale: 1.05, zIndex: 50 }}
                            className="relative cursor-grab active:cursor-grabbing group h-full"
                          >
                            <Card className="overflow-hidden h-full border-2 border-transparent hover:border-primary/50 transition-all duration-300 bg-white dark:bg-slate-900 shadow-md hover:shadow-xl">
                              <CardContent className="p-0 flex flex-col h-full">
                                <div className="aspect-[3/4] bg-slate-50 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center p-2">
                                  <div className="absolute top-1.5 left-1.5 z-10">
                                    <Badge className="bg-primary text-white shadow-md font-bold text-[9px] px-1.5 h-4 sm:h-5">
                                      #{index + 1}
                                    </Badge>
                                  </div>

                                  <motion.img 
                                    src={page.thumbnail} 
                                    alt={`Page ${page.originalIndex + 1}`}
                                    animate={{ rotate: page.rotation }}
                                    className="w-full h-full object-contain shadow-sm rounded-sm"
                                  />
                                  
                                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                    <div className="bg-white/90 backdrop-blur-md rounded-full p-1.5 shadow-lg">
                                      <GripVertical className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="p-1.5 sm:p-2 flex flex-col gap-1.5 border-t bg-slate-50/80 dark:bg-slate-800/80 mt-auto">
                                  <div className="flex items-center justify-between gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-7 w-7 sm:h-8 sm:w-8 text-slate-500 hover:text-primary hover:bg-white rounded-md disabled:opacity-30"
                                      onClick={(e) => { e.stopPropagation(); movePage(index, 'prev'); }}
                                      disabled={index === 0}
                                    >
                                      <ChevronLeft size={14} />
                                    </Button>
                                    <span className="text-[8px] sm:text-[10px] font-bold text-slate-400">MOVE</span>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-7 w-7 sm:h-8 sm:w-8 text-slate-500 hover:text-primary hover:bg-white rounded-md disabled:opacity-30"
                                      onClick={(e) => { e.stopPropagation(); movePage(index, 'next'); }}
                                      disabled={index === pages.length - 1}
                                    >
                                      <ChevronRight size={14} />
                                    </Button>
                                  </div>
                                  
                                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-700">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-7 w-7 sm:h-8 sm:w-8 text-slate-500 hover:text-primary hover:bg-white rounded-md transition-colors"
                                      onClick={(e) => { e.stopPropagation(); handleRotate(page.id); }}
                                    >
                                      <RotateCw size={12} />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-7 w-7 sm:h-8 sm:w-8 text-slate-500 hover:text-destructive hover:bg-white rounded-md transition-colors"
                                      onClick={(e) => { e.stopPropagation(); handleRemove(page.id); }}
                                    >
                                      <Trash2 size={12} />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Reorder.Item>
                        ))}
                      </AnimatePresence>
                    </Reorder.Group>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 border rounded-3xl p-8 sm:p-16 text-center shadow-2xl max-w-2xl mx-auto"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-inner">
              <Download size={40} className="sm:size-12" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 font-headline text-emerald-600">Document Ready!</h2>
            <p className="text-muted-foreground mb-8 sm:mb-10 text-sm sm:text-lg leading-relaxed">
              Your document with the new page sequence and rotations has been processed and downloaded successfully.
            </p>
            <Button size="lg" className="w-full sm:w-auto rounded-full h-12 sm:h-14 px-10 text-base sm:text-lg shadow-lg" onClick={() => { setFiles([]); setPages([]); setIsFinished(false); }}>
              Organize Another
            </Button>
          </motion.div>
        )}
      </div>

      <div className="mt-16 sm:mt-24 pt-8 sm:pt-12 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Maximize2 size={20} />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-headline">Professional Organizing</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {[
            { title: "Precision Arrows", desc: "Use the navigation arrows to move pages one-by-one with absolute precision, perfect for complex document restructuring." },
            { title: "Drag & Drop", desc: "Instantly reorder large sections of your PDF by dragging thumbnails anywhere in the grid with real-time feedback." },
            { title: "Bulk Management", desc: "Fix rotations or strip out unwanted pages visually as you organize, ensuring your final output is exactly as needed." }
          ].map((feature, i) => (
            <div key={i} className="group p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all">
              <h4 className="font-bold text-base sm:text-lg mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center">{i+1}</span>
                {feature.title}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

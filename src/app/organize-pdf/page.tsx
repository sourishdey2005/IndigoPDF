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
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { processOrganizedPDF } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from 'pdfjs-dist';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    toast({ title: "Page Removed", description: "The page has been removed from the final sequence." });
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
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6"
        >
          <Grid3X3 size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline tracking-tight">Organize & Reorder</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Drag pages to change their sequence. Fix rotations or remove unwanted pages visually before saving.
        </p>
      </div>

      <div className="space-y-8">
        {!isFinished ? (
          <>
            {files.length === 0 ? (
              <PDFDropzone files={files} onFilesAdded={handleFilesAdded} onFileRemoved={() => setFiles([])} multiple={false} />
            ) : (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-3xl border shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-inner">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{files[0].name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono text-[10px]">{pages.length} Pages</Badge>
                        <p className="text-xs text-muted-foreground italic">Drag thumbnails to reorder</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <Button variant="outline" className="flex-1 md:flex-none rounded-full" onClick={() => { setFiles([]); setPages([]); }} disabled={isProcessing}>
                      Change File
                    </Button>
                    <Button onClick={handleProcess} disabled={isProcessing || pages.length === 0} className="flex-1 md:flex-none rounded-full px-8 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90">
                      {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Download className="mr-2" />}
                      {isProcessing ? "Processing..." : "Generate PDF"}
                    </Button>
                  </div>
                </div>

                {isLoadingPages ? (
                  <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <div className="relative">
                      <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FileText size={24} className="text-primary animate-pulse" />
                      </div>
                    </div>
                    <p className="text-muted-foreground font-medium animate-pulse">Rendering page previews...</p>
                  </div>
                ) : (
                  <Reorder.Group 
                    axis="y" 
                    values={pages} 
                    onReorder={setPages} 
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8"
                  >
                    <AnimatePresence>
                      {pages.map((page, index) => (
                        <Reorder.Item
                          key={page.id}
                          value={page}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          whileDrag={{ scale: 1.05, zIndex: 50 }}
                          className="relative cursor-grab active:cursor-grabbing group"
                        >
                          <Card className="overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all duration-300 bg-white shadow-md hover:shadow-xl">
                            <CardContent className="p-0">
                              <div className="aspect-[3/4] bg-slate-50 relative overflow-hidden flex items-center justify-center p-2">
                                {/* Positioning Badges */}
                                <div className="absolute top-2 left-2 z-10">
                                  <Badge className="bg-primary text-white shadow-md font-bold text-[10px] px-2 h-5">
                                    NEW #{index + 1}
                                  </Badge>
                                </div>
                                <div className="absolute top-2 right-2 z-10">
                                  <Badge variant="outline" className="bg-white/80 backdrop-blur-sm text-slate-500 text-[10px] border-slate-200">
                                    ORIG #{page.originalIndex + 1}
                                  </Badge>
                                </div>

                                <motion.img 
                                  src={page.thumbnail} 
                                  alt={`Page ${page.originalIndex + 1}`}
                                  animate={{ rotate: page.rotation }}
                                  className="w-full h-full object-contain shadow-sm rounded-sm"
                                />
                                
                                {/* Overlay Controls */}
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <div className="bg-white/90 backdrop-blur-md rounded-full p-2 shadow-lg scale-90 group-hover:scale-100 transition-transform">
                                    <GripVertical className="text-primary h-5 w-5" />
                                  </div>
                                </div>
                              </div>
                              
                              <div className="p-2.5 flex items-center justify-between border-t bg-slate-50/80">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-9 w-9 text-slate-500 hover:text-primary hover:bg-white rounded-lg transition-colors"
                                  onClick={(e) => { e.stopPropagation(); handleRotate(page.id); }}
                                  title="Rotate Page"
                                >
                                  <RotateCw size={16} />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-9 w-9 text-slate-500 hover:text-destructive hover:bg-white rounded-lg transition-colors"
                                  onClick={(e) => { e.stopPropagation(); handleRemove(page.id); }}
                                  title="Remove Page"
                                >
                                  <Trash2 size={16} />
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
            className="bg-white border rounded-3xl p-16 text-center shadow-2xl max-w-2xl mx-auto"
          >
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Download size={48} />
            </div>
            <h2 className="text-3xl font-bold mb-4 font-headline">New Sequence Ready!</h2>
            <p className="text-muted-foreground mb-10 text-lg">
              Your document with the requested page order and orientation has been processed and downloaded.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-full h-14 px-10 text-lg shadow-lg" onClick={() => { setFiles([]); setPages([]); setIsFinished(false); }}>
                Organize Another
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-24 pt-12 border-t">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Maximize2 size={20} />
          </div>
          <h3 className="text-2xl font-bold font-headline">Smart Organizing Features</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all">
            <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">1</span>
              Visual Sequence
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Instantly see the new order of your PDF. Every thumbnail updates its "NEW" position number as you drag it, ensuring complete clarity.
            </p>
          </div>
          <div className="group p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all">
            <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">2</span>
              Selective Cleanup
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Clean up your document as you reorder. Use the trash icon to strip out blank pages or unnecessary content from the final output.
            </p>
          </div>
          <div className="group p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all">
            <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">3</span>
              Bulk Rotation
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Fix landscape or upside-down pages individually. The 90° clockwise rotation ensures your document looks professional on any device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

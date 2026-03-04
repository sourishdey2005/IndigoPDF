"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Info, Download, Loader2, Save, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { updateMetadata } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export default function AddMetadataPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [meta, setMeta] = useState({ title: "", author: "", subject: "", keywords: "" });
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
      const result = await updateMetadata(files[0], meta);
      saveAs(new Blob([result]), `metadata-${files[0].name}`);
      setIsFinished(true);
      toast({ title: "Metadata Updated", description: "Properties have been saved to the PDF." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to update metadata.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <Info size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">PDF Metadata Editor</h1>
        <p className="text-muted-foreground text-lg">Edit Title, Author, and other properties of your PDF.</p>
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
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <Card className="bg-white rounded-3xl border-none shadow-xl">
                  <CardContent className="p-8 grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input value={meta.title} onChange={(e) => setMeta({...meta, title: e.target.value})} placeholder="e.g. Annual Report" />
                    </div>
                    <div className="space-y-2">
                      <Label>Author</Label>
                      <Input value={meta.author} onChange={(e) => setMeta({...meta, author: e.target.value})} placeholder="e.g. John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Input value={meta.subject} onChange={(e) => setMeta({...meta, subject: e.target.value})} placeholder="e.g. Finance" />
                    </div>
                    <div className="space-y-2">
                      <Label>Keywords</Label>
                      <Input value={meta.keywords} onChange={(e) => setMeta({...meta, keywords: e.target.value})} placeholder="e.g. data, report" />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 font-bold px-2">
                    <FileText size={18} className="text-slate-400" />
                    <span>Document Preview</span>
                  </div>
                  <div className="aspect-[3/4] bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center relative">
                    {isLoadingThumbnail ? (
                      <Loader2 className="animate-spin text-primary" />
                    ) : thumbnail ? (
                      <img src={thumbnail} alt="PDF Preview" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-muted-foreground text-sm">Preview loading...</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
            
            <div className="flex justify-center">
              <Button size="lg" disabled={files.length === 0 || isProcessing} onClick={handleProcess} className="rounded-full h-14 px-10">
                {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                Save Metadata
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center p-12 bg-white border rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Metadata Saved!</h2>
            <Button onClick={() => setIsFinished(false)}>Edit Another</Button>
          </div>
        )}
      </div>
    </div>
  );
}
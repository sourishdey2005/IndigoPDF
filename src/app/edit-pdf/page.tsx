"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { PenTool, ArrowRight, Download, Loader2, Type, Move, Layers, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { editPDF } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export default function EditPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const [text, setText] = useState("IndigoPDF Annotation");
  const [fontSize, setFontSize] = useState("24");
  const [color, setColor] = useState("#4f46e5");
  const [posX, setPosX] = useState("50");
  const [posY, setPosY] = useState("500");
  const [targetType, setTargetType] = useState("all");
  const [specificPage, setSpecificPage] = useState("1");

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
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);

      const options = {
        text,
        x: parseInt(posX),
        y: parseInt(posY),
        size: parseInt(fontSize),
        color: { r, g, b },
        pageIndex: targetType === "specific" ? parseInt(specificPage) - 1 : undefined
      };

      const editedBytes = await editPDF(files[0], options);
      const blob = new Blob([editedBytes], { type: "application/pdf" });
      saveAs(blob, `edited-${files[0].name}`);
      setIsFinished(true);
      toast({
        title: "PDF Edited Successfully",
        description: `Annotations applied to ${targetType === "all" ? "all pages" : `page ${specificPage}`}.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to apply edits to the PDF.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <PenTool size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">Edit PDF Content</h1>
        <p className="text-muted-foreground text-lg">Add professional text annotations and custom stamps to your documents.</p>
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
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 bg-white border-none shadow-xl rounded-3xl overflow-hidden">
                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <Type size={18} />
                        <span>Annotation Content</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Text to add</Label>
                          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter your text here..." />
                        </div>
                        <div className="space-y-2">
                          <Label>Color</Label>
                          <div className="flex gap-2">
                            <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-12 h-10 p-1" />
                            <Input value={color} onChange={(e) => setColor(e.target.value)} className="font-mono" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <Move size={18} />
                        <span>Position & Style</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label>Font Size</Label>
                          <Input type="number" value={fontSize} onChange={(e) => setFontSize(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>X (Left Offset)</Label>
                          <Input type="number" value={posX} onChange={(e) => setPosX(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Y (Bottom Offset)</Label>
                          <Input type="number" value={posY} onChange={(e) => setPosY(e.target.value)} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <Layers size={18} />
                        <span>Target Pages</span>
                      </div>
                      <RadioGroup value={targetType} onValueChange={setTargetType} className="flex flex-col sm:flex-row gap-6">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all" id="r1" />
                          <Label htmlFor="r1">Apply to all pages</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="specific" id="r2" />
                          <Label htmlFor="r2">Specific Page</Label>
                        </div>
                      </RadioGroup>
                      {targetType === "specific" && (
                        <div className="max-w-[150px] space-y-2">
                          <Label>Page Number</Label>
                          <Input type="number" value={specificPage} onChange={(e) => setSpecificPage(e.target.value)} min="1" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-2 font-bold px-2">
                    <FileText size={18} className="text-slate-400" />
                    <span>Page Preview</span>
                  </div>
                  <div className="aspect-[3/4] bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center relative">
                    {isLoadingThumbnail ? (
                      <Loader2 className="animate-spin text-primary" />
                    ) : thumbnail ? (
                      <img src={thumbnail} alt="PDF Preview" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-muted-foreground text-sm">No preview available</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex justify-center pt-6">
              <Button
                size="lg"
                disabled={files.length === 0 || isProcessing}
                onClick={handleProcess}
                className="rounded-full h-14 px-12 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Apply Edits & Download
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
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Download size={40} />
            </div>
            <h2 className="text-3xl font-bold mb-4">Success!</h2>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto">
              Your edited document has been downloaded. All annotations were applied as requested.
            </p>
            <Button size="lg" className="rounded-full h-12" onClick={() => setIsFinished(false)}>
              Edit Another Document
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ImageIcon, Download, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { pdfToJpg } from "@/lib/pdf-service";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { saveAs } from "file-saver";

export default function PDFToJPGPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [images, setImages] = useState<string[] | null>(null);
  const { toast } = useToast();

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles([newFiles[0]]);
    setImages(null);
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const result = await pdfToJpg(files[0]);
      setImages(result);
      toast({ 
        title: "Conversion Complete", 
        description: `Successfully converted ${result.length} PDF pages to images.` 
      });
    } catch (error) {
      console.error("PDF to JPG Error:", error);
      toast({ 
        title: "Conversion Failed", 
        description: "An error occurred while processing the PDF. Please ensure the file is valid.", 
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
          <ImageIcon size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">PDF to JPG</h1>
        <p className="text-muted-foreground text-lg">Convert each PDF page into a high-quality JPG image.</p>
      </div>

      <div className="space-y-8">
        {!images ? (
          <>
            <PDFDropzone files={files} onFilesAdded={handleFilesAdded} onFileRemoved={() => setFiles([])} multiple={false} />
            <div className="flex justify-center">
              <Button 
                size="lg" 
                disabled={files.length === 0 || isProcessing} 
                onClick={handleProcess} 
                className="rounded-full h-14 px-10 shadow-xl shadow-primary/20"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Processing...
                  </>
                ) : (
                  <>
                    Convert to JPG
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <ImageIcon size={20} />
                </div>
                <div>
                  <h3 className="font-bold">Generated Images</h3>
                  <p className="text-xs text-muted-foreground">{images.length} pages converted</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setImages(null)} className="rounded-full">
                <RefreshCw size={14} className="mr-2" />
                New Conversion
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {images.map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="overflow-hidden group relative bg-white border-none shadow-md">
                    <CardContent className="p-0 aspect-[3/4] relative">
                      <img src={img} className="w-full h-full object-cover" alt={`Page ${i+1}`} />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity gap-2">
                        <span className="text-white text-xs font-bold mb-2">Page {i + 1}</span>
                        <Button size="sm" className="rounded-full" onClick={() => saveAs(img, `page-${i+1}.jpg`)}>
                          <Download size={14} className="mr-2" /> Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-20 pt-10 border-t">
        <h3 className="text-2xl font-bold mb-6">High Quality PDF Rendering</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-slate-50 rounded-3xl">
            <h4 className="font-bold mb-2">100% Privacy</h4>
            <p className="text-sm text-muted-foreground">The conversion happens locally in your browser. No files are ever uploaded or stored on our servers.</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-3xl">
            <h4 className="font-bold mb-2">Crystal Clear</h4>
            <p className="text-sm text-muted-foreground">We use a 2x supersampling scale during rendering to ensure your JPGs are sharp and readable.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

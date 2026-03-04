"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ImageIcon, Download, Loader2, ArrowRight } from "lucide-react";
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
      toast({ title: "Conversion Complete", description: "PDF pages converted to images." });
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
              <Button size="lg" disabled={files.length === 0 || isProcessing} onClick={handleProcess} className="rounded-full h-14 px-10">
                {isProcessing ? <Loader2 className="animate-spin mr-2" /> : null}
                Convert to JPG
              </Button>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img, i) => (
              <Card key={i} className="overflow-hidden group relative">
                <CardContent className="p-0 aspect-[3/4]">
                  <img src={img} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Button size="sm" onClick={() => saveAs(img, `page-${i+1}.jpg`)}>
                      <Download size={14} className="mr-2" /> Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

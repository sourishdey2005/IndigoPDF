"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileSearch, ArrowRight, Download, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { ocrPdfDocument } from "@/ai/flows/ocr-pdf-document";
import * as pdfjsLib from 'pdfjs-dist';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

// Configure pdfjs worker to use the correct ESM format for version 4+
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export default function OCRPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedTexts, setExtractedTexts] = useState<string[] | null>(null);
  const { toast } = useToast();

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles([newFiles[0]]); // OCR handles one file at a time for this flow
    setExtractedTexts(null);
  };

  const removeFile = () => {
    setFiles([]);
  };

  const handleOCR = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const pageImages: string[] = [];

      // Only process first few pages to stay within limits if necessary, 
      // but for this demo let's try to process as requested
      const maxPages = Math.min(numPages, 5); // Limit for demo stability

      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        pageImages.push(canvas.toDataURL('image/png'));
      }

      const result = await ocrPdfDocument({ pageImages });
      setExtractedTexts(result.extractedText);
      
      toast({
        title: "OCR Complete",
        description: `Successfully extracted text from ${maxPages} pages.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to perform OCR on the document. Ensure it is a valid PDF.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadTxt = () => {
    if (!extractedTexts) return;
    const fullText = extractedTexts.join('\n\n--- Page Break ---\n\n');
    const blob = new Blob([fullText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ocr-result-${files[0].name.replace('.pdf', '')}.txt`;
    link.click();
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6"
        >
          <FileSearch size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">OCR PDF</h1>
        <p className="text-muted-foreground text-lg">
          Extract text from scanned PDF documents using intelligent AI recognition.
        </p>
      </div>

      <div className="space-y-8">
        {!extractedTexts ? (
          <>
            <PDFDropzone 
              files={files} 
              onFilesAdded={handleFilesAdded} 
              onFileRemoved={removeFile} 
              multiple={false}
            />
            
            <div className="flex justify-center pt-6">
              <Button
                size="lg"
                disabled={files.length === 0 || isProcessing}
                onClick={handleOCR}
                className="rounded-full h-14 px-10 text-lg shadow-xl shadow-primary/20 min-w-[200px]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing Document...
                  </>
                ) : (
                  <>
                    Perform OCR
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
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Extracted Text</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setExtractedTexts(null)}>
                  New File
                </Button>
                <Button onClick={handleDownloadTxt}>
                  <Download className="mr-2 h-4 w-4" />
                  Download .txt
                </Button>
              </div>
            </div>
            
            <div className="grid gap-6">
              {extractedTexts.map((text, idx) => (
                <Card key={idx} className="bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <FileText size={14} />
                      Page {idx + 1}
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                      {text || "No text detected on this page."}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-20 pt-10 border-t">
        <h3 className="text-2xl font-bold mb-6">AI-Powered Optical Character Recognition</h3>
        <p className="text-muted-foreground mb-8">
          Our OCR tool uses advanced multimodal AI to "read" your scanned documents and images. It accurately identifies characters, words, and structure, converting them into searchable digital text.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-slate-50 rounded-2xl">
            <h4 className="font-bold mb-2">Preserves Content</h4>
            <p className="text-sm text-muted-foreground">Maintains the logical flow of text even in complex layouts or low-quality scans.</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl">
            <h4 className="font-bold mb-2">Privacy Protected</h4>
            <p className="text-sm text-muted-foreground">While text analysis uses secure cloud processing, your original files are handled as transient data URIs and never stored.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, ArrowRight, Download, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { extractTextFromPDF } from "@/lib/pdf-service";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function PDFToTextPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState<string[] | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles([newFiles[0]]);
    setExtractedText(null);
  };

  const handleProcess = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    try {
      const texts = await extractTextFromPDF(files[0]);
      setExtractedText(texts);
      toast({
        title: "Extraction successful",
        description: "Text content has been extracted from the PDF pages.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to extract text from the PDF.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText.join('\n\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Text copied to clipboard." });
  };

  const downloadText = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText.join('\n\n')], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${files[0].name.replace('.pdf', '')}.txt`;
    a.click();
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6"
        >
          <FileText size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">PDF to Text</h1>
        <p className="text-muted-foreground text-lg">
          Extract raw text data from digital PDF files instantly.
        </p>
      </div>

      <div className="space-y-8">
        {!extractedText ? (
          <>
            <PDFDropzone 
              files={files} 
              onFilesAdded={handleFilesAdded} 
              onFileRemoved={() => setFiles([])} 
              multiple={false}
            />
            
            <div className="flex justify-center pt-6">
              <Button
                size="lg"
                disabled={files.length === 0 || isProcessing}
                onClick={handleProcess}
                className="rounded-full h-14 px-10 text-lg shadow-xl shadow-primary/20 min-w-[200px]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    Extract Text
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
              <h2 className="text-2xl font-bold">Extracted Content</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={copyToClipboard}>
                  {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                  {copied ? "Copied" : "Copy All"}
                </Button>
                <Button variant="outline" onClick={downloadText}>
                  <Download className="mr-2 h-4 w-4" />
                  Download .txt
                </Button>
                <Button onClick={() => setExtractedText(null)}>
                  New File
                </Button>
              </div>
            </div>
            
            <Card className="bg-white">
              <CardContent className="p-0">
                <ScrollArea className="h-[600px] p-6">
                  {extractedText.map((pageText, idx) => (
                    <div key={idx} className="mb-10 last:mb-0">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                        Page {idx + 1}
                      </div>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {pageText || "No readable text on this page."}
                      </p>
                      {idx < extractedText.length - 1 && (
                        <div className="border-b my-8 border-dashed" />
                      )}
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

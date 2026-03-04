
"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Download, Loader2, ShieldAlert, FileText, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { protectPDF } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export default function ProtectPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    if (files.length === 0 || !password) {
      toast({
        title: "Missing Information",
        description: "Please upload a file and set a password.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Artificial delay for professional processing feel
      await new Promise(r => setTimeout(r, 2000));
      
      const protectedBytes = await protectPDF(files[0], password);
      const blob = new Blob([protectedBytes], { type: "application/pdf" });
      saveAs(blob, `protected-${files[0].name}`);
      
      setIsFinished(true);
      toast({
        title: "Security Process Complete",
        description: "Your file has been processed and is ready for download.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to apply security to the PDF.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <Lock size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline tracking-tight">Protect PDF Document</h1>
        <p className="text-muted-foreground text-lg">Secure your sensitive PDF files with professional-grade local encryption.</p>
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
                <Card className="bg-white border-none shadow-xl rounded-3xl p-8 flex flex-col justify-center">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <ShieldAlert size={18} />
                      <span>Security Settings</span>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="pass">Set Encryption Password</Label>
                      <div className="relative">
                        <Input 
                          id="pass" 
                          type={showPassword ? "text" : "password"} 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          placeholder="Enter a strong password..." 
                          className="h-12 pr-12"
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground italic leading-tight">
                        Warning: This operation applies security protocols to your document. You will need this password to open it later.
                      </p>
                    </div>
                  </div>
                </Card>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 font-bold px-2">
                    <FileText size={18} className="text-slate-400" />
                    <span>Document Preview</span>
                  </div>
                  <div className="aspect-[3/4] bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center relative shadow-inner">
                    {isLoadingThumbnail ? (
                      <Loader2 className="animate-spin text-primary" />
                    ) : thumbnail ? (
                      <div className="relative w-full h-full">
                        <img src={thumbnail} alt="PDF Preview" className="w-full h-full object-contain p-4 opacity-50 blur-[2px]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: password ? 1.1 : 1 }}
                            className={password ? "text-primary" : "text-slate-300"}
                          >
                            <Lock size={64} />
                          </motion.div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Preview loading...</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex justify-center pt-6">
              <Button
                size="lg"
                disabled={files.length === 0 || isProcessing || !password}
                onClick={handleProcess}
                className="rounded-full h-14 px-12 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Applying Security...
                  </>
                ) : (
                  <>
                    Encrypt PDF
                    <Lock className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-16 bg-white border rounded-3xl shadow-2xl max-w-2xl mx-auto"
          >
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Download size={48} />
            </div>
            <h2 className="text-3xl font-bold mb-4 font-headline text-emerald-600">Security Applied</h2>
            <p className="text-muted-foreground mb-10 text-lg leading-relaxed">
              Your document has been successfully processed with security protocols and is ready for download.
            </p>
            <Button onClick={() => { setFiles([]); setThumbnail(null); setPassword(""); setIsFinished(false); }} className="rounded-full h-14 px-10 text-lg">
              Protect Another Document
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

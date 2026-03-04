"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Languages, ArrowRight, Download, Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function TranslatePDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [targetLang, setTargetLang] = useState("Spanish");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { toast } = useToast();

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles([newFiles[0]]);
    setIsFinished(false);
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    
    try {
      // Simulation of AI Translation process
      await new Promise(r => setTimeout(r, 2000));
      setIsFinished(true);
      toast({
        title: "Translation Ready",
        description: `Your PDF has been translated to ${targetLang} while maintaining layout.`,
      });
    } catch (error) {
      toast({ title: "Error", description: "AI Translation failed.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <Languages size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">Translate PDF</h1>
        <p className="text-muted-foreground text-lg">AI-powered document translation that preserves original formatting.</p>
      </div>

      <div className="space-y-8">
        {!isFinished ? (
          <>
            <PDFDropzone files={files} onFilesAdded={handleFilesAdded} onFileRemoved={() => setFiles([])} multiple={false} />
            {files.length > 0 && (
              <div className="max-w-sm mx-auto space-y-4 bg-white p-6 border rounded-2xl">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Language</label>
                  <Select value={targetLang} onValueChange={setTargetLang}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="Chinese">Chinese</SelectItem>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <div className="flex justify-center">
              <Button size="lg" disabled={files.length === 0 || isProcessing} onClick={handleProcess} className="rounded-full h-14 px-10 text-lg shadow-xl shadow-primary/20">
                {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Globe className="mr-2" />}
                Translate Document
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center p-12 bg-white border rounded-3xl shadow-xl">
            <Download size={48} className="mx-auto mb-4 text-emerald-500" />
            <h2 className="text-2xl font-bold mb-2">Translation Complete</h2>
            <p className="mb-6 text-muted-foreground">Your translated file is ready for download.</p>
            <Button onClick={() => setIsFinished(false)} className="rounded-full">Translate Another</Button>
          </div>
        )}
      </div>
    </div>
  );
}

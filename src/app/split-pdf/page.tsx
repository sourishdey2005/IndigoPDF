
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Scissors, ArrowRight, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { splitPDF } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";

export default function SplitPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [range, setRange] = useState("1-1");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { toast } = useToast();

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles([newFiles[0]]); // Split only handles one file at a time
    setIsFinished(false);
  };

  const removeFile = () => {
    setFiles([]);
  };

  const handleProcess = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    try {
      const results = await splitPDF(files[0], range);
      if (results.length === 0) {
        throw new Error("Invalid range");
      }
      
      for (let i = 0; i < results.length; i++) {
        const blob = new Blob([results[i]], { type: "application/pdf" });
        saveAs(blob, `split-part-${i + 1}-${files[0].name}`);
      }
      
      setIsFinished(true);
      toast({
        title: "Success!",
        description: `Your PDF has been split into ${results.length} files.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong while splitting the PDF. Check your page ranges.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6"
        >
          <Scissors size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">Split PDF</h1>
        <p className="text-muted-foreground text-lg">
          Extract specific page ranges or split every page into separate files.
        </p>
      </div>

      <div className="space-y-8">
        {!isFinished ? (
          <>
            <PDFDropzone 
              files={files} 
              onFilesAdded={handleFilesAdded} 
              onFileRemoved={removeFile} 
              multiple={false}
            />
            
            {files.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border rounded-2xl p-6 shadow-sm"
              >
                <div className="grid gap-4 max-w-sm mx-auto">
                  <div className="space-y-2">
                    <Label htmlFor="range">Page Range</Label>
                    <Input 
                      id="range" 
                      placeholder="e.g. 1-3, 5, 8-10" 
                      value={range}
                      onChange={(e) => setRange(e.target.value)}
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Use commas for multiple ranges. Each range will be a separate file.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

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
                    Splitting...
                  </>
                ) : (
                  <>
                    Split PDF
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
            className="bg-white border rounded-3xl p-12 text-center shadow-xl shadow-slate-200/50"
          >
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Download size={40} />
            </div>
            <h2 className="text-3xl font-bold mb-4">Splitting Complete</h2>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto">
              Your requested pages have been extracted and downloaded.
            </p>
            <Button size="lg" className="rounded-full h-12" onClick={() => setIsFinished(false)}>
              Back to Start
            </Button>
          </motion.div>
        )}
      </div>

      <div className="mt-20 pt-10 border-t">
        <h3 className="text-2xl font-bold mb-6">Advanced Splitting Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-bold mb-2">Extract Ranges</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Define specific page sequences (e.g., 1-5, 10-12) to create focused documents from a larger file.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-2">Individual Pages</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Input each page number separated by a comma (e.g., 1, 2, 3) to extract every single page into its own file.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

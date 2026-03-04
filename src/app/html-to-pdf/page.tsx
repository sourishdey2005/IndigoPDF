"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, ArrowRight, Loader2, CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { convertUrlToPdf } from "@/lib/pdf-service";
import { saveAs } from "file-saver";

export default function HTMLToPDFPage() {
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { toast } = useToast();

  const handleConvert = async () => {
    if (!url) return;
    setIsProcessing(true);
    try {
      const pdfBytes = await convertUrlToPdf(url);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      saveAs(blob, "web-capture.pdf");
      setIsFinished(true);
      toast({ title: "Success", description: "Webpage successfully converted to PDF." });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to convert URL.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <Globe size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">HTML to PDF</h1>
        <p className="text-muted-foreground text-lg">Convert any webpage into a high-quality PDF document instantly.</p>
      </div>

      {!isFinished ? (
        <div className="max-w-2xl mx-auto space-y-8 bg-white p-8 md:p-12 rounded-3xl border shadow-xl">
          <div className="space-y-4">
            <Label htmlFor="url" className="text-lg font-bold">Webpage URL</Label>
            <Input 
              id="url" 
              placeholder="https://example.com" 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
              className="h-14 text-lg rounded-xl"
            />
            <p className="text-xs text-muted-foreground">Copy and paste the URL of the page you want to convert.</p>
          </div>
          
          <div className="flex justify-center">
            <Button size="lg" disabled={!url || isProcessing} onClick={handleConvert} className="rounded-full h-14 px-12 text-lg font-bold shadow-xl shadow-primary/20">
              {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Globe className="mr-2" />}
              Convert to PDF
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center p-12 bg-white border rounded-3xl shadow-xl max-w-2xl mx-auto">
          <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Webpage Captured!</h2>
          <p className="mb-8 text-muted-foreground">Your PDF version of <b>{url}</b> is ready for download.</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => setIsFinished(false)} className="rounded-full">Convert Another URL</Button>
            <Button variant="outline" className="rounded-full" onClick={handleConvert}>
              <Download className="mr-2 h-4 w-4" /> Download Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

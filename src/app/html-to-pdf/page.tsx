"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, ArrowRight, Loader2, CheckCircle2, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { convertUrlToPdf } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { Progress } from "@/components/ui/progress";

export default function HTMLToPDFPage() {
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const { toast } = useToast();

  const handleConvert = async () => {
    if (!url) return;
    
    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      toast({ title: "Invalid URL", description: "Please enter a complete URL (e.g., https://google.com)", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    
    try {
      // Step 1: Connecting
      setTimeout(() => setProgress(30), 500);
      
      // Step 2: Fetching DOM
      setTimeout(() => setProgress(60), 1200);
      
      // Step 3: Rendering Layout
      setTimeout(() => setProgress(85), 2000);

      const pdfBytes = await convertUrlToPdf(url);
      
      setTimeout(() => {
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        saveAs(blob, `capture-${new URL(url).hostname}.pdf`);
        setProgress(100);
        setIsFinished(true);
        toast({ title: "Success", description: "Webpage successfully captured to PDF." });
      }, 2500);

    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to capture URL.", variant: "destructive" });
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
      }, 3000);
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
            <Label htmlFor="url" className="text-lg font-bold flex items-center gap-2">
              <Search size={20} className="text-primary" />
              Webpage URL
            </Label>
            <Input 
              id="url" 
              type="url"
              placeholder="https://example.com" 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
              className="h-14 text-lg rounded-xl border-2 focus-visible:ring-primary"
              disabled={isProcessing}
            />
            <p className="text-xs text-muted-foreground">Copy and paste the full URL of the page you want to capture.</p>
          </div>
          
          {isProcessing && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium">
                <span>{progress < 40 ? "Connecting..." : progress < 70 ? "Fetching DOM..." : "Rendering Capture..."}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="flex justify-center">
            <Button size="lg" disabled={!url || isProcessing} onClick={handleConvert} className="rounded-full h-14 px-12 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105">
              {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Globe className="mr-2" />}
              {isProcessing ? "Capturing..." : "Convert to PDF"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center p-12 bg-white border rounded-3xl shadow-xl max-w-2xl mx-auto">
          <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Webpage Captured!</h2>
          <p className="mb-8 text-muted-foreground text-lg">Your PDF version of <span className="font-semibold text-foreground underline decoration-primary/30">{url}</span> is ready for download.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => setIsFinished(false)} variant="outline" className="rounded-full h-12 px-8">Convert Another URL</Button>
            <Button className="rounded-full h-12 px-8 font-bold" onClick={handleConvert}>
              <Download className="mr-2 h-4 w-4" /> Download Again
            </Button>
          </div>
        </div>
      )}

      <div className="mt-20 pt-10 border-t">
        <h3 className="text-2xl font-bold mb-8">How HTML to PDF Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-slate-50 rounded-2xl">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm mb-4">1</div>
            <h4 className="font-bold mb-2">Fetch</h4>
            <p className="text-sm text-muted-foreground">Our engine connects to the provided URL and securely fetches the page structure.</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm mb-4">2</div>
            <h4 className="font-bold mb-2">Render</h4>
            <p className="text-sm text-muted-foreground">We simulate a high-fidelity browser viewport to render styles, fonts, and layout.</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm mb-4">3</div>
            <h4 className="font-bold mb-2">Export</h4>
            <p className="text-sm text-muted-foreground">The rendered content is packaged into a standardized A4 PDF for easy sharing.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

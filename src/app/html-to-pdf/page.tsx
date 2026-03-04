"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function HTMLToPDFPage() {
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <Globe size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">HTML to PDF</h1>
        <p className="text-muted-foreground text-lg">Convert any webpage into a high-quality PDF document instantly.</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-8 bg-white p-8 rounded-3xl border shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="url">Webpage URL</Label>
          <Input 
            id="url" 
            placeholder="https://example.com" 
            value={url} 
            onChange={(e) => setUrl(e.target.value)} 
            className="h-12"
          />
        </div>
        
        <div className="flex justify-center">
          <Button size="lg" disabled={!url || isProcessing} className="rounded-full h-14 px-10 text-lg">
            {isProcessing ? <Loader2 className="animate-spin mr-2" /> : null}
            Convert to PDF
          </Button>
        </div>
      </div>
    </div>
  );
}

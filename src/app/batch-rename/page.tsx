
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Edit3, ArrowRight, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

export default function BatchRenamePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [pattern, setPattern] = useState("Document_{n}");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const newName = pattern.replace("{n}", (i + 1).toString()) + ".pdf";
        saveAs(file, newName);
      }
      toast({ title: "Batch Rename Success", description: `Renamed and downloaded ${files.length} files.` });
    } catch (e) {
      toast({ title: "Error", description: "Failed to rename files.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <Edit3 size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">Batch Rename</h1>
        <p className="text-muted-foreground text-lg">Automatically rename multiple PDF files using a custom pattern.</p>
      </div>

      <div className="space-y-8">
        <PDFDropzone files={files} onFilesAdded={(f) => setFiles([...files, ...f])} onFileRemoved={(i) => setFiles(files.filter((_, idx) => idx !== i))} />
        
        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-white dark:bg-slate-900 border-none shadow-xl">
              <CardContent className="p-8 space-y-4">
                <div className="space-y-2">
                  <Label>Naming Pattern</Label>
                  <Input value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="e.g. Invoice_{n}" />
                  <p className="text-xs text-muted-foreground">Use <code>{`{n}`}</code> for sequence number.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="flex justify-center">
          <Button size="lg" disabled={files.length === 0 || isProcessing} onClick={handleProcess} className="rounded-full h-14 px-10">
            {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Edit3 className="mr-2" />}
            Rename and Download
          </Button>
        </div>
      </div>
    </div>
  );
}

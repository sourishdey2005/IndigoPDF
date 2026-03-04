
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Hash, ArrowRight, Download, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { addBatesNumbering } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

export default function BatesNumberingPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [prefix, setPrefix] = useState("BATES");
  const [start, setStart] = useState("1");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { toast } = useToast();

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const result = await addBatesNumbering(files[0], prefix, parseInt(start) || 1);
      saveAs(new Blob([result]), `bates-${files[0].name}`);
      setIsFinished(true);
      toast({ title: "Bates Numbering Applied", description: "Sequential numbers have been added." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to apply numbering.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <Hash size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">Bates Numbering</h1>
        <p className="text-muted-foreground text-lg">Add sequential identification numbers for legal or business documents.</p>
      </div>

      <div className="space-y-8">
        {!isFinished ? (
          <>
            <PDFDropzone files={files} onFilesAdded={setFiles} onFileRemoved={() => setFiles([])} multiple={false} />
            {files.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="bg-white dark:bg-slate-900 rounded-3xl border-none shadow-xl">
                  <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Prefix</Label>
                      <Input value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="e.g. BATES" />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Number</Label>
                      <Input type="number" value={start} onChange={(e) => setStart(e.target.value)} placeholder="e.g. 1" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            <div className="flex justify-center">
              <Button size="lg" disabled={files.length === 0 || isProcessing} onClick={handleProcess} className="rounded-full h-14 px-10">
                {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Hash className="mr-2" />}
                Apply Numbering
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center p-12 bg-white dark:bg-slate-900 border rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Numbers Applied!</h2>
            <Button onClick={() => setIsFinished(false)}>Do Another</Button>
          </div>
        )}
      </div>
    </div>
  );
}

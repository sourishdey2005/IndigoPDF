"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { XCircle, ArrowRight, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { deletePages } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";

export default function DeletePagesPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [pages, setPages] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { toast } = useToast();

  const handleProcess = async () => {
    if (files.length === 0 || !pages) return;
    setIsProcessing(true);
    try {
      const pageList = pages.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
      const result = await deletePages(files[0], pageList);
      saveAs(new Blob([result]), `cleaned-${files[0].name}`);
      setIsFinished(true);
      toast({ title: "Pages Deleted", description: "The requested pages have been removed." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete pages.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <XCircle size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">Delete PDF Pages</h1>
        <p className="text-muted-foreground text-lg">Remove specific pages from your PDF document instantly.</p>
      </div>

      <div className="space-y-8">
        {!isFinished ? (
          <>
            <PDFDropzone files={files} onFilesAdded={setFiles} onFileRemoved={() => setFiles([])} multiple={false} />
            {files.length > 0 && (
              <div className="max-w-sm mx-auto space-y-4 bg-white p-6 border rounded-2xl shadow-sm">
                <div className="space-y-2">
                  <Label>Pages to Delete</Label>
                  <Input placeholder="e.g. 1, 5, 10" value={pages} onChange={(e) => setPages(e.target.value)} />
                  <p className="text-[10px] text-muted-foreground">Comma separated page numbers.</p>
                </div>
              </div>
            )}
            <div className="flex justify-center">
              <Button size="lg" disabled={files.length === 0 || !pages || isProcessing} onClick={handleProcess} className="rounded-full h-14 px-10">
                {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <XCircle className="mr-2" />}
                Delete Pages
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center p-12 bg-white border rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Task Complete</h2>
            <Button onClick={() => setIsFinished(false)}>Start Over</Button>
          </div>
        )}
      </div>
    </div>
  );
}

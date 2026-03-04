"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Info, ArrowRight, Download, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { updateMetadata } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

export default function AddMetadataPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [meta, setMeta] = useState({ title: "", author: "", subject: "", keywords: "" });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { toast } = useToast();

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const result = await updateMetadata(files[0], meta);
      saveAs(new Blob([result]), `metadata-${files[0].name}`);
      setIsFinished(true);
      toast({ title: "Metadata Updated", description: "Properties have been saved to the PDF." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to update metadata.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <Info size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">PDF Metadata Editor</h1>
        <p className="text-muted-foreground text-lg">Edit Title, Author, and other properties of your PDF.</p>
      </div>

      <div className="space-y-8">
        {!isFinished ? (
          <>
            <PDFDropzone files={files} onFilesAdded={setFiles} onFileRemoved={() => setFiles([])} multiple={false} />
            {files.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="bg-white rounded-3xl border-none shadow-xl">
                  <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input value={meta.title} onChange={(e) => setMeta({...meta, title: e.target.value})} placeholder="e.g. Annual Report" />
                    </div>
                    <div className="space-y-2">
                      <Label>Author</Label>
                      <Input value={meta.author} onChange={(e) => setMeta({...meta, author: e.target.value})} placeholder="e.g. John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Input value={meta.subject} onChange={(e) => setMeta({...meta, subject: e.target.value})} placeholder="e.g. Finance" />
                    </div>
                    <div className="space-y-2">
                      <Label>Keywords (comma separated)</Label>
                      <Input value={meta.keywords} onChange={(e) => setMeta({...meta, keywords: e.target.value})} placeholder="e.g. data, report, 2024" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            <div className="flex justify-center">
              <Button size="lg" disabled={files.length === 0 || isProcessing} onClick={handleProcess} className="rounded-full h-14 px-10">
                {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                Save Metadata
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center p-12 bg-white border rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Metadata Saved!</h2>
            <Button onClick={() => setIsFinished(false)}>Edit Another</Button>
          </div>
        )}
      </div>
    </div>
  );
}

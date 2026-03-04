
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { protectPDF } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";

export default function ProtectPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { toast } = useToast();

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles([newFiles[0]]);
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
      const protectedBytes = await protectPDF(files[0], password);
      const blob = new Blob([protectedBytes], { type: "application/pdf" });
      saveAs(blob, `protected-${files[0].name}`);
      setIsFinished(true);
      toast({
        title: "PDF Protected",
        description: "Your file is now encrypted and downloaded.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to protect the PDF.",
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
          <Lock size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">Protect PDF</h1>
        <p className="text-muted-foreground text-lg">
          Encrypt your PDF with a password to prevent unauthorized access.
        </p>
      </div>

      <div className="space-y-8">
        {!isFinished ? (
          <>
            <PDFDropzone 
              files={files} 
              onFilesAdded={handleFilesAdded} 
              onFileRemoved={() => setFiles([])} 
              multiple={false}
            />
            
            {files.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 border rounded-2xl max-w-sm mx-auto">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pass">Set Password</Label>
                    <Input id="pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password..." />
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex justify-center pt-6">
              <Button
                size="lg"
                disabled={files.length === 0 || isProcessing || !password}
                onClick={handleProcess}
                className="rounded-full h-14 px-10 text-lg shadow-xl shadow-primary/20 min-w-[200px]"
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : "Encrypt PDF"}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center bg-white border p-12 rounded-3xl shadow-xl">
            <Download size={48} className="mx-auto mb-4 text-emerald-500" />
            <h2 className="text-2xl font-bold mb-2">Security Applied</h2>
            <p className="text-muted-foreground mb-6">Your protected PDF has been downloaded.</p>
            <Button onClick={() => setIsFinished(false)}>Protect Another</Button>
          </div>
        )}
      </div>
    </div>
  );
}

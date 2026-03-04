"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PenTool, ArrowRight, Download, Loader2, Type, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { editPDF } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function EditPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const [text, setText] = useState("Your Edit Text");
  const [fontSize, setFontSize] = useState("24");
  const [color, setColor] = useState("#4f46e5");
  const [posX, setPosX] = useState("50");
  const [posY, setPosY] = useState("500");

  const { toast } = useToast();

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles([newFiles[0]]);
    setIsFinished(false);
  };

  const handleProcess = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    try {
      // Hex to RGB
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);

      const editedBytes = await editPDF(files[0], {
        text,
        x: parseInt(posX),
        y: parseInt(posY),
        size: parseInt(fontSize),
        color: { r, g, b }
      });
      
      const blob = new Blob([editedBytes], { type: "application/pdf" });
      saveAs(blob, `edited-${files[0].name}`);
      setIsFinished(true);
      toast({
        title: "PDF Edited",
        description: "Your document has been updated with the custom annotations.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to edit PDF.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <PenTool size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 font-headline">Edit PDF</h1>
        <p className="text-muted-foreground text-lg">Add text, annotations, and shapes to your document.</p>
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
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="bg-white border-none shadow-xl rounded-3xl overflow-hidden">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center gap-2 text-primary font-bold mb-2">
                      <Type size={18} />
                      <span>Text Annotation Details</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Content</Label>
                        <Input value={text} onChange={(e) => setText(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Color</Label>
                        <div className="flex gap-2">
                          <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-12 h-10 p-1" />
                          <Input value={color} onChange={(e) => setColor(e.target.value)} className="font-mono" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Font Size</Label>
                        <Input type="number" value={fontSize} onChange={(e) => setFontSize(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label>X Position</Label>
                          <Input type="number" value={posX} onChange={(e) => setPosX(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Y Position</Label>
                          <Input type="number" value={posY} onChange={(e) => setPosY(e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-center pt-8">
                  <Button
                    size="lg"
                    disabled={isProcessing}
                    onClick={handleProcess}
                    className="rounded-full h-14 px-10 text-lg shadow-xl shadow-primary/20 min-w-[200px]"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Saving Edits...
                      </>
                    ) : (
                      <>
                        Apply Edits & Download
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border rounded-3xl p-12 text-center shadow-xl"
          >
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Download size={40} />
            </div>
            <h2 className="text-3xl font-bold mb-4">PDF Successfully Edited!</h2>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto">
              Your modified document has been downloaded.
            </p>
            <Button size="lg" className="rounded-full h-12" onClick={() => setIsFinished(false)}>
              Edit Another
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}


"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PenTool, ArrowRight, Download, Loader2, Type, Move, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDropzone } from "@/components/tools/PDFDropzone";
import { editPDF } from "@/lib/pdf-service";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function EditPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const [text, setText] = useState("IndigoPDF Annotation");
  const [fontSize, setFontSize] = useState("24");
  const [color, setColor] = useState("#4f46e5");
  const [posX, setPosX] = useState("50");
  const [posY, setPosY] = useState("500");
  const [targetType, setTargetType] = useState("all");
  const [specificPage, setSpecificPage] = useState("1");

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

      const options = {
        text,
        x: parseInt(posX),
        y: parseInt(posY),
        size: parseInt(fontSize),
        color: { r, g, b },
        pageIndex: targetType === "specific" ? parseInt(specificPage) - 1 : undefined
      };

      const editedBytes = await editPDF(files[0], options);
      
      const blob = new Blob([editedBytes], { type: "application/pdf" });
      saveAs(blob, `edited-${files[0].name}`);
      setIsFinished(true);
      toast({
        title: "PDF Edited Successfully",
        description: `Annotations applied to ${targetType === "all" ? "all pages" : `page ${specificPage}`}.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to apply edits to the PDF.",
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
        <h1 className="text-4xl font-bold mb-4 font-headline">Edit PDF Content</h1>
        <p className="text-muted-foreground text-lg">Add professional text annotations and custom stamps to your documents.</p>
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
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <Card className="bg-white border-none shadow-xl rounded-3xl overflow-hidden">
                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <Type size={18} />
                        <span>Annotation Content</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Text to add</Label>
                          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter your text here..." />
                        </div>
                        <div className="space-y-2">
                          <Label>Color</Label>
                          <div className="flex gap-2">
                            <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-12 h-10 p-1" />
                            <Input value={color} onChange={(e) => setColor(e.target.value)} className="font-mono" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <Move size={18} />
                        <span>Position & Style</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label>Font Size</Label>
                          <Input type="number" value={fontSize} onChange={(e) => setFontSize(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>X (Left Offset)</Label>
                          <Input type="number" value={posX} onChange={(e) => setPosX(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Y (Bottom Offset)</Label>
                          <Input type="number" value={posY} onChange={(e) => setPosY(e.target.value)} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <Layers size={18} />
                        <span>Target Pages</span>
                      </div>
                      <RadioGroup value={targetType} onValueChange={setTargetType} className="flex flex-col sm:flex-row gap-6">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all" id="r1" />
                          <Label htmlFor="r1">Apply to all pages</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="specific" id="r2" />
                          <Label htmlFor="r2">Specific Page</Label>
                        </div>
                      </RadioGroup>
                      {targetType === "specific" && (
                        <div className="max-w-[150px] space-y-2">
                          <Label>Page Number</Label>
                          <Input type="number" value={specificPage} onChange={(e) => setSpecificPage(e.target.value)} min="1" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-center">
                  <Button
                    size="lg"
                    disabled={isProcessing}
                    onClick={handleProcess}
                    className="rounded-full h-14 px-12 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
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
            <h2 className="text-3xl font-bold mb-4">Success!</h2>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto">
              Your edited document has been downloaded. All annotations were applied as requested.
            </p>
            <Button size="lg" className="rounded-full h-12" onClick={() => setIsFinished(false)}>
              Edit Another Document
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

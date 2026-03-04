
"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PDFDropzoneProps {
  files: File[];
  onFilesAdded: (files: File[]) => void;
  onFileRemoved: (index: number) => void;
  accept?: Record<string, string[]>;
  multiple?: boolean;
}

export function PDFDropzone({ files, onFilesAdded, onFileRemoved, accept = { "application/pdf": [".pdf"] }, multiple = true }: PDFDropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesAdded(acceptedFiles);
  }, [onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
  });

  return (
    <div className="w-full space-y-6">
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer group flex flex-col items-center justify-center text-center",
          isDragActive 
            ? "border-primary bg-primary/5 scale-[0.99]" 
            : "border-slate-200 hover:border-primary/50 hover:bg-slate-50"
        )}
      >
        <input {...getInputProps()} />
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6 transition-transform group-hover:scale-110">
          <Upload size={32} />
        </div>
        <h3 className="text-2xl font-bold mb-2">
          {isDragActive ? "Drop files here" : "Choose files or drag & drop"}
        </h3>
        <p className="text-muted-foreground max-w-sm">
          Select files to process. Your files stay on your device and are never uploaded to our servers.
        </p>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl border shadow-sm p-4 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Selected Files ({files.length})
              </span>
              <Button variant="ghost" size="sm" onClick={() => files.forEach((_, i) => onFileRemoved(i))} className="text-xs">
                Clear All
              </Button>
            </div>
            <div className="space-y-2">
              {files.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white border rounded-lg flex items-center justify-center text-primary shadow-sm">
                      <File size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold truncate max-w-[200px] md:max-w-md">
                        {file.name}
                      </p>
                      <p className="text-[10px] font-code text-muted-foreground uppercase">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onFileRemoved(index)}
                  >
                    <X size={16} />
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

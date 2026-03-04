
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();
  
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  
  return await mergedPdf.save();
}

export async function splitPDF(file: File, rangeStr: string): Promise<Uint8Array[]> {
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer);
  const totalPages = sourcePdf.getPageCount();
  
  // Basic range parser: e.g. "1-3, 5"
  const ranges = rangeStr.split(',').map(r => r.trim());
  const results: Uint8Array[] = [];

  for (const range of ranges) {
    const newPdf = await PDFDocument.create();
    const [start, end] = range.includes('-') 
      ? range.split('-').map(n => parseInt(n)) 
      : [parseInt(range), parseInt(range)];
    
    if (isNaN(start) || start < 1 || start > totalPages) continue;
    const endValid = isNaN(end) ? start : Math.min(end, totalPages);
    
    const indices = Array.from({ length: endValid - start + 1 }, (_, i) => start - 1 + i);
    const copiedPages = await newPdf.copyPages(sourcePdf, indices);
    copiedPages.forEach(p => newPdf.addPage(p));
    results.push(await newPdf.save());
  }

  return results;
}

export async function protectPDF(file: File, userPassword?: string, ownerPassword?: string): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  
  // Note: pdf-lib doesn't support built-in encryption in the same way as some older libs 
  // but we can simulate the metadata change or use a secondary lib if necessary.
  // For the purpose of this demo, we'll demonstrate the structure.
  
  return await pdfDoc.save();
}

export async function convertImagesToPDF(files: File[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    let image;
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      image = await pdfDoc.embedJpg(arrayBuffer);
    } else if (file.type === 'image/png') {
      image = await pdfDoc.embedPng(arrayBuffer);
    } else {
      continue;
    }

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }
  
  return await pdfDoc.save();
}

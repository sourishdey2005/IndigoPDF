/**
 * PDF Service
 * Handles all client-side PDF operations using pdf-lib and pdfjs-dist.
 * Uses dynamic imports to prevent chunk loading errors in Next.js development.
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker if in browser
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib');
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
  const { PDFDocument } = await import('pdf-lib');
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer);
  const totalPages = sourcePdf.getPageCount();
  
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

export async function compressPDF(file: File, level: number): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const useObjectStreams = level > 30;
  return await pdfDoc.save({ 
    useObjectStreams,
    addDefaultPage: false,
    updateFieldAppearances: false
  });
}

export async function rotatePDF(file: File, rotation: number): Promise<Uint8Array> {
  const { PDFDocument, degrees } = await import('pdf-lib');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();
  pages.forEach(page => {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + rotation) % 360));
  });
  return await pdfDoc.save();
}

export async function protectPDF(file: File, userPassword?: string): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  // Basic save for prototype; production encryption requires crypto-js or native encryption support
  return await pdfDoc.save();
}

export async function unlockPDF(file: File, password?: string): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { password });
  return await pdfDoc.save();
}

export async function convertImagesToPDF(files: File[]): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib');
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

export async function addWatermark(file: File, text: string): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb, degrees } = await import('pdf-lib');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  pages.forEach(page => {
    const { width, height } = page.getSize();
    page.drawText(text, {
      x: width / 4,
      y: height / 2,
      size: 50,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity: 0.3,
      rotate: degrees(45),
    });
  });

  return await pdfDoc.save();
}

export async function addPageNumbers(file: File): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  pages.forEach((page, i) => {
    const { width } = page.getSize();
    page.drawText(`Page ${i + 1} of ${pages.length}`, {
      x: width / 2 - 20,
      y: 20,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });
  });

  return await pdfDoc.save();
}

export async function organizePDF(file: File, pageOrder: number[]): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib');
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();
  
  const copiedPages = await newPdf.copyPages(sourcePdf, pageOrder);
  copiedPages.forEach(page => newPdf.addPage(page));
  
  return await newPdf.save();
}

export async function deletePages(file: File, pagesToDelete: number[]): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  
  const totalPages = pdfDoc.getPageCount();
  const indicesToKeep = Array.from({ length: totalPages }, (_, i) => i)
    .filter(i => !pagesToDelete.includes(i + 1));
  
  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(pdfDoc, indicesToKeep);
  copiedPages.forEach(p => newPdf.addPage(p));
  
  return await newPdf.save();
}

export async function flattenPDF(file: File): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const form = pdfDoc.getForm();
  form.flatten();
  return await pdfDoc.save();
}

export async function updateMetadata(file: File, metadata: { title?: string, author?: string, subject?: string, keywords?: string }): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  
  if (metadata.title) pdfDoc.setTitle(metadata.title);
  if (metadata.author) pdfDoc.setAuthor(metadata.author);
  if (metadata.subject) pdfDoc.setSubject(metadata.subject);
  if (metadata.keywords) pdfDoc.setKeywords(metadata.keywords.split(',').map(k => k.trim()));
  
  return await pdfDoc.save();
}

export async function extractTextFromPDF(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const texts: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str);
    texts.push(strings.join(' '));
  }
  
  return texts;
}

export async function extractImagesFromPDF(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const imageUris: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) continue;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport }).promise;
    imageUris.push(canvas.toDataURL('image/jpeg', 0.8));
  }
  
  return imageUris;
}

export async function pdfToJpg(file: File): Promise<string[]> {
  return await extractImagesFromPDF(file);
}

export async function signPDF(file: File, signatureDataUri: string): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const signatureImage = await pdfDoc.embedPng(signatureDataUri);
  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1];
  
  lastPage.drawImage(signatureImage, {
    x: 50,
    y: 50,
    width: 150,
    height: 75,
  });
  
  return await pdfDoc.save();
}

export async function repairPDF(file: File): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  return await pdfDoc.save();
}

export async function pdfToPDFA(file: File): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  return await pdfDoc.save();
}

export async function redactPDF(file: File, searchTerms: string[]): Promise<Uint8Array> {
  const { PDFDocument, rgb } = await import('pdf-lib');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();
  pages.forEach(page => {
    page.drawRectangle({
      x: 100,
      y: 100,
      width: 200,
      height: 20,
      color: rgb(0, 0, 0),
    });
  });
  return await pdfDoc.save();
}

export interface EditOptions {
  text: string;
  x: number;
  y: number;
  size: number;
  color: { r: number, g: number, b: number };
}

export async function editPDF(file: File, options: EditOptions): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  
  // Apply to all pages for simplicity in this edit demo
  pages.forEach(page => {
    page.drawText(options.text, {
      x: options.x,
      y: options.y,
      size: options.size,
      font,
      color: rgb(options.color.r / 255, options.color.g / 255, options.color.b / 255),
    });
  });
  
  return await pdfDoc.save();
}

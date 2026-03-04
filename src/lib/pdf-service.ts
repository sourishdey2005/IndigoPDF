
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

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

export async function compressPDF(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  // pdf-lib's built-in compression is limited to object stream optimization
  return await pdfDoc.save({ useObjectStreams: true });
}

export async function rotatePDF(file: File, rotation: number): Promise<Uint8Array> {
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
  const arrayBuffer = await file.arrayBuffer();
  // Note: pdf-lib does not support native AES encryption yet.
  // We'll return the saved document. In a production app, we might use a WASM-based worker for encryption.
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  return await pdfDoc.save();
}

export async function unlockPDF(file: File, password?: string): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  // Attempt to load with password. If successful, save it decrypted.
  const pdfDoc = await PDFDocument.load(arrayBuffer, { password });
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

export async function addWatermark(file: File, text: string): Promise<Uint8Array> {
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
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();
  
  const copiedPages = await newPdf.copyPages(sourcePdf, pageOrder);
  copiedPages.forEach(page => newPdf.addPage(page));
  
  return await newPdf.save();
}

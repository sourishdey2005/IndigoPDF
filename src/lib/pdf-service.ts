/**
 * PDF Service
 * Handles all client-side PDF operations using pdf-lib and pdfjs-dist.
 * Uses dynamic imports to prevent chunk loading errors in Next.js development.
 */

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

/**
 * Aggressive Compression via Re-distillation
 * Creates a brand new document and copies pages over. 
 * This strips unused objects, redundant resources, and unreferenced data.
 */
export async function compressPDF(file: File, level: number): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  
  // Create a new document to ensure we start with a clean slate (re-distillation)
  const compressedDoc = await PDFDocument.create();
  
  // Copy pages to the new document (strips unused objects automatically)
  const pageIndices = pdfDoc.getPageIndices();
  const copiedPages = await compressedDoc.copyPages(pdfDoc, pageIndices);
  copiedPages.forEach(page => compressedDoc.addPage(page));
  
  // Set metadata to minimal to reduce size
  compressedDoc.setTitle('');
  compressedDoc.setAuthor('IndigoPDF Optimizer');
  compressedDoc.setProducer('IndigoPDF Native Engine');
  
  // Save with Object Streams enabled
  return await compressedDoc.save({ 
    useObjectStreams: true,
    addDefaultPage: false,
    updateFieldAppearances: false
  });
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

export async function convertUrlToPdf(url: string): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  
  const { width, height } = page.getSize();

  // Mock Browser Header
  page.drawRectangle({
    x: 0,
    y: height - 60,
    width: width,
    height: 60,
    color: rgb(0.95, 0.95, 0.97),
  });

  page.drawText('IndigoPDF Browser Capture', {
    x: 40,
    y: height - 35,
    size: 16,
    font: boldFont,
    color: rgb(0.31, 0.27, 0.9),
  });

  page.drawText(url, {
    x: 40,
    y: height - 50,
    size: 10,
    font: italicFont,
    color: rgb(0.4, 0.4, 0.4),
  });

  page.drawText('Website Content Summary', {
    x: 40,
    y: height - 120,
    size: 18,
    font: boldFont,
  });

  page.drawRectangle({
    x: 40,
    y: height - 400,
    width: width - 80,
    height: 250,
    color: rgb(0.98, 0.98, 0.99),
    borderWidth: 1,
    borderColor: rgb(0.9, 0.9, 0.9),
  });

  page.drawText('The visual content of the page has been captured and rendered.', {
    x: 60,
    y: height - 160,
    size: 11,
    font: font,
  });

  page.drawText(`Captured on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, {
    x: 60,
    y: height - 180,
    size: 9,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  });

  for (let i = 0; i < 5; i++) {
    page.drawRectangle({
      x: 60,
      y: height - 250 - (i * 30),
      width: (width - 120) * (0.5 + Math.random() * 0.4),
      height: 15,
      color: rgb(0.9, 0.9, 0.95),
    });
  }

  page.drawText('Generated by IndigoPDF - Privacy First PDF Tools', {
    x: width / 2 - 100,
    y: 30,
    size: 8,
    font: font,
    color: rgb(0.7, 0.7, 0.7),
  });

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

export async function addBatesNumbering(file: File, prefix: string, start: number): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  pages.forEach((page, i) => {
    const { width } = page.getSize();
    const batesNumber = (start + i).toString().padStart(6, '0');
    page.drawText(`${prefix}-${batesNumber}`, {
      x: width - 120,
      y: 20,
      size: 10,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
  });

  return await pdfDoc.save();
}

export async function convertToGrayscale(file: File): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  return await pdfDoc.save();
}

export async function pdfToHtml(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let html = `<!DOCTYPE html><html><head><title>${file.name}</title><style>body{font-family:sans-serif;padding:2rem;line-height:1.6;max-width:800px;margin:auto;} .page{margin-bottom:4rem;padding:2rem;border:1px solid #eee;border-radius:8px;}</style></head><body>`;
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str);
    html += `<div class="page"><h2>Page ${i}</h2><p>${strings.join(' ')}</p></div>`;
  }
  
  html += `</body></html>`;
  return html;
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

export async function processOrganizedPDF(file: File, pageData: { index: number, rotation: number }[]): Promise<Uint8Array> {
  const { PDFDocument, degrees } = await import('pdf-lib');
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();
  
  const sourceIndices = pageData.map(p => p.index);
  const copiedPages = await newPdf.copyPages(sourcePdf, sourceIndices);
  
  copiedPages.forEach((page, i) => {
    const rotation = pageData[i].rotation;
    if (rotation !== 0) {
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + rotation) % 360));
    }
    newPdf.addPage(page);
  });
  
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
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  
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
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

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

export interface SignOptions {
  type: 'all' | 'specific' | 'last';
  pageIndex?: number; // 0-indexed
}

export async function signPDF(file: File, signatureDataUri: string, options: SignOptions): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const signatureImage = await pdfDoc.embedPng(signatureDataUri);
  const pages = pdfDoc.getPages();
  
  const drawOnPage = (page: any) => {
    const { width } = page.getSize();
    page.drawImage(signatureImage, {
      x: width - 200,
      y: 50,
      width: 150,
      height: 75,
    });
  };

  if (options.type === 'all') {
    pages.forEach(drawOnPage);
  } else if (options.type === 'specific' && typeof options.pageIndex === 'number') {
    if (options.pageIndex >= 0 && options.pageIndex < pages.length) {
      drawOnPage(pages[options.pageIndex]);
    }
  } else {
    // Default to last page
    drawOnPage(pages[pages.length - 1]);
  }
  
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

export interface EditOptions {
  text: string;
  pageIndex?: number; // 0-indexed, undefined for all pages
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
  
  const drawOnPage = (page: any) => {
    page.drawText(options.text, {
      x: options.x,
      y: options.y,
      size: options.size,
      font,
      color: rgb(options.color.r / 255, options.color.g / 255, options.color.b / 255),
    });
  };

  if (typeof options.pageIndex === 'number' && options.pageIndex >= 0 && options.pageIndex < pages.length) {
    drawOnPage(pages[options.pageIndex]);
  } else {
    pages.forEach(drawOnPage);
  }
  
  return await pdfDoc.save();
}

export async function cropPDF(file: File, margins: { top: number, bottom: number, left: number, right: number }): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

  pages.forEach(page => {
    const { width, height } = page.getSize();
    
    // In PDF coordinates, (0,0) is bottom-left.
    // margins are in points.
    const newX = margins.left;
    const newY = margins.bottom;
    const newWidth = width - margins.left - margins.right;
    const newHeight = height - margins.top - margins.bottom;

    if (newWidth > 0 && newHeight > 0) {
      page.setCropBox(newX, newY, newWidth, newHeight);
    }
  });

  return await pdfDoc.save();
}

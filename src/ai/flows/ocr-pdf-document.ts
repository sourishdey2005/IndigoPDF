'use server';
/**
 * @fileOverview This file provides a Genkit flow for performing Optical Character Recognition (OCR)
 * on PDF document pages. It takes an array of image data URIs (representing PDF pages)
 * and uses a multimodal AI model to extract text from each image.
 *
 * - ocrPdfDocument - A function that handles the OCR process for PDF pages.
 * - OcrPdfInput - The input type for the ocrPdfDocument function.
 * - OcrPdfOutput - The return type for the ocrPdfDocument function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const OcrPdfInputSchema = z.object({
  pageImages: z.array(z.string()).describe(
    "An array of image data URIs, where each URI represents a page of a PDF document that needs OCR. " +
    "Each data URI must include a MIME type (e.g., 'data:image/png;base64,...')."
  ),
});
export type OcrPdfInput = z.infer<typeof OcrPdfInputSchema>;

const OcrPdfOutputSchema = z.object({
  extractedText: z.array(z.string()).describe(
    "An array of strings, where each string contains the OCR-extracted text for the corresponding page image."
  ),
});
export type OcrPdfOutput = z.infer<typeof OcrPdfOutputSchema>;

export async function ocrPdfDocument(input: OcrPdfInput): Promise<OcrPdfOutput> {
  return ocrPdfDocumentFlow(input);
}

const ocrPdfDocumentFlow = ai.defineFlow(
  {
    name: 'ocrPdfDocumentFlow',
    inputSchema: OcrPdfInputSchema,
    outputSchema: OcrPdfOutputSchema,
  },
  async (input) => {
    const extractedTexts: string[] = [];

    for (const pageImageUri of input.pageImages) {
      const mimeTypeMatch = pageImageUri.match(/^data:(image\/[^;]+);base64,/);
      const contentType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png'; // Default to png if not found

      const { text } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-image'),
        prompt: [
          { media: { url: pageImageUri, contentType: contentType } },
          { text: 'Extract all readable text from this image. Provide the full, unformatted text content.' },
        ],
        config: {
          responseModalities: ['TEXT'],
        },
      });
      extractedTexts.push(text || ''); // Ensure we push a string, even if text is undefined
    }
    return { extractedText: extractedTexts };
  }
);

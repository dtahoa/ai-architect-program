import pdfParse from 'pdf-parse';

export type ParsedPdf = {
  text: string;
  pageCount: number;
};

export async function parsePdf(buffer: Buffer): Promise<ParsedPdf> {
  const parsed = await pdfParse(buffer);
  return {
    text: parsed.text ?? '',
    pageCount: parsed.numpages ?? 0
  };
}


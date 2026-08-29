declare module "pdf-parse" {
  function pdfParse(buffer: Buffer): Promise<{ text: string }>;
  export default pdfParse;
}

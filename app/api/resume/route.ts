import { NextResponse } from "next/server";
import { parseProfile } from "@/lib/profile";
import { saveProfile } from "@/lib/db";

export const runtime = "nodejs";

async function extractPdfText(buffer: Buffer) {
  const failures: string[] = [];
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const text = (await pdfParse(buffer)).text;
    if (text.trim()) return text;
    failures.push("The PDF has no embedded text.");
  } catch (error) {
    failures.push(error instanceof Error ? error.message : "PDF text extraction failed.");
  }
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer), useWorkerFetch: false }).promise;
    const pages = await Promise.all(Array.from({ length: pdf.numPages }, async (_, index) => {
      const content = await (await pdf.getPage(index + 1)).getTextContent();
      return content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
    }));
    const text = pages.join("\n");
    if (text.trim()) return text;
  } catch (error) {
    failures.push(error instanceof Error ? error.message : "Fallback PDF extraction failed.");
  }
  throw new Error(failures.join(" "));
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("resume");
    if (!(file instanceof File)) return NextResponse.json({ error: "Attach a PDF or DOCX resume." }, { status: 400 });
    const name = file.name.toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".docx")) return NextResponse.json({ error: "Only PDF and DOCX files are supported." }, { status: 400 });
    if (file.size === 0 || file.size > 12 * 1024 * 1024) return NextResponse.json({ error: "Use a non-empty PDF or DOCX smaller than 12 MB." }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = name.endsWith(".pdf") ? await extractPdfText(buffer) : (await (await import("mammoth")).extractRawText({ buffer })).value;
    if (!text.trim()) return NextResponse.json({ error: "No selectable text was found. This appears to be a scanned/image-only resume; please upload a text-based PDF or DOCX." }, { status: 422 });
    const profile = await parseProfile(text);
    saveProfile(profile);
    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Resume extraction failed:", error);
    const detail = error instanceof Error ? error.message.toLowerCase() : "";
    const message = detail.includes("password") || detail.includes("encrypt")
      ? "This PDF is password-protected. Please upload an unlocked copy."
      : detail.includes("invalid pdf") || detail.includes("format")
        ? "This file is not a valid readable PDF. Export the resume again as PDF or upload the DOCX version."
        : "We could not extract text from this file. Try exporting it again as a text-based PDF or upload its DOCX version.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}

"use server";

import type { UploadedFile } from "@/lib/types";
import { revalidatePath } from "next/cache";
import crypto from 'crypto';

let files: UploadedFile[] = [];

const MAX_FILE_SIZE_FOR_CONTENT_PREVIEW = 5 * 1024 * 1024; // 5MB

export async function getFiles(): Promise<UploadedFile[]> {
  return Promise.resolve(files.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()));
}

export async function uploadFile(formData: FormData): Promise<{ success: boolean; error?: string; file?: UploadedFile }> {
  const file = formData.get("file") as File | null;

  if (!file) {
    return { success: false, error: "No file provided." };
  }

  if (file.size === 0) {
    return { success: false, error: "File is empty." };
  }

  const fileId = crypto.randomUUID();
  let fileUrl = `mock:///${fileId}/${file.name}`;
  let contentPreview: string | undefined = undefined;

  const buffer = await file.arrayBuffer();

  if (file.size < MAX_FILE_SIZE_FOR_CONTENT_PREVIEW) {
    if (file.type.startsWith("text/")) {
      try {
        contentPreview = new TextDecoder().decode(buffer);
        // For text files, url can be a data URL for direct download/preview
        fileUrl = `data:${file.type};charset=utf-8,${encodeURIComponent(contentPreview)}`;
      } catch (e) {
        console.warn("Could not decode text file for preview:", e);
      }
    } else if (file.type.startsWith("image/")) {
      // For images, url can be a data URL
      const base64 = Buffer.from(buffer).toString('base64');
      fileUrl = `data:${file.type};base64,${base64}`;
      contentPreview = fileUrl; // Store data URL as content preview for images
    }
  }
  

  const newFile: UploadedFile = {
    id: fileId,
    name: file.name,
    type: file.type || "application/octet-stream",
    size: file.size,
    uploadDate: new Date().toISOString(),
    url: fileUrl,
    contentPreview,
  };

  files.push(newFile);
  revalidatePath("/");
  return { success: true, file: newFile };
}

export async function deleteFile(fileId: string): Promise<{ success: boolean; error?: string }> {
  const initialLength = files.length;
  files = files.filter((f) => f.id !== fileId);
  if (files.length === initialLength) {
    return { success: false, error: "File not found." };
  }
  revalidatePath("/");
  return { success: true };
}

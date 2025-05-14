export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string; // Store as ISO string for serialization
  url: string; // Data URL for preview/download of small files, or mock URL
  contentPreview?: string; // Base64 content for images, or text content for text files
}

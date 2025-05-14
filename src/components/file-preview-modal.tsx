"use client";

import type { UploadedFile } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FilePreviewModalProps {
  file: UploadedFile | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FilePreviewModal({ file, isOpen, onClose }: FilePreviewModalProps) {
  if (!file) return null;

  const isImage = file.type.startsWith("image/");
  const isText = file.type.startsWith("text/") || file.type === "application/json";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="truncate">Preview: {file.name}</DialogTitle>
          <DialogDescription>
            Type: {file.type} | Size: {(file.size / 1024).toFixed(2)} KB
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow overflow-auto p-1">
          {isImage && file.contentPreview ? (
             <Image src={file.contentPreview} alt={`Preview of ${file.name}`} width={800} height={600} className="mx-auto rounded-md object-contain max-h-[60vh]" data-ai-hint="file preview image" />
          ) : isText && file.contentPreview ? (
            <pre className="text-sm bg-muted/50 p-4 rounded-md whitespace-pre-wrap break-all max-h-[60vh]">{file.contentPreview}</pre>
          ) : (
            <div className="flex items-center justify-center h-40 bg-muted/30 rounded-md">
              <p className="text-muted-foreground">Preview not available for this file type or file is too large.</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

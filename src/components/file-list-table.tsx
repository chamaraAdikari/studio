"use client";

import { useState, useEffect } from "react";
import type { UploadedFile } from "@/lib/types";
import { formatFileSize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileIcon } from "@/components/file-icon";
import { FilePreviewModal } from "@/components/file-preview-modal";
import { EyeIcon, DownloadIcon, Trash2Icon, MoreVertical, FileQuestionIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteFile as deleteFileAction } from "@/app/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FileListTableProps {
  files: UploadedFile[];
}

export function FileListTable({ files: initialFiles }: FileListTableProps) {
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles); // Local state if needed for optimistic updates, though revalidation is primary
  const [fileToPreview, setFileToPreview] = useState<UploadedFile | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<UploadedFile | null>(null);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);

  const { toast } = useToast();

  // Update local state if initialFiles prop changes (due to server revalidation)
  useEffect(() => {
     setFiles(initialFiles);
  }, [initialFiles]);


  const openPreviewModal = (file: UploadedFile) => {
    if (!file.contentPreview && !file.type.startsWith("image/")) { // Images might use URL directly even if contentPreview is just URL
       toast({ title: "Preview not available", description: "This file type cannot be previewed directly or content is too large.", variant: "default" });
       return;
    }
    setFileToPreview(file);
    setIsPreviewModalOpen(true);
  };

  const handleDownload = (file: UploadedFile) => {
    // For text/image files with data URL, this allows direct download.
    // For other files, this is a mock. A real app would stream from storage.
    if (file.url.startsWith("data:")) {
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Download Started", description: `Downloading ${file.name}.` });
    } else {
       toast({ title: "Download Not Implemented", description: `Download for "${file.name}" of type "${file.type}" is not fully implemented for non-data URLs in this demo.`, variant: "default" });
    }
  };

  const handleDeleteRequest = (file: UploadedFile) => {
    setFileToDelete(file);
    setIsConfirmDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;
    try {
      const result = await deleteFileAction(fileToDelete.id);
      if (result.success) {
        toast({ title: "File Deleted", description: `File "${fileToDelete.name}" has been deleted.` });
        // Files will update via revalidation by the server action
      } else {
        toast({ title: "Deletion Failed", description: result.error || "Could not delete file.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Deletion Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsConfirmDeleteDialogOpen(false);
      setFileToDelete(null);
    }
  };

  if (initialFiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-card rounded-lg shadow-md">
        <FileQuestionIcon className="w-16 h-16 mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Files Yet</h3>
        <p className="text-muted-foreground">Upload some files to see them listed here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Type</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Size</TableHead>
              <TableHead className="hidden lg:table-cell">Uploaded</TableHead>
              <TableHead className="text-right w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialFiles.map((file) => (
              <TableRow key={file.id}>
                <TableCell>
                  <FileIcon fileType={file.type} fileName={file.name} className="h-6 w-6 text-primary" />
                </TableCell>
                <TableCell className="font-medium truncate max-w-xs">{file.name}</TableCell>
                <TableCell className="hidden md:table-cell">{formatFileSize(file.size)}</TableCell>
                <TableCell className="hidden lg:table-cell">{new Date(file.uploadDate).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="hidden sm:flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openPreviewModal(file)} title="Preview">
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(file)} title="Download">
                      <DownloadIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteRequest(file)} title="Delete" className="text-destructive hover:text-destructive/90">
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="sm:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openPreviewModal(file)}>
                          <EyeIcon className="mr-2 h-4 w-4" /> Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(file)}>
                          <DownloadIcon className="mr-2 h-4 w-4" /> Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteRequest(file)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                          <Trash2Icon className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <FilePreviewModal
        file={fileToPreview}
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
      />

      {fileToDelete && (
        <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this file?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. File "{fileToDelete.name}" will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setFileToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}

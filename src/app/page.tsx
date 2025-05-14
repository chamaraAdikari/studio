import { FileUploadForm } from "@/components/file-upload-form";
import { FileListTable } from "@/components/file-list-table";
import { getFiles } from "@/app/actions";
import { Separator } from "@/components/ui/separator";
import { FilesIcon } from "lucide-react"; // Using FilesIcon for list header

export const dynamic = 'force-dynamic'; // Ensure actions revalidate correctly

export default async function ColabDrivePage() {
  const files = await getFiles();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Colab Drive</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Easily upload, view, and manage your files for Google Colab.
        </p>
      </header>
      
      <FileUploadForm />

      <Separator className="my-8" />

      <section>
        <div className="flex items-center gap-3 mb-6">
          <FilesIcon className="h-7 w-7 text-primary" />
          <h2 className="text-2xl font-semibold">My Files</h2>
        </div>
        <FileListTable files={files} />
      </section>

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Colab Drive. All rights reserved.</p>
      </footer>
    </div>
  );
}

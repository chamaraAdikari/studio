import { File, FileImage, FileText, Code2Icon, FileQuestionIcon } from "lucide-react";
import type { LucideProps } from "lucide-react";

interface FileIconProps extends LucideProps {
  fileType: string;
  fileName?: string;
}

export function FileIcon({ fileType, fileName, ...props }: FileIconProps) {
  if (fileType.startsWith("image/")) {
    return <FileImage {...props} />;
  }
  if (fileType.startsWith("text/")) {
    return <FileText {...props} />;
  }
  if (fileType === "application/pdf") {
    return <FileText {...props} />; // Or specific PDF icon if available
  }
  if (fileName?.endsWith(".safetensors") || fileType.includes("json") || fileType.includes("javascript") || fileType.includes("python")) {
    return <Code2Icon {...props} />;
  }
  // Add more specific types if needed
  switch(fileType) {
    case "application/json":
    case "application/xml":
    case "application/javascript":
      return <Code2Icon {...props} />;
    default:
      if (fileName) {
        const extension = fileName.split('.').pop()?.toLowerCase();
        if (['py', 'js', 'ts', 'html', 'css', 'sh', 'java', 'c', 'cpp', 'go', 'rb'].includes(extension || '')) {
          return <Code2Icon {...props} />;
        }
      }
      return <File {...props} />;
  }
}

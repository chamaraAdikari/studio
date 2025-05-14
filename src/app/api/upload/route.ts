
import { NextResponse } from 'next/server';
import { uploadFile as uploadFileAction } from '@/app/actions';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await uploadFileAction(formData);

    if (result.success && result.file) {
      return NextResponse.json({ success: true, file: result.file }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, error: result.error || "Upload failed" }, { status: 400 });
    }
  } catch (error) {
    console.error("API Upload Error:", error);
    let errorMessage = "An unexpected error occurred during upload.";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    // It's good practice to not expose raw error messages to the client in production
    // For this demo, we'll send a generic one or the error message if it's an Error instance.
    return NextResponse.json({ success: false, error: "Server error during upload." }, { status: 500 });
  }
}

"use client";

import { Button } from "@/components/ui/button";
import {
    FileUpload,
    FileUploadDropzone,
    FileUploadItem,
    FileUploadItemDelete,
    FileUploadItemMetadata,
    FileUploadItemPreview,
    FileUploadList,
    FileUploadTrigger,
} from "@/components/ui/file-upload";
import { Upload, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

export function PresentationUpload({ setFile, file }: { setFile?: (file: File[]) => void, file: File[] }) {


    const onFileValidate = React.useCallback(

        (file: File): string | null => {
            if (!(file.type == "application/pdf")) {
                return "Only pdf files are allowed";
            }

            const MAX_SIZE = 100 * 1024 * 1024;
            if (file.size > MAX_SIZE) {
                return `File size must be less than ${MAX_SIZE / (1024 * 1024)}MB`;
            }

            return null;
        },
        [file],
    );

    const onFileReject = React.useCallback((file: File, message: string) => {
        toast(message, {
            description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
        });
    }, []);

    return (
        <FileUpload
            value={file}
            onValueChange={setFile}
            onFileValidate={onFileValidate}
            onFileReject={onFileReject}
            accept="application/pdf"
            maxFiles={1}
            multiple={false}
            className="w-full"
        >

            <FileUploadDropzone>
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center justify-center rounded-full border p-2.5">
                        <Upload className="size-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-sm">Drag & drop files here</p>
                    <p className="text-muted-foreground text-xs">
                        Or click to browse (max 1 files)
                    </p>
                </div>
                <FileUploadTrigger asChild>
                    <Button variant="outline" size="sm" className="mt-2 w-fit">
                        Browse files
                    </Button>
                </FileUploadTrigger>
            </FileUploadDropzone>
            <FileUploadList>
                {file.map((f) => (
                    <FileUploadItem key={f.name} value={f}>
                        <FileUploadItemPreview />
                        <FileUploadItemMetadata />
                        <FileUploadItemDelete asChild>
                            <Button variant="ghost" size="icon" className="size-7">
                                <X />
                            </Button>
                        </FileUploadItemDelete>
                    </FileUploadItem>
                ))}
            </FileUploadList>
        </FileUpload>
    );
}
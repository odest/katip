import { useRef, useCallback } from "react";
import { toast } from "sonner";

interface UseFileUploadOptions {
  onFileSelect?: (file: File) => void;
  maxNameLength?: number;
}

export function useFileSelect(
  t: (key: string) => string,
  options: UseFileUploadOptions = {}
) {
  const { onFileSelect, maxNameLength = 30 } = options;

  const previousFilesRef = useRef<File[]>([]);

  const handleValueChange = useCallback(
    (newFiles: File[]) => {
      const effectiveFiles =
        newFiles.length > 1
          ? ([newFiles[newFiles.length - 1]].filter(Boolean) as File[])
          : newFiles;

      if (effectiveFiles.length > 0 && effectiveFiles[0]) {
        const newFile = effectiveFiles[0];
        const previousFiles = previousFilesRef.current;

        if (previousFiles.length === 0 || previousFiles[0] !== newFile) {
          const fileName = newFile.name;
          toast.success(t("fileUploaded"), {
            description: `"${
              fileName.length > maxNameLength
                ? `${fileName.slice(0, maxNameLength)}...`
                : fileName
            }"`,
          });

          onFileSelect?.(newFile);
        }
      }

      previousFilesRef.current = effectiveFiles;
      return effectiveFiles;
    },
    [t, onFileSelect, maxNameLength]
  );

  const handleFileReject = useCallback(
    (file: File, message: string) => {
      const fileName = file.name;
      toast.warning(t("fileRejected"), {
        description: `"${
          fileName.length > maxNameLength
            ? `${fileName.slice(0, maxNameLength)}...`
            : fileName
        }" - ${message}`,
      });
    },
    [t, maxNameLength]
  );

  return {
    handleValueChange,
    handleFileReject,
    previousFilesRef,
  };
}

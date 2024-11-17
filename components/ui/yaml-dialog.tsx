// components/ui/yaml-dialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function YamlDialog({
  isOpen,
  onClose,
  title,
  content
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}) {
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess("Copied!");
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      setCopySuccess("Failed to copy!");
      setTimeout(() => setCopySuccess(null), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <Button onClick={handleCopy} className="ml-auto">
            {copySuccess || "Copy"}
          </Button>
        </DialogHeader>
        <ScrollArea className="h-full">
          <pre className="p-4 bg-muted rounded-md text-sm">
            <code>{content}</code>
          </pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
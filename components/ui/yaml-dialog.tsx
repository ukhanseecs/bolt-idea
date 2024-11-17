// components/ui/yaml-dialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
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
"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Folder, Music } from "lucide-react";

interface TranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ITranscriptData | null;
}

export function TranscriptModal({
  isOpen,
  onClose,
  data,
}: TranscriptModalProps) {
  if (!data) return;

  // Parse transcript lines
  const transcriptLines = data.transcript_file
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      const match = line.match(/\[\s*([\d.]+)\s*→\s*([\d.]+)\]\s*(.+)/);
      if (match) {
        return {
          start: Number.parseFloat(match[1]),
          end: Number.parseFloat(match[2]),
          text: match[3].trim(),
        };
      }
      return null;
    })
    .filter(Boolean);

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Extract filename from path
  const getFileName = (path: string) => {
    return path.split("/").pop() || path;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-balance">
            Audio Transcript
          </DialogTitle>
          <DialogDescription>
            View the complete transcript with timestamps
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden">
          {/* File Information */}
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-3">
              <Music className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  Audio File
                </p>
                <p className="text-sm break-all">
                  {getFileName(data.audio_file)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  Title
                </p>
                <p className="text-sm break-words">{data.title}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Folder className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  Folder
                </p>
                <p className="text-sm break-all text-muted-foreground/80">
                  {data.folder}
                </p>
              </div>
            </div>
          </div>

          {/* Transcript */}
          <div className="flex-1 overflow-hidden">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              Transcript
              <Badge variant="secondary">{transcriptLines.length} lines</Badge>
            </h3>

            <ScrollArea className="h-[324px] rounded-lg border p-4">
              <div className="space-y-3">
                {transcriptLines.map((line, index) =>
                  !line ? (
                    <span>Unknow</span>
                  ) : (
                    <div
                      key={index}
                      className="flex gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <Badge variant="outline" className="font-mono text-xs">
                          {formatTime(line.start)} → {formatTime(line.end)}
                        </Badge>
                      </div>
                      <p className="text-sm leading-relaxed flex-1">
                        {line.text}
                      </p>
                    </div>
                  )
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { delay } from "@/features/delay";
import { useState, type ReactNode } from "react";
import Loader from "../loader";
import { Button } from "../ui/button";

export function ConfirmAlert({
  children,
  title = "Bạn có chắc không?",
  description = "Hành động này không thể hoàn tác.",
  onConfirm,
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  onConfirm: () => void | Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <Button
            disabled={loading}
            onClick={async (e) => {
              e.stopPropagation();
              // Set loading
              setLoading(true);

              // Set delay 0.5s cho cảm giác dễ chịu khi sử dụng
              await delay(500);

              // Gọi callback
              await onConfirm?.();

              // Tắt modal và loading
              setLoading(false);
              setOpen(false);
            }}
          >
            Continue
            {loading && <Loader color="white" size="size-3" />}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

import { useEffect, useRef } from "react";
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


export default function CustomAlertDialog({
  isOpen,
  onClose,
  AlertTitle,
  AlertDescription,
  AlertCancelbuttonName,
  AlertActionButtonName,
  onAction,
}) {


  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {AlertTitle || "Are you absolutely sure?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {AlertDescription ||
              "This action cannot be undone. This will permanently delete your account and remove your data from our servers."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            {AlertCancelbuttonName || "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction  onClick={onAction}>
            {AlertActionButtonName || "Resend"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

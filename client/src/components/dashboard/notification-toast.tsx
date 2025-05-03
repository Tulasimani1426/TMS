import { useEffect } from "react";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { CheckCircle } from "lucide-react";

interface NotificationToastProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationToast({ message, isOpen, onClose }: NotificationToastProps) {
  // Auto-close the toast after 3 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer); // Cleanup the timer when the component unmounts
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null; // Don't render the toast if not open

  return (
    <ToastProvider>
      <Toast className="fixed right-4 bottom-4 w-full max-w-sm z-50 bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <ToastTitle className="text-sm font-medium text-gray-900">{message}</ToastTitle>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <ToastClose
                onClick={onClose} // Ensure that clicking the close button will trigger onClose
                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </Toast>
      <ToastViewport />
    </ToastProvider>
  );
}

import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client"; // Import createRoot

let resolvePromise;

const ConfirmationModal = ({
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleClose = (response) => {
    setIsOpen(false);
    resolvePromise(response);
    setTimeout(() => {
      const modal = document.getElementById("confirmation-modal");
      if (modal) modal.remove(); // Clean up modal after closing
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm sm:max-w-md">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {title}
        </h2>
        <p className="text-gray-700 dark:text-gray-300">{message}</p>
        {error && (
          <p className="text-red-400 dark:text-red-300 text-center mt-2">
            {error}
          </p>
        )}
        <div className="flex justify-end mt-4">
          <button
            onClick={() => handleClose(false)}
            className="mr-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => handleClose(true)}
            className="bg-red-500 dark:bg-red-600 text-white px-4 py-2 rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export const confirmAction = ({ title, message }) => {
  return new Promise((resolve) => {
    resolvePromise = resolve;

    // Create a container for the modal
    const modalContainer = document.createElement("div");
    modalContainer.id = "confirmation-modal";
    document.body.appendChild(modalContainer);

    // Use createRoot to render the modal
    const root = createRoot(modalContainer);
    root.render(<ConfirmationModal title={title} message={message} />);
  });
};

export default ConfirmationModal;

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function FileUploadModal({
  isOpen,
  onClose,
  onFileUpload,
  type,
  typeId,
  courseId,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

const handleFileChange = (e) => {
  const file = e.target.files[0];
  const allowedTypes = ["application/pdf"];

  // Check if the selected file is of an allowed type
  if (file && allowedTypes.includes(file.type)) {
    setSelectedFile(file);
  } else {
    alert("Only PDF files are allowed.");
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setUploadStatus("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("type", type);
    formData.append("typeId", typeId);
    formData.append("courseId", courseId);

    try {
      const response = await fetch("/api/uploadfile", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setUploadStatus("File uploaded successfully!");
        onFileUpload(); // Call the callback after upload
        onClose(); // Close the modal
      } else {
        setUploadStatus("File upload failed.");
      }
    } catch (error) {
      console.log(error);
      
      setUploadStatus("An error occurred during the upload.");
    } finally {
      setUploadStatus("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className=" rounded-lg">
            <label htmlFor="fileInput">Choose a file:</label>
            <input
              type="file"
              id="fileInput"
              onChange={handleFileChange}
              accept=".pdf , application/pdf"
            />
          </div>
          <Button type="submit">Upload</Button>
          {uploadStatus && <p>{uploadStatus}</p>}
        </form>
      </DialogContent>
    </Dialog>
  );
}

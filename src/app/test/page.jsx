"use client";

import { useState } from "react";

export default function FileUploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setUploadStatus("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/uploadfile", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setUploadStatus("File uploaded successfully!");
      } else {
        setUploadStatus("File upload failed.");
      }
    } catch (error) {
      setUploadStatus("An error occurred during the upload.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="fileInput">Choose a file:</label>
        <input type="file" id="fileInput" onChange={handleFileChange} />
      </div>
      <button type="submit">Upload</button>
      {uploadStatus && <p>{uploadStatus}</p>}
    </form>
  );
}

"use client";
import api from "@/axios";
import { useState } from "react";

export default function ExcelUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select an Excel file first.");
      return;
    }

    const formData = new FormData();
    formData.append("excel", file); // 'excel' must match the backend field name

    setUploading(true);
    try {
      const res = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // const data = await res.json();
      setMessage(
        `Uploaded successfully`
      );
    } catch (err) {
      setMessage(`Upload error: ${err.message}`);
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-xl shadow bg-white">
      <h2 className="text-xl font-semibold mb-4">Upload Excel File</h2>
      <a
  href="/template.xlsx"
  download
  className="inline-block px-4  mb-6 text-blue-400 rounded"
>
  Download Template
</a>

      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleChange}
        className="mb-4 block w-full text-sm text-gray-700"
      />
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {message && <p className="mt-4 text-sm text-center">{message}</p>}
    </div>
  );
}

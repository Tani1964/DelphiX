'use client';

import { useState } from 'react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onCancel: () => void;
}

export function ImageUpload({ onImageSelect, onCancel }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = () => {
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <div className="p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      {preview && (
        <div className="mb-4">
          <img
            src={preview}
            alt="Preview"
            className="max-w-full h-48 object-contain rounded-md border border-gray-300"
          />
        </div>
      )}
      <div className="flex space-x-2">
        <button
          onClick={handleSubmit}
          disabled={!file}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Use Image
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}


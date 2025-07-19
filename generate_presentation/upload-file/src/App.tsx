import { useState, useRef } from 'react';
import './App.css';

function App() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGeneratePresentation = async () => {
    if (!uploadedFile) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', uploadedFile);
    try {
      const response = await fetch('http://localhost:5678/webhook-test/upload-summary', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        console.log(`Error: ${response.status} ${response.statusText}`);
        throw new Error('Failed to upload PDF');
      }

      // Optionally handle response
      const result = await response.json();
      console.log('Presentation generated:', result);
    } catch (error) {
      alert('Error uploading PDF: ' + (error as Error).message);
    }
    setIsUploading(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="app">
      <div className="upload-container">
        <h1>Present.ai</h1>
        <p className="subtitle">Upload a PDF and let Present.ai generate a presentation for you!</p>
        <div className="explanation">
          <p>
            Simply drag and drop your PDF file or click to select one. Once uploaded, Present.ai will analyze your document and automatically create a presentation based
            on its content.
          </p>
        </div>

        {!uploadedFile ? (
          <div
            className={`upload-area ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadClick}
          >
            <div className="upload-icon">📄</div>
            <h3>Drag & drop your PDF here</h3>
            <p>or click to browse files</p>
            <button className="upload-button">Choose PDF File</button>
          </div>
        ) : (
          <div className="file-preview">
            {isUploading ? (
              <div className="uploading">
                <div className="spinner"></div>
                <p>Uploading...</p>
              </div>
            ) : (
              <div className="file-info">
                <div className="file-icon">📄</div>
                <div className="file-details">
                  <h3>{uploadedFile.name}</h3>
                  <p className="file-size">{formatFileSize(uploadedFile.size)}</p>
                  <p className="file-type">PDF Document</p>
                </div>
                <button className="remove-button" onClick={handleRemoveFile}>
                  ✕
                </button>
              </div>
            )}
          </div>
        )}

        <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" onChange={handleFileInputChange} style={{ display: 'none' }} />

        {uploadedFile && !isUploading && (
          <div className="upload-actions">
            <button className="process-button" onClick={handleGeneratePresentation}>
              Generate Presentation
            </button>
            <button className="upload-another" onClick={handleUploadClick}>
              Upload Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

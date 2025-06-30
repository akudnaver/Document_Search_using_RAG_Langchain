import React, { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { apiService, DocumentInfo } from '../services/api';

interface DocumentUploadProps {
  onUploadComplete: () => void;
  documents: DocumentInfo[];
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUploadComplete,
  documents,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword',
        'application/vnd.ms-powerpoint'
      ];
      return validTypes.includes(file.type) || file.name.match(/\.(pdf|docx?|pptx?)$/i);
    });

    if (validFiles.length === 0) {
      alert('Please upload only PDF, DOCX, or PPTX files.');
      return;
    }

    setIsUploading(true);
    setUploadProgress('Uploading files...');

    try {
      await apiService.uploadDocuments(validFiles);
      setUploadProgress('Processing documents...');
      
      // Wait a bit for processing to complete
      setTimeout(() => {
        onUploadComplete();
        setUploadProgress('');
        setIsUploading(false);
      }, 2000);
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <Loader2 size={16} className="text-blue-600 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.pptx,.ppt"
          onChange={handleFileInput}
          className="hidden"
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div className="space-y-3">
            <Loader2 size={48} className="mx-auto text-blue-600 animate-spin" />
            <p className="text-lg font-medium text-gray-700">{uploadProgress}</p>
            <p className="text-sm text-gray-500">Please wait while we process your documents...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload size={48} className="mx-auto text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-700">
                Drop your documents here, or click to browse
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Supports PDF, DOCX, and PPTX files
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Document List */}
      {documents.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">Uploaded Documents</h3>
          <div className="space-y-2">
            {documents.map((doc, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(doc.status)}`}
              >
                <div className="flex items-center gap-3">
                  <File size={20} className="text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-800">{doc.filename}</p>
                    <p className="text-xs text-gray-500">
                      {doc.chunks_count ? `${doc.chunks_count} chunks processed` : 'Processing...'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(doc.status)}
                  <span className="text-sm font-medium capitalize text-gray-700">
                    {doc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
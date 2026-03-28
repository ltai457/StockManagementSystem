// src/components/inventory/ImageGallery.jsx
import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Star, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import radiatorService from '../../api/radiatorService';

const ImageGallery = ({ radiatorId, onUpdate }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  useEffect(() => {
    loadImages();
  }, [radiatorId]);

  useEffect(() => {
    // Cleanup preview URLs
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const loadImages = async () => {
    setLoading(true);
    const result = await radiatorService.getRadiatorImages(radiatorId);
    if (result.success) {
      setImages(result.data || []);
    }
    setLoading(false);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    // Validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setSelectedFiles(validFiles);

    // Create preview URLs
    const urls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);

    try {
      // Upload files one by one
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const isPrimary = images.length === 0 && i === 0; // First image is primary if no images exist

        const result = await radiatorService.uploadImage(radiatorId, file, isPrimary);

        if (!result.success) {
          alert(`Failed to upload ${file.name}: ${result.error}`);
          break;
        }
      }

      // Clear selection
      setSelectedFiles([]);
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls([]);

      // Reload images
      await loadImages();

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    const result = await radiatorService.deleteImage(radiatorId, imageId);

    if (result.success) {
      await loadImages();
      if (onUpdate) onUpdate();
    } else {
      alert(`Failed to delete image: ${result.error}`);
    }
  };

  const handleSetPrimary = async (imageId) => {
    const result = await radiatorService.setPrimaryImage(radiatorId, imageId);

    if (result.success) {
      await loadImages();
      if (onUpdate) onUpdate();
    } else {
      alert(`Failed to set primary image: ${result.error}`);
    }
  };

  const cancelSelection = () => {
    setSelectedFiles([]);
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <input
          type="file"
          id="image-upload"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {selectedFiles.length === 0 ? (
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 rounded-lg py-4 transition"
          >
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">Click to upload images</span>
            <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB each</span>
          </label>
        ) : (
          <div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={url}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                  <div className="absolute top-1 right-1 bg-white rounded px-1 text-xs">
                    {idx + 1}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload {selectedFiles.length} image{selectedFiles.length > 1 ? 's' : ''}
                  </>
                )}
              </button>
              <button
                onClick={cancelSelection}
                disabled={uploading}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Existing Images */}
      {images.length > 0 ? (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Current Images ({images.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((image) => (
              <div
                key={image.id}
                className={`relative group rounded-lg overflow-hidden border-2 ${
                  image.isPrimary ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <img
                  src={image.url}
                  alt={image.fileName}
                  className="w-full h-32 object-cover"
                />

                {/* Primary Badge */}
                {image.isPrimary && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Primary
                  </div>
                )}

                {/* Action Buttons (shown on hover) */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {!image.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(image.id)}
                      className="p-2 bg-white rounded-full hover:bg-blue-50 transition"
                      title="Set as primary"
                    >
                      <Star className="w-4 h-4 text-blue-600" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="p-2 bg-white rounded-full hover:bg-red-50 transition"
                    title="Delete image"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>

                {/* File name */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 opacity-0 group-hover:opacity-100 transition">
                  <p className="text-xs text-white truncate">{image.fileName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No images uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;

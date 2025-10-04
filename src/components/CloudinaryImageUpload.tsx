import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Upload, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CloudinaryImage {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  responsiveUrls: {
    thumbnail: string;
    medium: string;
    large: string;
    original: string;
  };
}

interface CloudinaryImageUploadProps {
  onImagesUploaded: (images: CloudinaryImage[]) => void;
  onImagesRemoved: (publicIds: string[]) => void;
  existingImages?: CloudinaryImage[];
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  className?: string;
}

export const CloudinaryImageUpload: React.FC<CloudinaryImageUploadProps> = ({
  onImagesUploaded,
  onImagesRemoved,
  existingImages = [],
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<CloudinaryImage[]>(existingImages);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Sync uploadedImages with existingImages when it changes
  useEffect(() => {
    setUploadedImages(existingImages);
  }, [existingImages]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      acceptedFiles.forEach((file) => {
        formData.append('images', file);
      });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/products/upload-images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        const newImages = [...uploadedImages, ...result.data];
        setUploadedImages(newImages);
        onImagesUploaded(result.data);
        
        toast({
          title: "Upload thành công",
          description: `Đã upload ${result.data.length} hình ảnh`,
        });
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
      toast({
        title: "Upload thất bại",
        description: error instanceof Error ? error.message : 'Upload failed',
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [uploadedImages, onImagesUploaded, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    maxFiles: maxFiles - uploadedImages.length,
    disabled: uploading || uploadedImages.length >= maxFiles
  });

  const removeImage = async (publicId: string) => {
    try {
      const response = await fetch('/api/products/delete-images', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ publicIds: [publicId] })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Delete failed');
      }

      const result = await response.json();
      
      if (result.success) {
        const updatedImages = uploadedImages.filter(img => img.publicId !== publicId);
        setUploadedImages(updatedImages);
        onImagesRemoved([publicId]);
        
        toast({
          title: "Xóa thành công",
          description: "Hình ảnh đã được xóa",
        });
      } else {
        throw new Error(result.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Xóa thất bại",
        description: error instanceof Error ? error.message : 'Delete failed',
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
              ${uploading || uploadedImages.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-4">
              {uploading ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-primary animate-pulse" />
                  </div>
                  <div className="space-y-2 w-full max-w-xs">
                    <p className="text-sm text-muted-foreground">Đang upload...</p>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {isDragActive ? 'Thả file vào đây' : 'Kéo thả hoặc click để chọn hình ảnh'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {acceptedTypes.join(', ')} • Tối đa {formatFileSize(maxSize)} • {maxFiles - uploadedImages.length} file còn lại
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Hình ảnh đã upload ({uploadedImages.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image) => (
              <Card key={image.publicId} className="relative group">
                <CardContent className="p-2">
                  <div className="aspect-square relative overflow-hidden rounded-md">
                    <img
                      src={image.responsiveUrls.thumbnail}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeImage(image.publicId)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground truncate">
                      {image.width} × {image.height}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(image.bytes)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upload Status */}
      {uploading && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Đang upload hình ảnh... Vui lòng không đóng trang này.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default CloudinaryImageUpload;

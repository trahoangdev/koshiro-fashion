import { v2 as cloudinary } from 'cloudinary';
import { 
  uploadOptions, 
  productUploadOptions, 
  categoryUploadOptions,
  avatarUploadOptions,
  bannerUploadOptions,
  generateResponsiveUrls,
  generateOptimizedUrl
} from '../config/cloudinary';

/**
 * Cloudinary Service
 * Handles all media operations including upload, delete, and transformation
 */
export class CloudinaryService {
  /**
   * Upload a single file to Cloudinary
   */
  static async uploadFile(
    file: Express.Multer.File,
    options: {
      folder?: string;
      tags?: string[];
      transformation?: any[];
      publicId?: string;
    } = {}
  ): Promise<{
    success: boolean;
    data?: {
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
    };
    error?: string;
  }> {
    try {
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        ...uploadOptions,
        ...options,
        resource_type: 'auto',
      });

      const responsiveUrls = generateResponsiveUrls(uploadResult.public_id);

      return {
        success: true,
        data: {
          publicId: uploadResult.public_id,
          secureUrl: uploadResult.secure_url,
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          bytes: uploadResult.bytes,
          responsiveUrls,
        },
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Upload multiple files to Cloudinary
   */
  static async uploadMultipleFiles(
    files: Express.Multer.File[],
    options: {
      folder?: string;
      tags?: string[];
      transformation?: any[];
    } = {}
  ): Promise<{
    success: boolean;
    data?: Array<{
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
    }>;
    errors?: string[];
  }> {
    try {
      const uploadPromises = files.map(file => this.uploadFile(file, options));
      const results = await Promise.allSettled(uploadPromises);

      const successfulUploads: any[] = [];
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          successfulUploads.push(result.value.data);
        } else {
          const error = result.status === 'rejected' 
            ? result.reason 
            : result.value.error;
          errors.push(`File ${index + 1}: ${error}`);
        }
      });

      return {
        success: successfulUploads.length > 0,
        data: successfulUploads,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error('Cloudinary multiple upload error:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Multiple upload failed'],
      };
    }
  }

  /**
   * Upload product images
   */
  static async uploadProductImages(files: Express.Multer.File[]): Promise<{
    success: boolean;
    data?: any[];
    errors?: string[];
  }> {
    return this.uploadMultipleFiles(files, {
      ...productUploadOptions,
      tags: [...productUploadOptions.tags, 'product-images'],
    });
  }

  /**
   * Upload category images
   */
  static async uploadCategoryImages(files: Express.Multer.File[]): Promise<{
    success: boolean;
    data?: any[];
    errors?: string[];
  }> {
    return this.uploadMultipleFiles(files, {
      ...categoryUploadOptions,
      tags: [...categoryUploadOptions.tags, 'category-images'],
    });
  }

  /**
   * Upload user avatar
   */
  static async uploadAvatar(file: Express.Multer.File): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    return this.uploadFile(file, {
      ...avatarUploadOptions,
      tags: [...avatarUploadOptions.tags, 'user-avatar'],
    });
  }

  /**
   * Upload banner/hero images
   */
  static async uploadBanner(file: Express.Multer.File): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    return this.uploadFile(file, {
      ...bannerUploadOptions,
      tags: [...bannerUploadOptions.tags, 'banner-image'],
    });
  }

  /**
   * Delete a file from Cloudinary
   */
  static async deleteFile(publicId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        return { success: true };
      } else {
        return {
          success: false,
          error: `Failed to delete file: ${result.result}`,
        };
      }
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed',
      };
    }
  }

  /**
   * Delete multiple files from Cloudinary
   */
  static async deleteMultipleFiles(publicIds: string[]): Promise<{
    success: boolean;
    deleted: string[];
    errors: string[];
  }> {
    try {
      const deletePromises = publicIds.map(publicId => this.deleteFile(publicId));
      const results = await Promise.allSettled(deletePromises);

      const deleted: string[] = [];
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          deleted.push(publicIds[index]);
        } else {
          const error = result.status === 'rejected' 
            ? result.reason 
            : result.value.error;
          errors.push(`${publicIds[index]}: ${error}`);
        }
      });

      return {
        success: deleted.length > 0,
        deleted,
        errors,
      };
    } catch (error) {
      console.error('Cloudinary multiple delete error:', error);
      return {
        success: false,
        deleted: [],
        errors: [error instanceof Error ? error.message : 'Multiple delete failed'],
      };
    }
  }

  /**
   * Transform an image URL
   */
  static transformImage(
    publicId: string,
    transformations: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string;
      format?: string;
      gravity?: string;
      radius?: number;
      effect?: string;
    } = {}
  ): string {
    return generateOptimizedUrl(publicId, transformations);
  }

  /**
   * Generate responsive image URLs
   */
  static generateResponsiveImageUrls(publicId: string) {
    return generateResponsiveUrls(publicId);
  }

  /**
   * Get file information
   */
  static async getFileInfo(publicId: string): Promise<{
    success: boolean;
    data?: {
      publicId: string;
      secureUrl: string;
      width: number;
      height: number;
      format: string;
      bytes: number;
      createdAt: string;
    };
    error?: string;
  }> {
    try {
      const result = await cloudinary.api.resource(publicId);
      
      return {
        success: true,
        data: {
          publicId: result.public_id,
          secureUrl: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          createdAt: result.created_at,
        },
      };
    } catch (error) {
      console.error('Cloudinary get file info error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get file info',
      };
    }
  }

  /**
   * Search files by tags
   */
  static async searchFiles(tags: string[]): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    try {
      const result = await cloudinary.search
        .expression(`tags:${tags.join(' AND ')}`)
        .execute();

      return {
        success: true,
        data: result.resources,
      };
    } catch (error) {
      console.error('Cloudinary search error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
      };
    }
  }

  /**
   * Create a folder
   */
  static async createFolder(folderName: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Cloudinary doesn't have explicit folder creation
      // Folders are created automatically when files are uploaded
      return { success: true };
    } catch (error) {
      console.error('Cloudinary create folder error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create folder',
      };
    }
  }

  /**
   * Get folder contents
   */
  static async getFolderContents(folderName: string): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    try {
      const result = await cloudinary.search
        .expression(`folder:${folderName}`)
        .execute();

      return {
        success: true,
        data: result.resources,
      };
    } catch (error) {
      console.error('Cloudinary get folder contents error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get folder contents',
      };
    }
  }
}

export default CloudinaryService;

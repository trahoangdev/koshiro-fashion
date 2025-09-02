import { Order, Product, User, Category, api } from './api';
import * as XLSX from 'xlsx';

export interface ExportJob {
  id: string;
  type: 'products' | 'orders' | 'customers' | 'categories' | 'all';
  format: 'csv' | 'excel' | 'json';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  error?: string;
}

export interface ImportJob {
  id: string;
  type: 'products' | 'orders' | 'customers' | 'categories';
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalRows: number;
  processedRows: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

interface ExportableData {
  [key: string]: string | number | boolean | null | undefined;
}

interface ParsedData {
  [key: string]: string | number | boolean | null | undefined;
}

class ExportImportService {
  private exportJobs: ExportJob[] = [];
  private importJobs: ImportJob[] = [];

  // Export functions
  async exportToCSV(data: ExportableData[]): Promise<string> {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    // Add BOM for UTF-8 encoding to handle special characters
    return '\uFEFF' + csvContent;
  }

  async exportToJSON(data: ExportableData[]): Promise<string> {
    return JSON.stringify(data, null, 2);
  }

  async exportToExcel(data: ExportableData[]): Promise<Blob> {
    if (data.length === 0) {
      // Create empty workbook
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet([['No data available']]);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      return new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
    }

    try {
      // Clean data to ensure all values are serializable
      const cleanData = data.map(row => {
        const cleanRow: any = {};
        Object.keys(row).forEach(key => {
          const value = row[key];
          // Convert undefined/null to empty string, ensure all values are serializable
          if (value === null || value === undefined) {
            cleanRow[key] = '';
          } else if (typeof value === 'object') {
            cleanRow[key] = JSON.stringify(value);
          } else {
            cleanRow[key] = String(value);
          }
        });
        return cleanRow;
      });

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(cleanData);

      // Set column widths for better formatting
      const colWidths = Object.keys(cleanData[0]).map(key => ({
        wch: Math.max(key.length, 15) // Minimum width of 15 characters
      }));
      worksheet['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

      // Generate Excel file as buffer
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array',
        cellStyles: false, // Disable cell styles to avoid potential issues
        compression: true  // Enable compression for better compatibility
      });

      return new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
    } catch (error) {
      console.error('Excel export error:', error);
      // Fallback: create a simple CSV-like Excel file
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet([
        ['Export Error'],
        ['Failed to create Excel file'],
        ['Error:', String(error)]
      ]);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Error');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      return new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
    }
  }

  async startExportJob(type: string, format: string, data?: ExportableData[]): Promise<ExportJob> {
    const jobId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: ExportJob = {
      id: jobId,
      type: type as ExportJob['type'],
      format: format as ExportJob['format'],
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString()
    };

    this.exportJobs.push(job);

    // Start real export process
    this.processExportJob(job, data);

    return job;
  }

  private async processExportJob(job: ExportJob, data?: ExportableData[]): Promise<void> {
    try {
      job.status = 'processing';
      job.progress = 10;

      // Get data from API if not provided
      let exportData: ExportableData[] = [];
      
      if (data) {
        exportData = data;
      } else {
        // Fetch data from API based on type
        switch (job.type) {
          case 'products':
            const productsResponse = await api.getAdminProducts({ page: 1, limit: 1000 });
            exportData = productsResponse.data.map(this.transformProductForExport);
            break;
          case 'orders':
            const ordersResponse = await api.getAdminOrders({ page: 1, limit: 1000 });
            exportData = ordersResponse.data.map(this.transformOrderForExport);
            break;
          case 'customers':
            const usersResponse = await api.getAdminUsers({ page: 1, limit: 1000 });
            exportData = usersResponse.data.map(this.transformUserForExport);
            break;
          case 'categories':
            const categoriesResponse = await api.getCategories();
            exportData = categoriesResponse.categories.map(this.transformCategoryForExport);
            break;
          case 'all':
            // Export all data types
            const [allProductsResponse, allOrdersResponse, allUsersResponse, allCategoriesResponse] = await Promise.all([
              api.getAdminProducts({ page: 1, limit: 1000 }),
              api.getAdminOrders({ page: 1, limit: 1000 }),
              api.getAdminUsers({ page: 1, limit: 1000 }),
              api.getCategories()
            ]);
            exportData = [
              ...allProductsResponse.data.map(p => ({ ...this.transformProductForExport(p), _type: 'product' })),
              ...allOrdersResponse.data.map(o => ({ ...this.transformOrderForExport(o), _type: 'order' })),
              ...allUsersResponse.data.map(u => ({ ...this.transformUserForExport(u), _type: 'user' })),
              ...allCategoriesResponse.categories.map(c => ({ ...this.transformCategoryForExport(c), _type: 'category' }))
            ];
            break;
        }
      }

      job.progress = 50;

      // Generate file based on format
      let result: string | Blob;
      switch (job.format) {
        case 'csv':
          result = await this.exportToCSV(exportData);
          break;
        case 'json':
          result = await this.exportToJSON(exportData);
          break;
        case 'excel':
          result = await this.exportToExcel(exportData);
          break;
        default:
          throw new Error('Unsupported format');
      }

      job.progress = 90;

      // Create download URL
      if (job.format === 'excel') {
        job.downloadUrl = URL.createObjectURL(result as Blob);
      } else {
        job.downloadUrl = URL.createObjectURL(
          new Blob([result as string], {
            type: this.getMimeType(job.format)
          })
        );
      }
      
      job.progress = 100;
      job.status = 'completed';
      job.completedAt = new Date().toISOString();
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.completedAt = new Date().toISOString();
    }
  }

  async startImportJob(type: string, file: File): Promise<ImportJob> {
    const jobId = `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: ImportJob = {
      id: jobId,
      type: type as ImportJob['type'],
      filename: file.name,
      status: 'pending',
      progress: 0,
      totalRows: 0,
      processedRows: 0,
      createdAt: new Date().toISOString()
    };

    this.importJobs.push(job);

    // Start real import process
    this.processImportJob(job, file);

    return job;
  }

  private async processImportJob(job: ImportJob, file: File): Promise<void> {
    try {
      job.status = 'processing';
      job.progress = 10;

      // Parse file content
      const content = await file.text();
      let data: ParsedData[] = [];

      if (file.name.endsWith('.csv')) {
        data = this.parseCSV(content);
      } else if (file.name.endsWith('.json')) {
        data = JSON.parse(content);
      } else {
        throw new Error('Unsupported file format. Please use CSV or JSON files.');
      }

      job.totalRows = data.length;
      job.progress = 25;

      // Validate data structure
      const validationResult = this.validateImportData(data, job.type);
      if (!validationResult.isValid) {
        throw new Error(`Data validation failed: ${validationResult.errors.join(', ')}`);
      }

      job.progress = 40;

      // Process each row and import to API
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < data.length; i++) {
        try {
          const transformedData = this.transformImportData(data[i], job.type);
          
          // Import to API based on type
          switch (job.type) {
            case 'products':
              await api.createProduct(transformedData as any);
              break;
            case 'orders':
              // Orders are typically not imported, but we can log them
              console.log('Order import not supported:', transformedData);
              break;
            case 'customers':
              await api.createUser(transformedData as any);
              break;
            case 'categories':
              await api.createCategory(transformedData as any);
              break;
          }
          
          successCount++;
        } catch (error) {
          errorCount++;
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        job.processedRows = i + 1;
        job.progress = 40 + ((i + 1) / data.length) * 50;
      }

      job.progress = 100;
      job.status = 'completed';
      job.completedAt = new Date().toISOString();
      
      if (errorCount > 0) {
        job.error = `${successCount} items imported successfully, ${errorCount} failed. Errors: ${errors.slice(0, 5).join('; ')}`;
      }
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.completedAt = new Date().toISOString();
    }
  }

  private parseCSV(content: string): ParsedData[] {
    const lines = content.split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data: ParsedData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim());
      const row: ParsedData = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      data.push(row);
    }

    return data;
  }

  // Job management methods
  getExportJob(jobId: string): ExportJob | undefined {
    return this.exportJobs.find(job => job.id === jobId);
  }

  getImportJob(jobId: string): ImportJob | undefined {
    return this.importJobs.find(job => job.id === jobId);
  }

  getAllExportJobs(): ExportJob[] {
    return [...this.exportJobs];
  }

  getAllImportJobs(): ImportJob[] {
    return [...this.importJobs];
  }

  cancelExportJob(jobId: string): boolean {
    const job = this.exportJobs.find(job => job.id === jobId);
    if (job && job.status === 'pending') {
      job.status = 'failed';
      job.error = 'Cancelled by user';
      job.completedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  cancelImportJob(jobId: string): boolean {
    const job = this.importJobs.find(job => job.id === jobId);
    if (job && job.status === 'pending') {
      job.status = 'failed';
      job.error = 'Cancelled by user';
      job.completedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  // Utility methods
  downloadFile(url: string, filename: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private getMimeType(format: string): string {
    switch (format) {
      case 'csv':
        return 'text/csv';
      case 'json':
        return 'application/json';
      case 'excel':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default:
        return 'text/plain';
    }
  }

  // Transform methods for different data types
  private transformProductForExport(product: Product): ExportableData {
    return {
      id: product._id,
      name: product.name,
      nameEn: product.nameEn,
      nameJa: product.nameJa,
      description: product.description,
      descriptionEn: product.descriptionEn,
      descriptionJa: product.descriptionJa,
      price: product.price,
      originalPrice: product.originalPrice,
      salePrice: product.salePrice,
      stock: product.stock,
      category: typeof product.categoryId === 'object' ? product.categoryId.name : '',
      categoryId: typeof product.categoryId === 'object' ? product.categoryId._id : product.categoryId,
      images: product.images?.join(', ') || '',
      colors: product.colors?.join(', ') || '',
      sizes: product.sizes?.join(', ') || '',
      tags: product.tags?.join(', ') || '',
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      onSale: product.onSale,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
  }

  private transformOrderForExport(order: Order): ExportableData {
    return {
      id: order._id,
      orderNumber: order.orderNumber,
      userId: order.userId?._id || '',
      userEmail: order.userId?.email || '',
      userName: order.userId?.name || '',
      status: order.status,
      totalAmount: order.totalAmount,
      shippingAddress: order.shippingAddress ? 
        `${order.shippingAddress.name}, ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.district}` : '',
      paymentMethod: order.paymentMethod || '',
      paymentStatus: order.paymentStatus || '',
      items: order.items?.map(item => 
        `${item.nameVi} (${item.quantity}x) - ${item.price}`
      ).join('; ') || '',
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
  }

  private transformUserForExport(user: User): ExportableData {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      status: user.status,
      isActive: user.isActive,
      totalOrders: user.totalOrders,
      orderCount: user.orderCount,
      totalSpent: user.totalSpent,
      address: user.address || '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  private transformCategoryForExport(category: Category): ExportableData {
    return {
      id: category._id,
      name: category.name,
      nameEn: category.nameEn,
      nameJa: category.nameJa,
      description: category.description,
      descriptionEn: category.descriptionEn,
      descriptionJa: category.descriptionJa,
      image: category.image || '',
      isActive: category.isActive,
      productCount: category.productCount || 0,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    };
  }

  // Validation and transformation for import
  private validateImportData(data: ParsedData[], type: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (data.length === 0) {
      errors.push('No data found in file');
      return { isValid: false, errors };
    }

    // Check required fields based on type
    const requiredFields = this.getRequiredFields(type);
    const firstRow = data[0];
    
    for (const field of requiredFields) {
      if (!(field in firstRow) || firstRow[field] === undefined || firstRow[field] === '') {
        errors.push(`Missing required field: ${field}`);
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  private getRequiredFields(type: string): string[] {
    switch (type) {
      case 'products':
        return ['name', 'price', 'stock'];
      case 'categories':
        return ['name'];
      case 'customers':
        return ['name', 'email'];
      case 'orders':
        return ['orderNumber', 'totalAmount'];
      default:
        return [];
    }
  }

  private transformImportData(data: ParsedData, type: string): any {
    switch (type) {
      case 'products':
        return {
          name: data.name,
          nameEn: data.nameEn || data.name,
          nameJa: data.nameJa || data.name,
          description: data.description || '',
          descriptionEn: data.descriptionEn || data.description || '',
          descriptionJa: data.descriptionJa || data.description || '',
          price: parseFloat(data.price as string) || 0,
          originalPrice: parseFloat(data.originalPrice as string) || 0,
          salePrice: parseFloat(data.salePrice as string) || 0,
          stock: parseInt(data.stock as string) || 0,
          categoryId: data.categoryId || '',
          images: data.images ? (data.images as string).split(',').map(img => img.trim()) : [],
          colors: data.colors ? (data.colors as string).split(',').map(color => color.trim()) : [],
          sizes: data.sizes ? (data.sizes as string).split(',').map(size => size.trim()) : [],
          tags: data.tags ? (data.tags as string).split(',').map(tag => tag.trim()) : [],
          isActive: data.isActive === 'true' || data.isActive === true,
          isFeatured: data.isFeatured === 'true' || data.isFeatured === true,
          onSale: data.onSale === 'true' || data.onSale === true
        };
      case 'categories':
        return {
          name: data.name,
          nameEn: data.nameEn || data.name,
          nameJa: data.nameJa || data.name,
          description: data.description || '',
          descriptionEn: data.descriptionEn || data.description || '',
          descriptionJa: data.descriptionJa || data.description || '',
          image: data.image || '',
          isActive: data.isActive === 'true' || data.isActive === true
        };
      case 'customers':
        return {
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          role: data.role || 'customer',
          isActive: data.isActive === 'true' || data.isActive === true
        };
      default:
        return data;
    }
  }


}

export const exportImportService = new ExportImportService();
import { Order, Product, User, Category } from './api';

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

class ExportImportService {
  private exportJobs: ExportJob[] = [];
  private importJobs: ImportJob[] = [];

  // Export functions
  async exportToCSV(data: any[], type: string): Promise<string> {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  }

  async exportToJSON(data: any[]): Promise<string> {
    return JSON.stringify(data, null, 2);
  }

  async exportToExcel(data: any[], type: string): Promise<Blob> {
    // This would require a library like xlsx
    // For now, we'll return a CSV as Excel
    const csv = await this.exportToCSV(data, type);
    return new Blob([csv], { type: 'text/csv' });
  }

  async startExportJob(type: string, format: string, data: any[]): Promise<ExportJob> {
    const jobId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: ExportJob = {
      id: jobId,
      type: type as any,
      format: format as any,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString()
    };

    this.exportJobs.push(job);

    // Simulate processing
    setTimeout(async () => {
      try {
        job.status = 'processing';
        job.progress = 25;

        let result: string | Blob;
        switch (format) {
          case 'csv':
            result = await this.exportToCSV(data, type);
            break;
          case 'json':
            result = await this.exportToJSON(data);
            break;
          case 'excel':
            result = await this.exportToExcel(data, type);
            break;
          default:
            throw new Error('Unsupported format');
        }

        job.progress = 100;
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
        job.downloadUrl = URL.createObjectURL(
          new Blob([typeof result === 'string' ? result : await result.text()], {
            type: format === 'json' ? 'application/json' : 'text/csv'
          })
        );
      } catch (error) {
        job.status = 'failed';
        job.error = error instanceof Error ? error.message : 'Unknown error';
        job.completedAt = new Date().toISOString();
      }
    }, 1000);

    return job;
  }

  async startImportJob(type: string, file: File): Promise<ImportJob> {
    const jobId = `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: ImportJob = {
      id: jobId,
      type: type as any,
      filename: file.name,
      status: 'pending',
      progress: 0,
      totalRows: 0,
      processedRows: 0,
      createdAt: new Date().toISOString()
    };

    this.importJobs.push(job);

    // Simulate processing
    setTimeout(async () => {
      try {
        job.status = 'processing';
        job.progress = 25;

        const content = await file.text();
        let data: any[] = [];

        if (file.name.endsWith('.csv')) {
          data = this.parseCSV(content);
        } else if (file.name.endsWith('.json')) {
          data = JSON.parse(content);
        } else {
          throw new Error('Unsupported file format');
        }

        job.totalRows = data.length;
        job.progress = 50;

        // Simulate processing each row
        for (let i = 0; i < data.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 10)); // Simulate processing time
          job.processedRows = i + 1;
          job.progress = 50 + (i / data.length) * 50;
        }

        job.progress = 100;
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
      } catch (error) {
        job.status = 'failed';
        job.error = error instanceof Error ? error.message : 'Unknown error';
        job.completedAt = new Date().toISOString();
      }
    }, 1000);

    return job;
  }

  private parseCSV(content: string): any[] {
    const lines = content.split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      data.push(row);
    }

    return data;
  }

  // Job management
  getExportJobs(): ExportJob[] {
    return [...this.exportJobs];
  }

  getImportJobs(): ImportJob[] {
    return [...this.importJobs];
  }

  getExportJob(jobId: string): ExportJob | undefined {
    return this.exportJobs.find(job => job.id === jobId);
  }

  getImportJob(jobId: string): ImportJob | undefined {
    return this.importJobs.find(job => job.id === jobId);
  }

  cancelJob(jobId: string, type: 'export' | 'import'): boolean {
    if (type === 'export') {
      const job = this.exportJobs.find(j => j.id === jobId);
      if (job && (job.status === 'pending' || job.status === 'processing')) {
        job.status = 'failed';
        job.error = 'Cancelled by user';
        job.completedAt = new Date().toISOString();
        return true;
      }
    } else {
      const job = this.importJobs.find(j => j.id === jobId);
      if (job && (job.status === 'pending' || job.status === 'processing')) {
        job.status = 'failed';
        job.error = 'Cancelled by user';
        job.completedAt = new Date().toISOString();
        return true;
      }
    }
    return false;
  }

  retryJob(jobId: string, type: 'export' | 'import'): boolean {
    if (type === 'export') {
      const job = this.exportJobs.find(j => j.id === jobId);
      if (job && job.status === 'failed') {
        job.status = 'pending';
        job.progress = 0;
        job.error = undefined;
        job.completedAt = undefined;
        return true;
      }
    } else {
      const job = this.importJobs.find(j => j.id === jobId);
      if (job && job.status === 'failed') {
        job.status = 'pending';
        job.progress = 0;
        job.error = undefined;
        job.completedAt = undefined;
        return true;
      }
    }
    return false;
  }

  // Data transformation helpers
  transformOrdersForExport(orders: Order[]): any[] {
    return orders.map(order => ({
      orderNumber: order.orderNumber,
      customerName: order.userId?.name || '',
      customerEmail: order.userId?.email || '',
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      taxAmount: order.taxAmount,
      orderDate: new Date(order.createdAt).toLocaleDateString(),
      itemsCount: order.items.length,
      shippingAddress: order.shippingAddress ? 
        `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state}` : '',
      paymentMethod: order.paymentMethod?.name || '',
      trackingNumber: order.trackingNumber || '',
      notes: order.notes || ''
    }));
  }

  transformProductsForExport(products: Product[]): any[] {
    return products.map(product => ({
      name: product.name,
      nameEn: product.nameEn || '',
      nameJa: product.nameJa || '',
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      category: typeof product.categoryId === 'string' ? product.categoryId : product.categoryId?.name || '',
      stock: product.stock,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      onSale: product.onSale,
      sku: product.sku || '',
      barcode: product.barcode || '',
      weight: product.weight || 0,
      dimensions: product.dimensions ? 
        `${product.dimensions.length}x${product.dimensions.width}x${product.dimensions.height}` : '',
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : '',
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
      images: Array.isArray(product.images) ? product.images.join(', ') : '',
      createdAt: new Date(product.createdAt).toLocaleDateString(),
      updatedAt: new Date(product.updatedAt).toLocaleDateString()
    }));
  }

  transformUsersForExport(users: User[]): any[] {
    return users.map(user => ({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      totalOrders: user.totalOrders || 0,
      orderCount: user.orderCount || 0,
      createdAt: new Date(user.createdAt).toLocaleDateString(),
      lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '',
      address: user.addresses && user.addresses.length > 0 ? 
        `${user.addresses[0].address}, ${user.addresses[0].city}` : ''
    }));
  }

  transformCategoriesForExport(categories: Category[]): any[] {
    return categories.map(category => ({
      name: category.name,
      nameEn: category.nameEn || '',
      nameJa: category.nameJa || '',
      description: category.description,
      descriptionEn: category.descriptionEn || '',
      descriptionJa: category.descriptionJa || '',
      slug: category.slug,
      parentCategory: category.parentId || '',
      isActive: category.isActive,
      isFeatured: category.isFeatured || false,
      sortOrder: category.sortOrder || 0,
      metaTitle: category.metaTitle || '',
      metaDescription: category.metaDescription || '',
      image: category.image || '',
      createdAt: new Date(category.createdAt).toLocaleDateString(),
      updatedAt: new Date(category.updatedAt).toLocaleDateString()
    }));
  }

  // Download helper
  downloadFile(content: string | Blob, filename: string, type: string) {
    const blob = typeof content === 'string' ? 
      new Blob([content], { type: this.getMimeType(type) }) : content;
    
    const url = URL.createObjectURL(blob);
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
}

export const exportImportService = new ExportImportService(); 
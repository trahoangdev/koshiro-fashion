import { Request, Response } from 'express';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { Order } from '../models/Order';

// Export data
export const exportData = async (req: Request, res: Response) => {
  try {
    const { type, format = 'json', filters } = req.body;
    
    let data: any[] = [];
    let filename = '';

    switch (type) {
      case 'users':
        data = await User.find(filters || {}).select('-password');
        filename = `users_${new Date().toISOString().split('T')[0]}`;
        break;
      case 'products':
        data = await Product.find(filters || {}).populate('categoryId');
        filename = `products_${new Date().toISOString().split('T')[0]}`;
        break;
      case 'orders':
        data = await Order.find(filters || {}).populate('userId');
        filename = `orders_${new Date().toISOString().split('T')[0]}`;
        break;
      case 'categories':
        data = await Category.find(filters || {});
        filename = `categories_${new Date().toISOString().split('T')[0]}`;
        break;
      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      return res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      return res.json(data);
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Import data
export const importData = async (req: Request, res: Response) => {
  try {
    const { type, data, options = {} } = req.body;
    
    let result: any = {};

    switch (type) {
      case 'users':
        result = await importUsers(data, options);
        break;
      case 'products':
        result = await importProducts(data, options);
        break;
      case 'categories':
        result = await importCategories(data, options);
        break;
      default:
        return res.status(400).json({ message: 'Invalid import type' });
    }

    res.json({
      message: 'Import completed successfully',
      ...result
    });
  } catch (error) {
    console.error('Error importing data:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Helper functions
const convertToCSV = (data: any[]): string => {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' ? `"${value}"` : value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};

const importUsers = async (data: any[], options: any) => {
  const results = { created: 0, updated: 0, errors: 0 };
  
  for (const userData of data) {
    try {
      if (options.updateExisting && userData.email) {
        await User.findOneAndUpdate(
          { email: userData.email },
          userData,
          { upsert: true, new: true }
        );
        results.updated++;
      } else {
        await User.create(userData);
        results.created++;
      }
    } catch (error) {
      console.error('Error importing user:', error);
      results.errors++;
    }
  }
  
  return results;
};

const importProducts = async (data: any[], options: any) => {
  const results = { created: 0, updated: 0, errors: 0 };
  
  for (const productData of data) {
    try {
      if (options.updateExisting && productData.sku) {
        await Product.findOneAndUpdate(
          { sku: productData.sku },
          productData,
          { upsert: true, new: true }
        );
        results.updated++;
      } else {
        await Product.create(productData);
        results.created++;
      }
    } catch (error) {
      console.error('Error importing product:', error);
      results.errors++;
    }
  }
  
  return results;
};

const importCategories = async (data: any[], options: any) => {
  const results = { created: 0, updated: 0, errors: 0 };
  
  for (const categoryData of data) {
    try {
      if (options.updateExisting && categoryData.slug) {
        await Category.findOneAndUpdate(
          { slug: categoryData.slug },
          categoryData,
          { upsert: true, new: true }
        );
        results.updated++;
      } else {
        await Category.create(categoryData);
        results.created++;
      }
    } catch (error) {
      console.error('Error importing category:', error);
      results.errors++;
    }
  }
  
  return results;
}; 
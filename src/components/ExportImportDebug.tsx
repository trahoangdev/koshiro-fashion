import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Download, Upload, FileText, Bug } from 'lucide-react';

export default function ExportImportDebug() {
  const { toast } = useToast();
  const [isTesting, setIsTesting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const handleTestAPI = async () => {
    try {
      setIsTesting(true);
      setDebugInfo('Testing API calls...\n');

      // Test getAdminProducts
      const productsResponse = await api.getAdminProducts({ page: 1, limit: 5 });
      setDebugInfo(prev => prev + `Products API Response: ${JSON.stringify(productsResponse, null, 2)}\n\n`);

      // Test getCategories
      const categoriesResponse = await api.getCategories();
      setDebugInfo(prev => prev + `Categories API Response: ${JSON.stringify(categoriesResponse, null, 2)}\n\n`);

      toast({
        title: "API Test Completed",
        description: "Check debug info below",
      });
    } catch (error) {
      console.error('API test error:', error);
      setDebugInfo(prev => prev + `Error: ${error}\n`);
      toast({
        title: "API Test Failed",
        description: "Check console for details",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestExport = async () => {
    try {
      setIsTesting(true);
      setDebugInfo('Testing export...\n');

      // Get products data
      const productsResponse = await api.getAdminProducts({ page: 1, limit: 5 });
      setDebugInfo(prev => prev + `Products data: ${productsResponse.data.length} items\n`);

      // Transform data
      const transformedData = productsResponse.data.map(product => ({
        id: product._id,
        name: product.name,
        nameEn: product.nameEn || '',
        nameJa: product.nameJa || '',
        price: product.price,
        stock: product.stock,
        description: product.description || ''
      }));

      setDebugInfo(prev => prev + `Transformed data: ${JSON.stringify(transformedData, null, 2)}\n`);

      // Test CSV export
      const headers = Object.keys(transformedData[0]);
      const csvContent = [
        headers.join(','),
        ...transformedData.map(row => 
          headers.map(header => {
            const value = row[header];
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      setDebugInfo(prev => prev + `CSV Content:\n${csvContent}\n`);

      // Create CSV download with UTF-8 BOM
      const csvBlob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
      const csvUrl = URL.createObjectURL(csvBlob);
      
      const csvLink = document.createElement('a');
      csvLink.href = csvUrl;
      csvLink.download = 'test-export.csv';
      document.body.appendChild(csvLink);
      csvLink.click();
      document.body.removeChild(csvLink);
      URL.revokeObjectURL(csvUrl);

      toast({
        title: "CSV Export Test Success",
        description: "CSV file downloaded successfully",
      });
    } catch (error) {
      console.error('Export test error:', error);
      setDebugInfo(prev => prev + `Export Error: ${error}\n`);
      toast({
        title: "Export Test Failed",
        description: "Check debug info for details",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestExcelExport = async () => {
    try {
      setIsTesting(true);
      setDebugInfo('Testing Excel export...\n');

      // Get orders data (more complex data structure)
      const ordersResponse = await api.getAdminOrders({ page: 1, limit: 5 });
      setDebugInfo(prev => prev + `Orders data: ${ordersResponse.data.length} items\n`);

      // Transform data
      const transformedData = ordersResponse.data.map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,
        userEmail: order.userId?.email || '',
        userName: order.userId?.name || '',
        status: order.status,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress ? 
          `${order.shippingAddress.name}, ${order.shippingAddress.address}, ${order.shippingAddress.city}` : '',
        paymentMethod: order.paymentMethod || '',
        paymentStatus: order.paymentStatus || '',
        items: order.items?.map(item => 
          `${item.nameVi} (${item.quantity}x)`
        ).join('; ') || '',
        createdAt: order.createdAt
      }));

      setDebugInfo(prev => prev + `Transformed data: ${JSON.stringify(transformedData, null, 2)}\n`);

      // Import XLSX dynamically
      const XLSX = await import('xlsx');
      
      // Clean data to ensure all values are serializable
      const cleanData = transformedData.map(row => {
        const cleanRow: any = {};
        Object.keys(row).forEach(key => {
          const value = row[key];
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

      setDebugInfo(prev => prev + `Clean data: ${JSON.stringify(cleanData, null, 2)}\n`);
      
      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(cleanData);

      // Set column widths
      const colWidths = Object.keys(cleanData[0]).map(key => ({
        wch: Math.max(key.length, 15)
      }));
      worksheet['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

      // Generate Excel file with better compatibility
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array',
        cellStyles: false, // Disable cell styles
        compression: true  // Enable compression
      });

      setDebugInfo(prev => prev + `Excel buffer size: ${excelBuffer.length} bytes\n`);

      // Create Excel download
      const excelBlob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const excelUrl = URL.createObjectURL(excelBlob);
      
      const excelLink = document.createElement('a');
      excelLink.href = excelUrl;
      excelLink.download = 'test-orders-export.xlsx';
      document.body.appendChild(excelLink);
      excelLink.click();
      document.body.removeChild(excelLink);
      URL.revokeObjectURL(excelUrl);

      toast({
        title: "Excel Export Test Success",
        description: "Excel file downloaded successfully",
      });
    } catch (error) {
      console.error('Excel export test error:', error);
      setDebugInfo(prev => prev + `Excel Export Error: ${error}\n`);
      toast({
        title: "Excel Export Test Failed",
        description: "Check debug info for details",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Export/Import Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button 
            onClick={handleTestAPI} 
            disabled={isTesting}
            variant="outline"
          >
            <FileText className="h-4 w-4 mr-2" />
            Test API
          </Button>
          
          <Button 
            onClick={handleTestExport} 
            disabled={isTesting}
          >
            <Download className="h-4 w-4 mr-2" />
            Test CSV
          </Button>

          <Button 
            onClick={handleTestExcelExport} 
            disabled={isTesting}
            variant="secondary"
          >
            <Download className="h-4 w-4 mr-2" />
            Test Excel
          </Button>
        </div>

        {debugInfo && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Debug Information:</h4>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-96 whitespace-pre-wrap">
              {debugInfo}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

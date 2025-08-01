import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { products } from "@/data/products";
import { Product } from "@/types/product";

export default function AdminProducts() {
  const [productList, setProductList] = useState<Product[]>(products);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const filteredProducts = productList.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.nameVi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteProduct = (productId: string) => {
    setProductList(prev => prev.filter(p => p.id !== productId));
    toast({
      title: "Xóa sản phẩm thành công",
      description: "Sản phẩm đã được xóa khỏi danh sách",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount * 1000); // Convert to VND
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'tops': 'Áo',
      'bottoms': 'Quần',
      'accessories': 'Phụ kiện',
      'kimono': 'Kimono',
      'yukata': 'Yukata',
      'hakama': 'Hakama'
    };
    return categoryMap[category] || category;
  };

  const categories = [
    { value: "all", label: "Tất cả" },
    { value: "tops", label: "Áo" },
    { value: "bottoms", label: "Quần" },
    { value: "accessories", label: "Phụ kiện" },
    { value: "kimono", label: "Kimono" },
    { value: "yukata", label: "Yukata" },
    { value: "hakama", label: "Hakama" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
              <p className="text-sm text-muted-foreground">Thêm, sửa, xóa sản phẩm</p>
            </div>
          </div>
          
          <Button onClick={() => toast({ title: "Tính năng đang phát triển", description: "Chức năng thêm sản phẩm sẽ sớm được cập nhật" })}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm sản phẩm
          </Button>
        </div>
      </header>

      <main className="container py-6">
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Bộ lọc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {categories.map(category => (
                    <Button
                      key={category.value}
                      variant={selectedCategory === category.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.value)}
                    >
                      {category.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium truncate">{product.nameVi}</h3>
                        <p className="text-sm text-muted-foreground truncate">{product.name}</p>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {getCategoryLabel(product.category)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg">{formatCurrency(product.price)}</span>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toast({ title: "Tính năng đang phát triển", description: "Chức năng sửa sản phẩm sẽ sớm được cập nhật" })}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {product.colors.slice(0, 3).map(color => (
                        <div
                          key={color}
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.toLowerCase() }}
                          title={color}
                        />
                      ))}
                      {product.colors.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{product.colors.length - 3}</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {product.sizes.map(size => (
                        <Badge key={size} variant="outline" className="text-xs">
                          {size}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Không tìm thấy sản phẩm nào phù hợp với bộ lọc</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
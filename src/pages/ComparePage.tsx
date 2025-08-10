import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { api, Product } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  GitCompare, 
  X, 
  Plus, 
  Star, 
  ShoppingCart,
  Heart,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/currency";

const ComparePage = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load compare list from localStorage
  useEffect(() => {
    const savedCompareList = localStorage.getItem('koshiro_compare_list');
    if (savedCompareList) {
      try {
        const products = JSON.parse(savedCompareList);
        setCompareList(products);
      } catch (error) {
        console.error('Error loading compare list:', error);
      }
    }
  }, []);

  const saveCompareList = (products: Product[]) => {
    localStorage.setItem('koshiro_compare_list', JSON.stringify(products));
  };

  const addToCompare = (product: Product) => {
    if (compareList.length >= 4) {
      toast({
        title: language === 'vi' ? "Giới hạn so sánh" : 
               language === 'ja' ? "比較制限" : 
               "Compare Limit",
        description: language === 'vi' ? "Bạn chỉ có thể so sánh tối đa 4 sản phẩm" :
                     language === 'ja' ? "最大4つの商品を比較できます" :
                     "You can compare up to 4 products",
        variant: "destructive",
      });
      return;
    }

    if (compareList.find(p => p._id === product._id)) {
      toast({
        title: language === 'vi' ? "Sản phẩm đã có" : 
               language === 'ja' ? "商品は既に追加済み" : 
               "Product Already Added",
        description: language === 'vi' ? "Sản phẩm này đã có trong danh sách so sánh" :
                     language === 'ja' ? "この商品は既に比較リストにあります" :
                     "This product is already in the compare list",
        variant: "destructive",
      });
      return;
    }

    const newCompareList = [...compareList, product];
    setCompareList(newCompareList);
    saveCompareList(newCompareList);
    
    toast({
      title: language === 'vi' ? "Đã thêm vào so sánh" : 
             language === 'ja' ? "比較リストに追加" : 
             "Added to Compare",
      description: language === 'vi' ? "Sản phẩm đã được thêm vào danh sách so sánh" :
                   language === 'ja' ? "商品が比較リストに追加されました" :
                   "Product has been added to compare list",
    });
  };

  const removeFromCompare = (productId: string) => {
    const newCompareList = compareList.filter(p => p._id !== productId);
    setCompareList(newCompareList);
    saveCompareList(newCompareList);
    
    toast({
      title: language === 'vi' ? "Đã xóa khỏi so sánh" : 
             language === 'ja' ? "比較リストから削除" : 
             "Removed from Compare",
      description: language === 'vi' ? "Sản phẩm đã được xóa khỏi danh sách so sánh" :
                   language === 'ja' ? "商品が比較リストから削除されました" :
                   "Product has been removed from compare list",
    });
  };

  const clearCompareList = () => {
    setCompareList([]);
    localStorage.removeItem('koshiro_compare_list');
    
    toast({
      title: language === 'vi' ? "Đã xóa danh sách" : 
             language === 'ja' ? "リストをクリア" : 
             "List Cleared",
      description: language === 'vi' ? "Danh sách so sánh đã được xóa" :
                   language === 'ja' ? "比較リストがクリアされました" :
                   "Compare list has been cleared",
    });
  };

  const getProductName = (product: Product) => {
    switch (language) {
      case 'vi':
        return product.nameVi || product.name;
      case 'ja':
        return product.nameJa || product.name;
      default:
        return product.name;
    }
  };

  const translations = {
    en: {
      title: "Compare Products",
      subtitle: "Compare up to 4 products side by side",
      emptyTitle: "No products to compare",
      emptyDesc: "Add products to your compare list to see them side by side",
      addProducts: "Add Products",
      clearList: "Clear List",
      price: "Price",
      category: "Category",
      rating: "Rating",
      availability: "Availability",
      description: "Description",
      features: "Features",
      addToCart: "Add to Cart",
      addToWishlist: "Add to Wishlist",
      inStock: "In Stock",
      outOfStock: "Out of Stock",
      remove: "Remove"
    },
    vi: {
      title: "So Sánh Sản Phẩm",
      subtitle: "So sánh tối đa 4 sản phẩm cạnh nhau",
      emptyTitle: "Không có sản phẩm để so sánh",
      emptyDesc: "Thêm sản phẩm vào danh sách so sánh để xem chúng cạnh nhau",
      addProducts: "Thêm Sản Phẩm",
      clearList: "Xóa Danh Sách",
      price: "Giá",
      category: "Danh Mục",
      rating: "Đánh Giá",
      availability: "Tình Trạng",
      description: "Mô Tả",
      features: "Tính Năng",
      addToCart: "Thêm Vào Giỏ",
      addToWishlist: "Thêm Vào Yêu Thích",
      inStock: "Còn Hàng",
      outOfStock: "Hết Hàng",
      remove: "Xóa"
    },
    ja: {
      title: "商品比較",
      subtitle: "最大4つの商品を並べて比較",
      emptyTitle: "比較する商品がありません",
      emptyDesc: "比較リストに商品を追加して並べて表示",
      addProducts: "商品を追加",
      clearList: "リストをクリア",
      price: "価格",
      category: "カテゴリ",
      rating: "評価",
      availability: "在庫状況",
      description: "説明",
      features: "特徴",
      addToCart: "カートに追加",
      addToWishlist: "お気に入りに追加",
      inStock: "在庫あり",
      outOfStock: "在庫切れ",
      remove: "削除"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemsCount={0} onSearch={() => {}} />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
              <p className="text-muted-foreground">{t.subtitle}</p>
            </div>
            
            {compareList.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearCompareList}>
                  {t.clearList}
                </Button>
                <Link to="/">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t.addProducts}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Compare Table */}
          {compareList.length === 0 ? (
            <div className="text-center py-16">
              <GitCompare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">{t.emptyTitle}</h2>
              <p className="text-muted-foreground mb-8">{t.emptyDesc}</p>
              <Link to="/">
                <Button size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  {t.addProducts}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left font-semibold min-w-[200px]">
                      {language === 'vi' ? 'Tính Năng' : language === 'ja' ? '機能' : 'Features'}
                    </th>
                    {compareList.map((product) => (
                      <th key={product._id} className="p-4 text-center font-semibold min-w-[250px] relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => removeFromCompare(product._id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <div className="pt-8">
                          <img
                            src={product.images[0] || '/placeholder.svg'}
                            alt={getProductName(product)}
                            className="w-32 h-32 object-cover mx-auto mb-4 rounded-lg"
                          />
                          <h3 className="font-semibold mb-2">{getProductName(product)}</h3>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Price */}
                  <tr className="border-b">
                    <td className="p-4 font-medium">{t.price}</td>
                    {compareList.map((product) => (
                      <td key={product._id} className="p-4 text-center">
                        <div className="space-y-1">
                          <div className="text-lg font-semibold">
                            {product.salePrice && product.salePrice < product.price ? formatCurrency(product.salePrice, language) : formatCurrency(product.price, language)}
                          </div>
                          {product.salePrice && product.salePrice < product.price && (
                            <div className="flex flex-col items-center space-y-1">
                              <span className="text-sm text-muted-foreground line-through">
                                {formatCurrency(product.price, language)}
                              </span>
                              <Badge variant="destructive" className="text-xs">
                                -{Math.round(((product.price - product.salePrice) / product.price) * 100)}% 
                                {language === 'vi' ? 'GIẢM' : language === 'ja' ? 'セール' : 'OFF'}
                              </Badge>
                            </div>
                          )}
                          {product.onSale && !(product.salePrice && product.salePrice < product.price) && (
                            <Badge variant="destructive" className="mt-1 text-xs">
                              {language === 'vi' ? 'KHUYẾN MÃI' : language === 'ja' ? 'セール' : 'SALE'}
                            </Badge>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Category */}
                  <tr className="border-b">
                    <td className="p-4 font-medium">{t.category}</td>
                    {compareList.map((product) => (
                      <td key={product._id} className="p-4 text-center">
                        {product.categoryId.name}
                      </td>
                    ))}
                  </tr>

                  {/* Rating */}
                  <tr className="border-b">
                    <td className="p-4 font-medium">{t.rating}</td>
                    {compareList.map((product) => (
                      <td key={product._id} className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>4.5</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Availability */}
                  <tr className="border-b">
                    <td className="p-4 font-medium">{t.availability}</td>
                    {compareList.map((product) => (
                      <td key={product._id} className="p-4 text-center">
                        <Badge variant={product.stock > 0 ? "default" : "secondary"}>
                          {product.stock > 0 ? t.inStock : t.outOfStock}
                        </Badge>
                      </td>
                    ))}
                  </tr>

                  {/* Description */}
                  <tr className="border-b">
                    <td className="p-4 font-medium">{t.description}</td>
                    {compareList.map((product) => (
                      <td key={product._id} className="p-4 text-center">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {product.description}
                        </p>
                      </td>
                    ))}
                  </tr>

                  {/* Actions */}
                  <tr>
                    <td className="p-4 font-medium">{language === 'vi' ? 'Thao Tác' : language === 'ja' ? '操作' : 'Actions'}</td>
                    {compareList.map((product) => (
                      <td key={product._id} className="p-4 text-center">
                        <div className="space-y-2">
                          <Button size="sm" className="w-full">
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {t.addToCart}
                          </Button>
                          <Button variant="outline" size="sm" className="w-full">
                            <Heart className="h-4 w-4 mr-2" />
                            {t.addToWishlist}
                          </Button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ComparePage; 
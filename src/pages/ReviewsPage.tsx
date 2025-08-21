import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { api, Review, CreateReviewRequest } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Star, 
  ThumbsUp, 
  MessageCircle, 
  User,
  Calendar,
  Send,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const ReviewsPage = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: ''
  });

  // Load reviews from API
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setIsLoading(true);
        const response = await api.getReviews({ limit: 50 });
        setReviews(response.reviews);
      } catch (error) {
        console.error('Error loading reviews:', error);
        toast({
          title: language === 'vi' ? "Lỗi tải đánh giá" : 
                 language === 'ja' ? "レビュー読み込みエラー" : 
                 "Error Loading Reviews",
          description: language === 'vi' ? "Không thể tải danh sách đánh giá" :
                       language === 'ja' ? "レビューリストを読み込めませんでした" :
                       "Unable to load reviews",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadReviews();
  }, [toast, language]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: language === 'vi' ? "Cần đăng nhập" : 
               language === 'ja' ? "ログインが必要です" : 
               "Login Required",
        description: language === 'vi' ? "Vui lòng đăng nhập để viết đánh giá" :
                     language === 'ja' ? "レビューを書くにはログインしてください" :
                     "Please login to write a review",
        variant: "destructive",
      });
      return;
    }

    if (!newReview.title.trim() || !newReview.comment.trim()) {
      toast({
        title: language === 'vi' ? "Thông tin không đầy đủ" : 
               language === 'ja' ? "情報が不完全です" : 
               "Incomplete Information",
        description: language === 'vi' ? "Vui lòng điền đầy đủ tiêu đề và nội dung" :
                     language === 'ja' ? "タイトルと内容を入力してください" :
                     "Please fill in title and content",
        variant: "destructive",
      });
      return;
    }

    try {
      const reviewData: CreateReviewRequest = {
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment
      };

      const response = await api.createReview(reviewData);
      
      // Reload reviews to show the new one
      const updatedReviews = await api.getReviews({ limit: 50 });
      setReviews(updatedReviews.reviews);
      
      setNewReview({ rating: 5, title: '', comment: '' });
      setShowReviewForm(false);

      toast({
        title: language === 'vi' ? "Đánh giá đã được gửi" : 
               language === 'ja' ? "レビューが送信されました" : 
               "Review Submitted",
        description: language === 'vi' ? "Cảm ơn bạn đã chia sẻ đánh giá" :
                     language === 'ja' ? "レビューを共有していただきありがとうございます" :
                     "Thank you for sharing your review",
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: language === 'vi' ? "Lỗi gửi đánh giá" : 
               language === 'ja' ? "レビュー送信エラー" : 
               "Error Submitting Review",
        description: language === 'vi' ? "Không thể gửi đánh giá. Vui lòng thử lại" :
                     language === 'ja' ? "レビューを送信できませんでした。再試行してください" :
                     "Unable to submit review. Please try again",
        variant: "destructive",
      });
    }
  };

  const handleHelpful = async (reviewId: string) => {
    try {
      await api.markReviewHelpful(reviewId);
      
      // Update the helpful count locally
      setReviews(prev => prev.map(review => 
        review._id === reviewId 
          ? { ...review, helpful: review.helpful + 1 }
          : review
      ));

      toast({
        title: language === 'vi' ? "Đã đánh dấu hữu ích" : 
               language === 'ja' ? "役立ったとしてマーク" : 
               "Marked as Helpful",
        description: language === 'vi' ? "Cảm ơn phản hồi của bạn" :
                     language === 'ja' ? "フィードバックありがとうございます" :
                     "Thank you for your feedback",
      });
    } catch (error) {
      console.error('Error marking review helpful:', error);
      toast({
        title: language === 'vi' ? "Lỗi" : 
               language === 'ja' ? "エラー" : 
               "Error",
        description: language === 'vi' ? "Không thể đánh dấu đánh giá" :
                     language === 'ja' ? "レビューをマークできませんでした" :
                     "Unable to mark review",
        variant: "destructive",
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const translations = {
    en: {
      title: "Customer Reviews",
      subtitle: "See what our customers say about our products",
      writeReview: "Write a Review",
      overallRating: "Overall Rating",
      totalReviews: "Total Reviews",
      verified: "Verified Purchase",
      helpful: "Helpful",
      submit: "Submit Review",
      cancel: "Cancel",
      rating: "Rating",
      titleLabel: "Review Title",
      titlePlaceholder: "Brief summary of your experience",
      commentLabel: "Review",
      commentPlaceholder: "Share your experience with this product",
      noReviews: "No reviews yet",
      noReviewsDesc: "Be the first to share your experience",
      loading: "Loading reviews...",
      averageRating: "Average Rating"
    },
    vi: {
      title: "Đánh Giá Khách Hàng",
      subtitle: "Xem khách hàng nói gì về sản phẩm của chúng tôi",
      writeReview: "Viết Đánh Giá",
      overallRating: "Đánh Giá Tổng Quan",
      totalReviews: "Tổng Số Đánh Giá",
      verified: "Đã Xác Minh",
      helpful: "Hữu Ích",
      submit: "Gửi Đánh Giá",
      cancel: "Hủy",
      rating: "Đánh Giá",
      titleLabel: "Tiêu Đề Đánh Giá",
      titlePlaceholder: "Tóm tắt ngắn gọn về trải nghiệm của bạn",
      commentLabel: "Nội Dung Đánh Giá",
      commentPlaceholder: "Chia sẻ trải nghiệm của bạn với sản phẩm này",
      noReviews: "Chưa có đánh giá nào",
      noReviewsDesc: "Hãy là người đầu tiên chia sẻ trải nghiệm",
      loading: "Đang tải đánh giá...",
      averageRating: "Đánh Giá Trung Bình"
    },
    ja: {
      title: "お客様のレビュー",
      subtitle: "お客様の商品についての感想をご覧ください",
      writeReview: "レビューを書く",
      overallRating: "総合評価",
      totalReviews: "レビュー総数",
      verified: "購入済み",
      helpful: "役立った",
      submit: "レビューを送信",
      cancel: "キャンセル",
      rating: "評価",
      titleLabel: "レビュータイトル",
      titlePlaceholder: "体験の簡単な要約",
      commentLabel: "レビュー",
      commentPlaceholder: "この商品についての体験を共有してください",
      noReviews: "まだレビューがありません",
      noReviewsDesc: "最初の体験を共有してください",
      loading: "レビューを読み込み中...",
      averageRating: "平均評価"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemsCount={0} onSearch={() => {}} />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <section className="relative overflow-hidden rounded-2xl mb-8">
            {/* Banner Background */}
            <div className="absolute inset-0">
              <img 
                src="/images/categories/yukata.jpg" 
                alt="Reviews Banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50"></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10 p-8 text-center text-white">
              <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
              <p className="text-white/90">{t.subtitle}</p>
            </div>
          </section>

          {/* Overall Rating */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="flex justify-center mb-2">
                    {renderStars(Math.round(averageRating))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t.averageRating}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">
                    {reviews.length}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t.totalReviews}
                  </p>
                </div>

                <Button 
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="hidden md:block"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {t.writeReview}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Review Form */}
          {showReviewForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{t.writeReview}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t.rating}
                    </label>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setNewReview(prev => ({ ...prev, rating: i + 1 }))}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              i < newReview.rating 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t.titleLabel}
                    </label>
                    <Input
                      value={newReview.title}
                      onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={t.titlePlaceholder}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t.commentLabel}
                    </label>
                    <Textarea
                      value={newReview.comment}
                      onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder={t.commentPlaceholder}
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">
                      <Send className="mr-2 h-4 w-4" />
                      {t.submit}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowReviewForm(false)}
                    >
                      {t.cancel}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Reviews List */}
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">{t.loading}</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">{t.noReviews}</h2>
              <p className="text-muted-foreground mb-8">{t.noReviewsDesc}</p>
              <Button onClick={() => setShowReviewForm(true)}>
                {t.writeReview}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <Card key={review._id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{review.userId?.name || 'Anonymous User'}</h3>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <div className="flex">
                              {renderStars(review.rating)}
                            </div>
                            <span>•</span>
                            <span>{formatDate(review.createdAt)}</span>
                            {review.verified && (
                              <>
                                <span>•</span>
                                <Badge variant="secondary" className="text-xs">
                                  {t.verified}
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">{review.title}</h4>
                      <p className="text-muted-foreground">{review.comment}</p>
                      
                      {review.productId && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Product:</span> {review.productId?.name || 'Unknown Product'}
                        </p>
                      )}
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleHelpful(review._id)}
                      >
                        <ThumbsUp className="mr-2 h-4 w-4" />
                        {t.helpful} ({review.helpful})
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ReviewsPage; 
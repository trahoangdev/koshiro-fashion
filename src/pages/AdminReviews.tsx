import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { api, Review } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Star, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  ThumbsUp,
  User,
  Package
} from 'lucide-react';

const AdminReviews = () => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState({
    userId: '',
    productId: '',
    rating: 5,
    title: '',
    comment: '',
    verified: false
  });

  // Load reviews
  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const response = await api.getReviews({ limit: 100 });
      setReviews(response.reviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast({
        title: "Error Loading Reviews",
        description: "Failed to load reviews data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.userId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.productId?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;
    const matchesVerified = verifiedFilter === 'all' || 
      (verifiedFilter === 'verified' && review.verified) ||
      (verifiedFilter === 'unverified' && !review.verified);

    return matchesSearch && matchesRating && matchesVerified;
  });

  // Handle review actions
  const handleCreateReview = async () => {
    try {
      await api.createReview({
        productId: formData.productId,
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment
      });
      
      toast({
        title: "✅ Review Created",
        description: "New review has been created successfully"
      });
      
      setIsCreateDialogOpen(false);
      resetForm();
      await loadReviews();
    } catch (error) {
      console.error('Error creating review:', error);
      toast({
        title: "❌ Creation Failed",
        description: "Failed to create review",
        variant: "destructive"
      });
    }
  };

  const handleUpdateReview = async () => {
    if (!currentReview) return;
    
    try {
      await api.updateReview(currentReview._id, {
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment,
        verified: formData.verified
      });
      
      toast({
        title: "✅ Review Updated",
        description: "Review has been updated successfully"
      });
      
      setIsEditDialogOpen(false);
      setCurrentReview(null);
      resetForm();
      await loadReviews();
    } catch (error) {
      console.error('Error updating review:', error);
      toast({
        title: "❌ Update Failed",
        description: "Failed to update review",
        variant: "destructive"
      });
    }
  };

  const handleDeleteReview = async () => {
    if (!currentReview) return;
    
    try {
      await api.deleteReview(currentReview._id);
      
      toast({
        title: "✅ Review Deleted",
        description: "Review has been deleted successfully"
      });
      
      setIsDeleteDialogOpen(false);
      setCurrentReview(null);
      await loadReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: "❌ Delete Failed",
        description: "Failed to delete review",
        variant: "destructive"
      });
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedReviews.length === 0) {
      toast({
        title: "⚠️ No Selection",
        description: "Please select reviews to perform bulk action",
        variant: "destructive"
      });
      return;
    }

    try {
      switch (action) {
        case 'verify':
          await Promise.all(selectedReviews.map(id => 
            api.updateReview(id, { verified: true })
          ));
          toast({
            title: "✅ Reviews Verified",
            description: `${selectedReviews.length} reviews marked as verified`
          });
          break;
        case 'unverify':
          await Promise.all(selectedReviews.map(id => 
            api.updateReview(id, { verified: false })
          ));
          toast({
            title: "✅ Reviews Unverified",
            description: `${selectedReviews.length} reviews marked as unverified`
          });
          break;
        case 'delete':
          await Promise.all(selectedReviews.map(id => api.deleteReview(id)));
          toast({
            title: "✅ Reviews Deleted",
            description: `${selectedReviews.length} reviews deleted`
          });
          break;
      }
      
      setSelectedReviews([]);
      await loadReviews();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast({
        title: "❌ Bulk Action Failed",
        description: "Failed to perform bulk action",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (review: Review) => {
    setCurrentReview(review);
    setFormData({
      userId: review.userId?._id || '',
      productId: review.productId?._id || '',
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      verified: review.verified
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (review: Review) => {
    setCurrentReview(review);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (review: Review) => {
    setCurrentReview(review);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      productId: '',
      rating: 5,
      title: '',
      comment: '',
      verified: false
    });
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate stats
  const totalReviews = reviews.length;
  const verifiedReviews = reviews.filter(r => r.verified).length;
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  const recentReviews = reviews.filter(r => {
    const reviewDate = new Date(r.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return reviewDate > weekAgo;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reviews Management</h1>
          <p className="text-muted-foreground">Manage customer reviews and ratings</p>
        </div>
        <Button onClick={() => { resetForm(); setIsCreateDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Review
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold">{totalReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold">{verifiedReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">{averageRating}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{recentReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>

            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setRatingFilter('all');
              setVerifiedFilter('all');
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedReviews.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedReviews.length} review(s) selected
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('verify')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('unverify')}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Unverify
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews ({filteredReviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading reviews...</div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reviews found matching your criteria
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedReviews.length === filteredReviews.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedReviews(filteredReviews.map(r => r._id));
                          } else {
                            setSelectedReviews([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map((review) => (
                    <TableRow key={review._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedReviews.includes(review._id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedReviews([...selectedReviews, review._id]);
                            } else {
                              setSelectedReviews(selectedReviews.filter(id => id !== review._id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{review.title}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {review.comment}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{review.userId?.name || 'Anonymous'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{review.productId?.name || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                          <span className="text-sm ml-2">{review.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <Badge variant={review.verified ? "default" : "secondary"}>
                            {review.verified ? "Verified" : "Unverified"}
                          </Badge>
                          {review.helpful > 0 && (
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <ThumbsUp className="h-3 w-3" />
                              <span>{review.helpful}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{formatDate(review.createdAt)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => openViewDialog(review)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openEditDialog(review)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openDeleteDialog(review)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Product ID</label>
              <Input
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                placeholder="Enter product ID"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Rating</label>
              <Select value={formData.rating.toString()} onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Review title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Comment</label>
              <Textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Review comment"
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateReview}>
                Create Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Rating</label>
              <Select value={formData.rating.toString()} onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Review title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Comment</label>
              <Textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Review comment"
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.verified}
                onCheckedChange={(checked) => setFormData({ ...formData, verified: !!checked })}
              />
              <label className="text-sm font-medium">Verified Review</label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateReview}>
                Update Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {currentReview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {renderStars(currentReview.rating)}
                  <span className="font-medium">{currentReview.rating}/5</span>
                </div>
                <Badge variant={currentReview.verified ? "default" : "secondary"}>
                  {currentReview.verified ? "Verified" : "Unverified"}
                </Badge>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg">{currentReview.title}</h3>
                <p className="text-muted-foreground mt-2">{currentReview.comment}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User</label>
                  <p>{currentReview.userId?.name || 'Anonymous'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Product</label>
                  <p>{currentReview.productId?.name || 'Unknown Product'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p>{formatDate(currentReview.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Helpful Votes</label>
                  <p>{currentReview.helpful}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReview} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminReviews;

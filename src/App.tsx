import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import ProductDetail from "./pages/ProductDetail";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import CheckoutPage from "./pages/CheckoutPage";
import SalePage from "./pages/SalePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import CategoriesPage from "./pages/CategoriesPage";
import InfoPage from "./pages/InfoPage";
import SearchPage from "./pages/SearchPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import ComparePage from "./pages/ComparePage";
import ReviewsPage from "./pages/ReviewsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SizeGuidePage from "./pages/SizeGuidePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";

// Admin Pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import AdminReportsPage from "./pages/AdminReportsPage";
import AdminNotificationsPage from "./pages/AdminNotificationsPage";
import AdminProducts from "./pages/AdminProducts";
import AdminCategories from "./pages/AdminCategories";
import AdminOrders from "./pages/AdminOrders";
import AdminUsers from "./pages/AdminUsers";
import AdminActivity from "./pages/AdminActivity";
import AdminReviews from "./pages/AdminReviews";
import AdminSettings from "./pages/AdminSettings";
import AdminPromotionsPage from "./pages/AdminPromotionsPage";
import AdminInventoryPage from "./pages/AdminInventoryPage";
import AdminShippingPage from "./pages/AdminShippingPage";
import AdminPaymentsPage from "./pages/AdminPaymentsPage";
import AdminRolesPage from "./pages/AdminRolesPage";
import AdminApiPage from "./pages/AdminApiPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Router>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/sale" element={<SalePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/info/:pageType" element={<InfoPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/order-tracking" element={<OrderTrackingPage />} />
                <Route path="/order-tracking/:id" element={<OrderTrackingPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/reviews" element={<ReviewsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/size-guide" element={<SizeGuidePage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

                {/* Admin Routes - Wrapped with NotificationsProvider */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={
                  <NotificationsProvider>
                    <ProtectedAdminRoute>
                      <AdminDashboard />
                    </ProtectedAdminRoute>
                  </NotificationsProvider>
                } />
                <Route path="/admin/analytics" element={
                  <NotificationsProvider>
                    <ProtectedAdminRoute>
                      <AdminAnalyticsPage />
                    </ProtectedAdminRoute>
                  </NotificationsProvider>
                } />
                <Route path="/admin/reports" element={
                  <NotificationsProvider>
                    <ProtectedAdminRoute>
                      <AdminReportsPage />
                    </ProtectedAdminRoute>
                  </NotificationsProvider>
                } />
                <Route path="/admin/notifications" element={
                  <NotificationsProvider>
                    <ProtectedAdminRoute>
                      <AdminNotificationsPage />
                    </ProtectedAdminRoute>
                  </NotificationsProvider>
                } />
                <Route path="/admin/products" element={
                  <NotificationsProvider>
                    <ProtectedAdminRoute>
                      <AdminProducts />
                    </ProtectedAdminRoute>
                  </NotificationsProvider>
                } />
                <Route path="/admin/categories" element={
                  <NotificationsProvider>
                    <ProtectedAdminRoute>
                      <AdminCategories />
                    </ProtectedAdminRoute>
                  </NotificationsProvider>
                } />
                <Route path="/admin/orders" element={
                  <NotificationsProvider>
                    <ProtectedAdminRoute>
                      <AdminOrders />
                    </ProtectedAdminRoute>
                  </NotificationsProvider>
                } />
                <Route path="/admin/users" element={
                  <NotificationsProvider>
                    <ProtectedAdminRoute>
                      <AdminUsers />
                    </ProtectedAdminRoute>
                  </NotificationsProvider>
                } />
                <Route path="/admin/activity" element={
                  <NotificationsProvider>
                    <ProtectedAdminRoute>
                      <AdminActivity />
                    </ProtectedAdminRoute>
                  </NotificationsProvider>
                } />
                <Route path="/admin/reviews" element={
                  <NotificationsProvider>
                    <ProtectedAdminRoute>
                      <AdminReviews />
                    </ProtectedAdminRoute>
                  </NotificationsProvider>
                } />
                <Route path="/admin/settings" element={
                  <NotificationsProvider>
                    <ProtectedAdminRoute>
                      <AdminSettings />
                    </ProtectedAdminRoute>
                  </NotificationsProvider>
                } />
                <Route path="/admin/promotions" element={
                  <NotificationsProvider>
                    <ProtectedAdminRoute>
                      <AdminPromotionsPage />
                    </ProtectedAdminRoute>
                  </NotificationsProvider>
                } />
                <Route path="/admin/inventory" element={
                  <NotificationsProvider>
                    <ProtectedAdminRoute>
                      <AdminInventoryPage />
                    </ProtectedAdminRoute>
                  </NotificationsProvider>
                } />
                <Route path="/admin/shipping" element={
                  <NotificationsProvider>
                    <ProtectedAdminRoute>
                      <AdminShippingPage />
                    </ProtectedAdminRoute>
                  </NotificationsProvider>
                } />
                <Route path="/admin/payments" element={
                  <NotificationsProvider>
                    <ProtectedAdminRoute>
                      <AdminPaymentsPage />
                    </ProtectedAdminRoute>
                  </NotificationsProvider>
                } />
                <Route path="/admin/roles" element={
                  <NotificationsProvider>
                    <ProtectedAdminRoute>
                      <AdminRolesPage />
                    </ProtectedAdminRoute>
                  </NotificationsProvider>
                } />
                <Route path="/admin/api" element={
                  <NotificationsProvider>
                    <ProtectedAdminRoute>
                      <AdminApiPage />
                    </ProtectedAdminRoute>
                  </NotificationsProvider>
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

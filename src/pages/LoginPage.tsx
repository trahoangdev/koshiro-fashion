import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const translations = {
    en: {
      title: "Welcome Back",
      subtitle: "Sign in to your account to continue",
      email: "Email",
      password: "Password",
      login: "Sign In",
      forgotPassword: "Forgot Password?",
      noAccount: "Don't have an account?",
      signUp: "Sign Up",
      or: "or",
      continueWithGoogle: "Continue with Google",
      continueWithFacebook: "Continue with Facebook",
      emailRequired: "Email is required",
      passwordRequired: "Password is required",
      invalidEmail: "Please enter a valid email",
      loginSuccess: "Login successful!",
      loginError: "Invalid email or password"
    },
    vi: {
      title: "Chào Mừng Trở Lại",
      subtitle: "Đăng nhập vào tài khoản để tiếp tục",
      email: "Email",
      password: "Mật Khẩu",
      login: "Đăng Nhập",
      forgotPassword: "Quên Mật Khẩu?",
      noAccount: "Chưa có tài khoản?",
      signUp: "Đăng Ký",
      or: "hoặc",
      continueWithGoogle: "Tiếp Tục Với Google",
      continueWithFacebook: "Tiếp Tục Với Facebook",
      emailRequired: "Email là bắt buộc",
      passwordRequired: "Mật khẩu là bắt buộc",
      invalidEmail: "Vui lòng nhập email hợp lệ",
      loginSuccess: "Đăng nhập thành công!",
      loginError: "Email hoặc mật khẩu không đúng"
    },
    ja: {
      title: "おかえりなさい",
      subtitle: "アカウントにサインインして続行",
      email: "メール",
      password: "パスワード",
      login: "サインイン",
      forgotPassword: "パスワードを忘れましたか？",
      noAccount: "アカウントをお持ちでない方は",
      signUp: "サインアップ",
      or: "または",
      continueWithGoogle: "Googleで続行",
      continueWithFacebook: "Facebookで続行",
      emailRequired: "メールは必須です",
      passwordRequired: "パスワードは必須です",
      invalidEmail: "有効なメールを入力してください",
      loginSuccess: "ログインに成功しました！",
      loginError: "メールまたはパスワードが無効です"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.email) {
      toast({
        title: "Error",
        description: t.emailRequired,
        variant: "destructive"
      });
      return false;
    }
    if (!formData.password) {
      toast({
        title: "Error",
        description: t.passwordRequired,
        variant: "destructive"
      });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Error",
        description: t.invalidEmail,
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any valid email/password
      if (formData.email && formData.password) {
        toast({
          title: "Success",
          description: t.loginSuccess
        });
        navigate("/");
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: t.loginError,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-zen">
      <Header cartItemsCount={0} onSearch={() => {}} />
      
      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">{t.title}</CardTitle>
                <p className="text-muted-foreground">{t.subtitle}</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t.email}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">{t.password}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      {t.forgotPassword}
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : t.login}
                  </Button>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        {t.or}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Button variant="outline" className="w-full" disabled={isLoading}>
                      <User className="mr-2 h-4 w-4" />
                      {t.continueWithGoogle}
                    </Button>
                    <Button variant="outline" className="w-full" disabled={isLoading}>
                      <User className="mr-2 h-4 w-4" />
                      {t.continueWithFacebook}
                    </Button>
                  </div>
                </div>

                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">{t.noAccount} </span>
                  <Link to="/register" className="text-primary hover:underline font-medium">
                    {t.signUp}
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 
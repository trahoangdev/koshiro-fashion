import { useState } from "react";
import { Eye, EyeOff, Lock, User, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState("vi");
  const { adminLogin, isLoading } = useAuth();
  const navigate = useNavigate();

  const translations = {
    en: {
      title: "KOSHIRO Admin",
      subtitle: "Login to dashboard",
      email: "Email",
      password: "Password",
      login: "Login",
      loggingIn: "Logging in...",
      loginSuccess: "Login successful",
      welcomeBack: "Welcome back to Admin Dashboard",
      loginFailed: "Login failed",
      invalidCredentials: "Invalid email or password",
      demoCredentials: "Demo credentials:"
    },
    vi: {
      title: "KOSHIRO Admin",
      subtitle: "Đăng nhập vào bảng điều khiển",
      email: "Email",
      password: "Mật khẩu",
      login: "Đăng nhập",
      loggingIn: "Đang đăng nhập...",
      loginSuccess: "Đăng nhập thành công",
      welcomeBack: "Chào mừng trở lại Admin Dashboard",
      loginFailed: "Đăng nhập thất bại",
      invalidCredentials: "Email hoặc mật khẩu không chính xác",
      demoCredentials: "Thông tin demo:"
    },
    ja: {
      title: "KOSHIRO Admin",
      subtitle: "ダッシュボードにログイン",
      email: "メール",
      password: "パスワード",
      login: "ログイン",
      loggingIn: "ログイン中...",
      loginSuccess: "ログイン成功",
      welcomeBack: "管理ダッシュボードへようこそ",
      loginFailed: "ログイン失敗",
      invalidCredentials: "メールまたはパスワードが正しくありません",
      demoCredentials: "デモ認証情報:"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.vi;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log('Starting admin login...');
      await adminLogin(email, password);
      console.log('Admin login successful, navigating to /admin');
      localStorage.setItem("adminLanguage", language);
      
      // Add a small delay to ensure state is updated
      setTimeout(() => {
        console.log('Navigating to admin dashboard...');
        navigate("/admin");
      }, 100);
    } catch (error) {
      // Error handling is done in AuthContext
      console.error('Admin login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-zen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-2xl font-bold flex-1">{t.title}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setLanguage('en')}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('vi')}>
                  Tiếng Việt
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('ja')}>
                  日本語
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@koshiro.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{t.password}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t.loggingIn : t.login}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground mb-2">{t.demoCredentials}</p>
            <p className="text-sm">Email: admin@koshiro.com</p>
            <p className="text-sm">Password: admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
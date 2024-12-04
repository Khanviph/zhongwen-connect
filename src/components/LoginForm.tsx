import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface LoginFormProps {
  onSuccess: () => void;
}

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("access_password")
        .single();

      if (error) throw error;

      if (data.access_password === password) {
        localStorage.setItem("isAuthenticated", "true");
        onSuccess();
        toast({
          title: "登录成功",
          description: "欢迎使用SM积分记账系统",
        });
      } else {
        toast({
          title: "密码错误",
          description: "请输入正确的访问密码",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "登录失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold">SM积分记账系统</h2>
          <p className="mt-2 text-center text-gray-600">请输入访问密码</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="访问密码"
            required
          />
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "验证中..." : "登录"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
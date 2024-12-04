import { useState, useEffect } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import LoginForm from "@/components/LoginForm";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";

interface Transaction {
  id: number;
  type: string;
  account: string;
  points: number;
  unit_price: number;
  total_amount: number;
  username: string;
  status: "已结款" | "未结款";
  date: string;
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "错误",
        description: "获取记录失败",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem("isAuthenticated");
      setIsAuthenticated(auth === "true");
    };

    checkAuth();
    if (isAuthenticated) {
      fetchTransactions();
    }
  }, [isAuthenticated]);

  const handleShare = () => {
    const blob = new Blob([JSON.stringify(transactions, null, 2)], {
      type: "text/plain",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sm积分记录.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "导出成功",
      description: "数据已保存到文件",
    });
  };

  if (!isAuthenticated) {
    return <LoginForm onSuccess={() => setIsAuthenticated(true)} />;
  }

  const total = transactions.reduce((acc, curr) => acc + curr.total_amount, 0);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">SM积分记账系统</h1>
        <Button
          onClick={handleShare}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          导出数据
        </Button>
      </div>

      <TransactionForm onSuccess={fetchTransactions} />

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">总览</h2>
        <p className="text-2xl font-bold text-blue-600">
          总金额: ¥{total.toFixed(2)}
        </p>
      </div>

      <TransactionList
        transactions={transactions}
        onUpdate={fetchTransactions}
      />
    </div>
  );
};

export default Index;
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface TransactionFormProps {
  onSuccess: () => void;
}

const TransactionForm = ({ onSuccess }: TransactionFormProps) => {
  const [account, setAccount] = useState("");
  const [points, setPoints] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<"已结款" | "未结款">("未结款");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account || !points || !unitPrice || !username) {
      toast({
        title: "错误",
        description: "请填写完整信息",
        variant: "destructive",
      });
      return;
    }

    const pointsNum = Number(points);
    const priceNum = Number(unitPrice);
    
    try {
      const { error } = await supabase.from("transactions").insert({
        type: "sm积分",
        account,
        points: pointsNum,
        unit_price: priceNum,
        total_amount: pointsNum * priceNum,
        username,
        status,
      });

      if (error) throw error;

      setAccount("");
      setPoints("");
      setUnitPrice("");
      setUsername("");
      setStatus("未结款");
      
      onSuccess();

      toast({
        title: "成功",
        description: "记录已添加",
      });
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast({
        title: "错误",
        description: "添加记录失败",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder="账号"
          />
          <Input
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            placeholder="积分"
            min="0"
          />
          <Input
            type="number"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            placeholder="单价"
            min="0"
            step="0.001"
          />
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="用户"
          />
          <Select value={status} onValueChange={(value: "已结款" | "未结款") => setStatus(value)}>
            <SelectTrigger>
              <SelectValue placeholder="选择状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="已结款">已结款</SelectItem>
              <SelectItem value="未结款">未结款</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full">
          添加记录
        </Button>
      </form>
    </div>
  );
};

export default TransactionForm;
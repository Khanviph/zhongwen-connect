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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

interface Transaction {
  id: number;
  type: "收入" | "支出";
  amount: number;
  description: string;
  date: string;
}

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"收入" | "支出">("支出");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description) {
      toast({
        title: "错误",
        description: "请填写完整信息",
        variant: "destructive",
      });
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now(),
      type,
      amount: Number(amount),
      description,
      date: new Date().toLocaleDateString("zh-CN"),
    };

    setTransactions([newTransaction, ...transactions]);
    setAmount("");
    setDescription("");

    toast({
      title: "成功",
      description: "记录已添加",
    });
  };

  const total = transactions.reduce(
    (acc, curr) => acc + (curr.type === "收入" ? curr.amount : -curr.amount),
    0
  );

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">记账本</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={type} onValueChange={(value: "收入" | "支出") => setType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="选择类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="收入">收入</SelectItem>
                <SelectItem value="支出">支出</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="金额"
              min="0"
              step="0.01"
            />

            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述"
            />
          </div>

          <Button type="submit" className="w-full">
            添加记录
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">总览</h2>
        <p className={`text-2xl font-bold ${total >= 0 ? "text-green-600" : "text-red-600"}`}>
          总计: ¥{total.toFixed(2)}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">交易记录</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>日期</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>描述</TableHead>
              <TableHead className="text-right">金额</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>{transaction.type}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell className={`text-right ${
                  transaction.type === "收入" ? "text-green-600" : "text-red-600"
                }`}>
                  ¥{transaction.amount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Index;
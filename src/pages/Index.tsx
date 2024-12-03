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
  type: string;
  account: string;
  points: number;
  unitPrice: number;
  totalAmount: number;
  username: string;
  status: "已结款" | "未结款";
  date: string;
}

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [account, setAccount] = useState("");
  const [points, setPoints] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<"已结款" | "未结款">("未结款");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
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
    
    const newTransaction: Transaction = {
      id: Date.now(),
      type: "sm积分",
      account,
      points: pointsNum,
      unitPrice: priceNum,
      totalAmount: pointsNum * priceNum,
      username,
      status,
      date: new Date().toLocaleString("zh-CN", {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }),
    };

    setTransactions([newTransaction, ...transactions]);
    setAccount("");
    setPoints("");
    setUnitPrice("");
    setUsername("");

    toast({
      title: "成功",
      description: "记录已添加",
    });
  };

  const total = transactions.reduce((acc, curr) => acc + curr.totalAmount, 0);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold text-center mb-8">SM积分记账系统</h1>

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

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">总览</h2>
        <p className="text-2xl font-bold text-blue-600">
          总金额: ¥{total.toFixed(2)}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">交易记录</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>记录 #</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>账号</TableHead>
                <TableHead>积分</TableHead>
                <TableHead>单价</TableHead>
                <TableHead>总额</TableHead>
                <TableHead>用户</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction, index) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transactions.length - index}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{transaction.account}</TableCell>
                  <TableCell>{transaction.points}</TableCell>
                  <TableCell>{transaction.unitPrice}</TableCell>
                  <TableCell>¥{transaction.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>{transaction.username}</TableCell>
                  <TableCell>
                    <span className={transaction.status === "已结款" ? "text-green-600" : "text-red-600"}>
                      {transaction.status}
                    </span>
                  </TableCell>
                  <TableCell>{transaction.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Index;
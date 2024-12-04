import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

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

interface TransactionListProps {
  transactions: Transaction[];
  onUpdate: () => void;
}

const TransactionList = ({ transactions, onUpdate }: TransactionListProps) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});
  const { toast } = useToast();

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditForm(transaction);
  };

  const handleSave = async () => {
    if (!editForm || !editingId) return;

    try {
      const { error } = await supabase
        .from("transactions")
        .update({
          account: editForm.account,
          points: editForm.points,
          unit_price: editForm.unit_price,
          total_amount: Number(editForm.points) * Number(editForm.unit_price),
          username: editForm.username,
          status: editForm.status,
        })
        .eq("id", editingId);

      if (error) throw error;

      setEditingId(null);
      setEditForm({});
      onUpdate();

      toast({
        title: "成功",
        description: "记录已更新",
      });
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast({
        title: "错误",
        description: "更新记录失败",
        variant: "destructive",
      });
    }
  };

  return (
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
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction, index) => (
              <TableRow key={transaction.id}>
                <TableCell>{transactions.length - index}</TableCell>
                <TableCell>{transaction.type}</TableCell>
                <TableCell>
                  {editingId === transaction.id ? (
                    <Input
                      value={editForm.account}
                      onChange={(e) =>
                        setEditForm({ ...editForm, account: e.target.value })
                      }
                    />
                  ) : (
                    transaction.account
                  )}
                </TableCell>
                <TableCell>
                  {editingId === transaction.id ? (
                    <Input
                      type="number"
                      value={editForm.points}
                      onChange={(e) =>
                        setEditForm({ ...editForm, points: Number(e.target.value) })
                      }
                    />
                  ) : (
                    transaction.points
                  )}
                </TableCell>
                <TableCell>
                  {editingId === transaction.id ? (
                    <Input
                      type="number"
                      value={editForm.unit_price}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          unit_price: Number(e.target.value),
                        })
                      }
                      step="0.001"
                    />
                  ) : (
                    transaction.unit_price
                  )}
                </TableCell>
                <TableCell>
                  ¥{(transaction.total_amount).toFixed(2)}
                </TableCell>
                <TableCell>
                  {editingId === transaction.id ? (
                    <Input
                      value={editForm.username}
                      onChange={(e) =>
                        setEditForm({ ...editForm, username: e.target.value })
                      }
                    />
                  ) : (
                    transaction.username
                  )}
                </TableCell>
                <TableCell>
                  {editingId === transaction.id ? (
                    <select
                      value={editForm.status}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          status: e.target.value as "已结款" | "未结款",
                        })
                      }
                      className="border rounded px-2 py-1"
                    >
                      <option value="已结款">已结款</option>
                      <option value="未结款">未结款</option>
                    </select>
                  ) : (
                    <span
                      className={
                        transaction.status === "已结款"
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {transaction.status}
                    </span>
                  )}
                </TableCell>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>
                  {editingId === transaction.id ? (
                    <Button onClick={handleSave} size="sm">
                      保存
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleEdit(transaction)}
                      variant="outline"
                      size="sm"
                    >
                      编辑
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TransactionList;
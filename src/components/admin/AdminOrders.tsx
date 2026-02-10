import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

const statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const statusColor: Record<string, string> = {
  pending: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
  confirmed: "bg-blue-600/20 text-blue-400 border-blue-600/30",
  shipped: "bg-purple-600/20 text-purple-400 border-purple-600/30",
  delivered: "bg-green-600/20 text-green-400 border-green-600/30",
  cancelled: "bg-red-600/20 text-red-400 border-red-600/30",
};

const AdminOrders = () => {
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Status updated");
    },
  });

  if (isLoading) return <p className="text-muted-foreground py-8">Loading orders...</p>;

  return (
    <div className="mt-4">
      {orders && orders.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="text-xs">{format(new Date(order.created_at), "dd/MM/yyyy HH:mm")}</TableCell>
                <TableCell>{order.customer_name}</TableCell>
                <TableCell>{order.customer_phone}</TableCell>
                <TableCell className="text-primary font-medium">{order.total_amount.toFixed(2)} EGP</TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onValueChange={(v) => updateStatus.mutate({ id: order.id, status: v })}
                  >
                    <SelectTrigger className="w-[130px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          <span className="capitalize">{s}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <OrderDetailsDialog orderId={order.id} address={order.customer_address} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-muted-foreground text-center py-10">No orders yet.</p>
      )}
    </div>
  );
};

const OrderDetailsDialog = ({ orderId, address }: { orderId: string; address: string }) => {
  const { data: items } = useQuery({
    queryKey: ["order-items", orderId],
    queryFn: async () => {
      const { data } = await supabase
        .from("order_items")
        .select("*, products(name, image_url)")
        .eq("order_id", orderId);
      return data ?? [];
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mb-4">Address: {address}</p>
        <div className="space-y-3">
          {items?.map((item: any) => (
            <div key={item.id} className="flex items-center gap-3 border rounded-lg p-3">
              <div className="h-10 w-10 rounded bg-secondary overflow-hidden flex-shrink-0">
                {item.products?.image_url && (
                  <img src={item.products.image_url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.products?.name ?? "Unknown"}</p>
                <p className="text-xs text-muted-foreground">Qty: {item.quantity} × {item.price_at_purchase.toFixed(2)} EGP</p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminOrders;

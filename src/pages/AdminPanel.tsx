import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminOrders from "@/components/admin/AdminOrders";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const AdminPanel = () => {
  const { isAdmin, loading, signOut } = useAuth();

  if (loading) return <div className="container py-20 text-center text-muted-foreground">Loading...</div>;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  return (
    <main className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Button variant="ghost" onClick={signOut} className="gap-2">
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          <AdminOrders />
        </TabsContent>
        <TabsContent value="products">
          <AdminProducts />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default AdminPanel;

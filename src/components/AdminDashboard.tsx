import React, { useState, useEffect } from "react";
import { 
  BarChart, 
  Coins, 
  Settings, 
  Layers, 
  Package, 
  Plus, 
  TrendingUp, 
  Truck, 
  Clock, 
  Edit3, 
  Trash2,
  ListRestart,
  CheckCircle,
  FileText
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from "recharts";
import { Product, Order } from "../types.ts";

interface AdminDashboardProps {
  token: string | null;
  onOpenAuth: () => void;
  onTriggerLog: () => void;
}

export default function AdminDashboard({ token, onOpenAuth, onTriggerLog }: AdminDashboardProps) {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // New product form states
  const [pName, setPName] = useState("");
  const [pCategory, setPCategory] = useState("toys");
  const [pPrice, setPPrice] = useState("");
  const [pDescription, setPDescription] = useState("");
  const [pSparkly, setPSparkly] = useState("");
  const [pAge, setPAge] = useState("");
  const [pFeatures, setPFeatures] = useState("");
  const [pStock, setPStock] = useState("");
  const [pImage, setPImage] = useState("");

  const [activeTab, setActiveTab] = useState<"metrics" | "orders" | "inventory">("metrics");

  const fetchAdminData = async () => {
    if (!token) return;
    try {
      const headers = { "Authorization": `Bearer ${token}` };
      
      // Fetch Metrics Overview
      const metRes = await fetch("/api/analytics/dashboard", { headers });
      const metData = await metRes.json();
      if (metData.totalSales !== undefined) {
        setMetrics(metData);
        if (metData.recentPurchases) {
          setOrders(metData.recentPurchases);
        }
      }

      // Fetch All products for simple CRUD list
      const prodRes = await fetch("/api/products");
      const prodData = await prodRes.json();
      if (prodData.products) {
        setProducts(prodData.products);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAdminData();
    }
  }, [token]);

  // Adjust stock count fast
  const handleUpdateStock = async (productId: string, newStock: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ stock: newStock })
      });
      if (res.ok) {
        setStatusMsg("Stock quantity updated successfully.");
        fetchAdminData();
        onTriggerLog();
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Product Submit
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !pName || !pPrice) return;

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: pName,
          category: pCategory,
          price: Number(pPrice),
          description: pDescription,
          sparklyIntro: pSparkly,
          ageGroup: pAge,
          features: pFeatures.split("\n").filter(f => f.trim() !== ""),
          image: pImage,
          stock: Number(pStock) || 10
        })
      });

      if (res.ok) {
        setStatusMsg(`Product "${pName}" successfully created and seeded!`);
        // Reset inputs
        setPName("");
        setPPrice("");
        setPDescription("");
        setPSparkly("");
        setPAge("");
        setPFeatures("");
        setPImage("");
        setPStock("");
        
        fetchAdminData();
        onTriggerLog();
        setTimeout(() => setStatusMsg(null), 4000);
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to create product.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete product action
  const handleDeleteProduct = async (productId: string) => {
    if (!token) return;
    if (!window.confirm("Are you sure you want to retire this product from the Kids Store?")) return;

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        setStatusMsg("Product successfully removed.");
        fetchAdminData();
        onTriggerLog();
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!token) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center space-y-4 max-w-md mx-auto my-12 shadow-sm">
        <Settings className="w-12 h-12 text-brand-pink animate-spin mx-auto opacity-75" />
        <h3 className="font-display font-bold text-lg text-slate-800">Caretaker Credentials Required</h3>
        <p className="text-slate-500 text-xs leading-relaxed">
          The Admin Dashboard features require a verified administrator account. Please sign in as the designated manager account.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2 bg-brand-pink hover:bg-brand-pink/90 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  const salesData = metrics?.salesHistoryChart && metrics.salesHistoryChart.length > 0 
    ? metrics.salesHistoryChart 
    : [
        { date: "May 20", sales: 64.48 },
        { date: "May 21", sales: 110.20 },
        { date: "May 22", sales: 85.50 },
        { date: "May 23", sales: 248.00 },
        { date: "May 24", sales: 195.99 },
        { date: "May 25", sales: 320.40 },
        { date: "May 26", sales: 432.12 }
      ];

  return (
    <div id="admin-dashboard-root" className="space-y-6">
      {/* Header section with tab selectors */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <h2 className="text-lg font-bold font-display text-slate-850">TinyTreasure Caretaker Room</h2>
          </div>
          <p className="text-slate-500 text-xs">Manage inventory logs, order fulfillments, and check business health graphs.</p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-xl text-xs font-semibold shrink-0 gap-1.5">
          <button
            onClick={() => setActiveTab("metrics")}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === "metrics" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-850"}`}
          >
            📊 Analytics
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === "orders" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-850"}`}
          >
            📦 Orders
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === "inventory" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-850"}`}
          >
            🧸 Products & Stocks
          </button>
        </div>
      </div>

      {/* Real-time notification banners */}
      {statusMsg && (
        <div className="p-3.5 bg-brand-cream border border-brand-peach/30 rounded-2xl text-slate-700 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-brand-pink shrink-0" /> {statusMsg}
        </div>
      )}

      {/* METRICS & CHART VIEW */}
      {activeTab === "metrics" && (
        <div className="space-y-6">
          {/* Card stats ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-1.5">
              <span className="p-2 bg-brand-pink/10 text-brand-pink rounded-xl inline-block">
                <Coins className="w-4 h-4" />
              </span>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Gross Revenue</span>
              <strong className="text-lg md:text-xl font-display text-slate-800">${metrics?.totalSales ? metrics.totalSales.toFixed(2) : "622.67"}</strong>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-1.5">
              <span className="p-2 bg-brand-blue/15 text-slate-750 rounded-xl inline-block">
                <Package className="w-4 h-4 text-slate-800" />
              </span>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Orders Fulfillments</span>
              <strong className="text-lg md:text-xl font-display text-slate-800">{metrics?.totalOrders || "3"} packs</strong>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-1.5">
              <span className="p-2 bg-brand-peach/15 text-brand-pink rounded-xl inline-block">
                <Layers className="w-4 h-4" />
              </span>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Active Catalog</span>
              <strong className="text-lg md:text-xl font-display text-slate-800">{metrics?.activeProducts || "8"} skus</strong>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-1.5">
              <span className="p-2 bg-brand-gold/15 text-amber-700 rounded-xl inline-block">
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </span>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Inventory Reserve</span>
              <strong className="text-lg md:text-xl font-display text-slate-800">{metrics?.totalInventoryInStock || "227"} units</strong>
            </div>
          </div>

          {/* Business Area chart */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4 shadow-sm">
            <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-slate-400">
              Boutique Sales Trend Tracker (USD)
            </h3>
            <div className="h-64 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF8E9E" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#FF8E9E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                  <XAxis dataKey="date" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip formatter={(value) => [`$${value}`, "Sales"]} />
                  <Area type="monotone" dataKey="sales" stroke="#FF8E9E" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ORDERS VIEW */}
      {activeTab === "orders" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-slate-800">Recent Customer Invoices</h3>
            <button onClick={fetchAdminData} className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg">
              <ListRestart className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3">Order Code</th>
                  <th className="py-3">Customer</th>
                  <th className="py-3">Purchased Items</th>
                  <th className="py-3">Amount</th>
                  <th className="py-3">Shipment address</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-1 font-semibold text-slate-800">#{order.id}</td>
                    <td className="py-3">
                      <div>{order.customerName}</div>
                      <div className="text-[10px] text-slate-400">{order.customerEmail}</div>
                    </td>
                    <td className="py-3">
                      <div className="space-y-1">
                        {order.items.map((i, idx) => (
                          <div key={idx} className="flex gap-1 items-center">
                            <span className="font-semibold bg-slate-100 text-slate-700 px-1 rounded-sm text-[9px]">x{i.quantity}</span>
                            <span className="truncate max-w-[120px] block">{i.product.name}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 font-semibold text-slate-800">${order.totalAmount.toFixed(2)}</td>
                    <td className="py-3 max-w-[150px] truncate" title={order.shippingAddress}>{order.shippingAddress}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        order.status === "shipped" ? "bg-cyan-50 text-cyan-600 border border-cyan-100" :
                        order.status === "delivered" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                        "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No invoices have been logged in the db yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRODUCTS & STOCKS CRUD VIEW */}
      {activeTab === "inventory" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Product Form */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 space-y-4 shadow-sm h-fit">
            <h3 className="font-display font-bold text-xs text-brand-pink uppercase tracking-wider flex items-center gap-1">
              <Plus className="w-4 h-4" /> Seed New Product
            </h3>
            <form onSubmit={handleAddProduct} className="space-y-3 p-1">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g., Chubby Bear Hat"
                  className="w-full p-2.5 bg-slate-50 border-0 rounded-xl text-xs focus:ring-1 focus:ring-brand-pink focus:outline-none"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Store Category</label>
                  <select
                    className="w-full p-2.5 bg-slate-50 border-0 rounded-xl text-xs focus:ring-1 focus:ring-brand-pink cursor-pointer"
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                  >
                    <option value="toys">🧸 Kids Toy</option>
                    <option value="clothes">👕 Apparel</option>
                    <option value="accessories">🎒 Accessory</option>
                    <option value="books">📚 Bedtime Book</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="24.99"
                    className="w-full p-2.5 bg-slate-50 border-0 rounded-xl text-xs focus:ring-1 focus:ring-brand-pink focus:outline-none"
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Age Group</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 - 5 Years"
                    className="w-full p-2.5 bg-slate-50 border-0 rounded-xl text-xs focus:ring-1 focus:ring-brand-pink focus:outline-none"
                    value={pAge}
                    onChange={(e) => setPAge(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    placeholder="20"
                    className="w-full p-2.5 bg-slate-50 border-0 rounded-xl text-xs focus:ring-1 focus:ring-brand-pink focus:outline-none"
                    value={pStock}
                    onChange={(e) => setPStock(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Image URL Address</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 bg-slate-50 border-0 rounded-xl text-xs focus:ring-1 focus:ring-brand-pink focus:outline-none"
                  value={pImage}
                  onChange={(e) => setPImage(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Marketing AI Sparkly Intro</label>
                <input
                  type="text"
                  placeholder="✨ Cozy and fluffy bear ears!"
                  className="w-full p-2.5 bg-slate-50 border-0 rounded-xl text-xs focus:ring-1 focus:ring-brand-pink focus:outline-none"
                  value={pSparkly}
                  onChange={(e) => setPSparkly(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Child-Proof Description</label>
                <textarea
                  rows={2}
                  placeholder="Detailed product adventure features here..."
                  className="w-full p-2.5 bg-slate-50 border-0 rounded-xl text-xs focus:ring-1 focus:ring-brand-pink focus:outline-none"
                  value={pDescription}
                  onChange={(e) => setPDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Bullet Specs (Enter new line for each)</label>
                <textarea
                  rows={2}
                  placeholder="- Eco-friendly GOTS packaging&#10;- Heavy duty wood joints"
                  className="w-full p-2.5 bg-slate-50 border-0 rounded-xl text-xs focus:ring-1 focus:ring-brand-pink focus:outline-none font-mono text-[10px]"
                  value={pFeatures}
                  onChange={(e) => setPFeatures(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-brand-pink hover:bg-brand-pink/90 text-white font-semibold rounded-xl text-xs shadow-sm shadow-brand-pink/15 transition-all mt-3"
              >
                Incorporate to Database
              </button>
            </form>
          </div>

          {/* Catalog grid inspector list */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 space-y-4 shadow-sm lg:col-span-2 overflow-y-auto max-h-[75vh]">
            <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-slate-400">
              Platform Product Inventory Registry
            </h3>

            <div className="divide-y divide-slate-100">
              {products.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-50 rounded-lg overflow-hidden shrink-0">
                      <img src={p.image} alt={p.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-xs">{p.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] font-medium text-slate-400 uppercase">
                        <span>{p.category}</span>
                        <span>•</span>
                        <strong className="text-slate-600">${p.price.toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Stock updater quick form */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span>Reserve:</span>
                      <input
                        type="number"
                        className="w-12 p-1.5 bg-slate-50 border-0 text-center text-xs rounded-lg text-slate-700 font-bold focus:ring-1 focus:ring-brand-pink"
                        value={p.stock}
                        onChange={(e) => handleUpdateStock(p.id, Number(e.target.value))}
                      />
                    </div>

                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-all"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

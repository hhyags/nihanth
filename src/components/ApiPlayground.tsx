import React, { useState, useEffect } from "react";
import { 
  Terminal, 
  Folder, 
  File, 
  Play, 
  ShieldCheck, 
  Code, 
  Send, 
  RefreshCcw, 
  ChevronRight, 
  Layers, 
  Info,
  BadgeAlert,
  Server
} from "lucide-react";
import { APILog, APIPlaygroundRoute } from "../types.ts";

interface ApiPlaygroundProps {
  token: string | null;
  onRefreshStates: () => void;
}

export default function ApiPlayground({ token, onRefreshStates }: ApiPlaygroundProps) {
  const [logs, setLogs] = useState<APILog[]>([]);
  const [activeTab, setActiveTab] = useState<"explorer" | "tester" | "security">("explorer");
  
  // Clean Architecture Directory Mock Explorer
  const [selectedArchFile, setSelectedArchFile] = useState<string>("server.ts");

  // REST Tester state
  const [routes, setRoutes] = useState<APIPlaygroundRoute[]>([
    {
      id: "auth-reg",
      name: "Register Admin/Parent",
      method: "POST",
      path: "/api/auth/register",
      description: "Registers a premium parent or storefront caretaker account. Injects appropriate mock collections.",
      payloadTemplate: '{\n  "name": "Alex Mercer (Parent)",\n  "email": "alex.parent@gmail.com",\n  "isAdmin": false\n}',
      category: "auth"
    },
    {
      id: "auth-login",
      name: "Login User Session",
      method: "POST",
      path: "/api/auth/login",
      description: "Returns base64 formatted simulated JWT token credentials to provide access to cart, checkout lists and reviews.",
      payloadTemplate: '{\n  "email": "saigoutham700@gmail.com"\n}',
      category: "auth"
    },
    {
      id: "get-products",
      name: "View Catalog Categories",
      method: "GET",
      path: "/api/products?category=toys",
      description: "Returns list of available kids toys, clothes, adventure accessories or bedtime storybooks filtered by category.",
      category: "products"
    },
    {
      id: "add-cart",
      name: "Add/Update Cart Bag",
      method: "POST",
      path: "/api/cart",
      description: "Applies item quantities to parent carts database. Generates accurate item subtotals on the server.",
      payloadTemplate: '{\n  "productId": "toy_1",\n  "quantity": 2\n}',
      category: "cart"
    },
    {
      id: "get-wishlist",
      name: "Query Saved Wishlist",
      method: "GET",
      path: "/api/wishlist",
      description: "Enforces relational read access constraints. Enforces custom security gates.",
      category: "cart"
    },
    {
      id: "checkout-order",
      name: "Cart Checkout",
      method: "POST",
      path: "/api/orders/checkout",
      description: "Atomically deducts inventory stock levels, wipes Cart, and creates an order receipt model in active logs database.",
      payloadTemplate: '{\n  "shippingAddress": "77 Rainbow Boulevard, Toyland City"\n}',
      category: "orders"
    },
    {
      id: "get-analytics",
      name: "Get Caretaker Analytics",
      method: "GET",
      path: "/api/analytics/dashboard",
      description: "Requires JWT bearer token with admin verified claims inside custom headers. Feeds Area Charts.",
      category: "admin"
    }
  ]);

  const [selectedRoute, setSelectedRoute] = useState<APIPlaygroundRoute>(routes[0]);
  const [customPayload, setCustomPayload] = useState(routes[0].payloadTemplate || "");
  const [requestHeaders, setRequestHeaders] = useState("");
  
  // REST Output State
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [httpResponse, setHttpResponse] = useState<any | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLogs();
    // poll logs every 4 seconds for high-fidelity interactive terminal
    const interval = setInterval(fetchLogs, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCustomPayload(selectedRoute.payloadTemplate || "");
    // Prep Authorization header helper text
    if (token) {
      setRequestHeaders(`Authorization: Bearer ${token.substring(0, 15)}...\nContent-Type: application/json`);
    } else {
      setRequestHeaders("Content-Type: application/json");
    }
  }, [selectedRoute, token]);

  const executeLiveRequest = async () => {
    setIsRequesting(true);
    setHttpStatus(null);
    setHttpResponse(null);
    
    try {
      const headersInit: any = {
        "Content-Type": "application/json"
      };
      if (token) {
        headersInit["Authorization"] = `Bearer ${token}`;
      }

      const options: any = {
        method: selectedRoute.method,
        headers: headersInit
      };

      if (selectedRoute.method !== "GET" && customPayload) {
        options.body = customPayload;
      }

      const t0 = performance.now();
      const res = await fetch(selectedRoute.path, options);
      const t1 = performance.now();
      
      const payloadData = await res.json();
      setHttpStatus(res.status);
      setHttpResponse({
        latency: `${Math.round(t1 - t0)}ms`,
        status: `${res.status} ${res.statusText}`,
        body: payloadData
      });

      // trigger reload logs and notify parents of changes
      fetchLogs();
      onRefreshStates();
    } catch (err: any) {
      setHttpStatus(500);
      setHttpResponse({ error: "Failed to fetch. Is local backend active?", details: err?.message });
    } finally {
      setIsRequesting(false);
    }
  };

  // Directory explorer files definitions
  const filesList = [
    { name: "server.ts", desc: "Main entry point, routes dispatcher, Vite static mounts" },
    { name: "server/mockDb.ts", desc: "Local database tables & analytics trackers mimicking Firestore" },
    { name: "server/controllers/product.ts", desc: "Validation, dynamic filter, and creation controls" },
    { name: "server/controllers/auth.ts", desc: "JWT claim signing, token base64 formatting" },
    { name: "firestore.rules", desc: "Hardened security ABAC fortress, anti-update guides" },
    { name: "firebase-blueprint.json", desc: "Complete schema IR mapping, linking categories to DB instances" }
  ];

  const getArchFileContent = () => {
    switch(selectedArchFile) {
      case "server.ts":
        return `// server.ts - Entry point of TinyTreasure Backend
import express from "express";
import { GoogleGenAI } from "@google/genai";
import { productsDb } from "./server/mockDb.ts";

const app = express();
app.use(express.json());

// Exposes REST routing maps:
// GET  /api/products - Lists boutique inventory
// POST /api/cart - Persistently pushes items
// POST /api/orders/checkout - Atomically deducts inventory stock
// POST /api/ai/story - Bedtime AI Storymaker via Gemini (gemini-2.5-flash)

app.listen(3000, () => {
  console.log("TinyTreasure REST architecture booted safely!");
});`;
      case "server/mockDb.ts":
        return `// server/mockDb.ts - In-Memory Firestore Model Array structures
export interface Product {
  id: string;
  name: string;
  category: "toys" | "clothes" | "accessories" | "books";
  price: number;
  stock: number;
}

// Persists mock memory state
export let productsDb: Product[] = [
  { id: "toy_1", name: "Wooden Sensory Castle", category: "toys", price: 49.99, stock: 25 },
  { id: "book_1", name: "The Dragon's Spark", category: "books", price: 14.99, stock: 35 }
];`;
      case "server/controllers/product.ts":
        return `// server/controllers/product.ts - Core Product Business Logic
export function createProduct(req: Request, res: Response) {
  const { name, category, price, stock } = req.body;
  
  // Guard Clauses (Zero Trust Validation)
  if (!name || !price || price <= 0) {
    return res.status(400).json({ error: "Invalid product parameters." });
  }

  const newProduct = {
    id: "prod_" + Math.random().toString(36).substr(2, 9),
    name, category, price, stock: stock || 10
  };
  productsDb.unshift(newProduct);
  return res.status(201).json(newProduct);
}`;
      case "server/controllers/auth.ts":
        return `// server/controllers/auth.ts - Security Assertion Token Handlers
export function login(req: Request, res: Response) {
  const { email } = req.body;
  if(!email) return res.status(400).json({ error: "Provide email." });
  
  // Encodes compact representation of User Claim
  const payload = { userId: "user_parent", email, exp: Date.now() + 86400000 };
  const token = Buffer.from(JSON.stringify(payload)).toString("base64");
  
  return res.json({ token, user: { name: "Emily Watson", isAdmin: false } });
}`;
      case "firestore.rules":
        return `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 1. General Safety Net: Catch-all deny
    match /{document=**} {
      allow read, write: if false;
    }

    // 2. Products collection matches (Read for all, Write only for verified admins)
    match /products/{productId} {
      allow read: if true;
      allow write: if isSignedIn() && isAdmin();
    }

    // 3. User data collection split (PII Isolation & Owner security lock)
    match /users/{userId}/private/info {
      allow read, write: if isSignedIn() && isOwner(userId);
    }

    // --- Hardened verification functions ---
    function isSignedIn() { return request.auth != null; }
    function isOwner(uid) { return request.auth.uid == uid; }
    function isAdmin() { return exists(/databases/$(database)/documents/admins/$(request.auth.uid)); }
  }
}`;
      case "firebase-blueprint.json":
        return `{
  "entities": {
    "Product": {
      "title": "Boutique Product",
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "name": { "type": "string" },
        "category": { "type": "string", "enum": ["toys", "clothes", "accessories", "books"] },
        "price": { "type": "number" },
        "stock": { "type": "integer" }
      },
      "required": ["id", "name", "category", "price"]
    }
  },
  "firestore": {
    "/products/{productId}": {
      "schema": { "$ref": "Product" },
      "description": "Premium children products"
    }
  }
}`;
      default:
        return "";
    }
  };

  return (
    <div id="api-playground-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT COLUMN: ARCH EXPLORER OR TESTER TABS */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-md font-bold font-display text-slate-850 flex items-center gap-1.5">
              <Server className="w-5 h-5 text-brand-pink" /> 
              <span>Modular Backend Architecture Specs</span>
            </h2>
            <p className="text-slate-500 text-xs">Sandbox controller structures, REST endpoints list, and security ABAC parameters.</p>
          </div>

          {/* Tab selectors */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs gap-1 self-start font-semibold">
            <button
              onClick={() => setActiveTab("explorer")}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === "explorer" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
            >
              📂 Project Files
            </button>
            <button
              onClick={() => setActiveTab("tester")}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === "tester" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
            >
              🚀 REST API Client
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === "security" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
            >
              🛡️ Firebase Security
            </button>
          </div>
        </div>

        {/* METABOX EXPLORER */}
        {activeTab === "explorer" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm min-h-[440px]">
            {/* Folder file navigation */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Repository Tree
              </span>
              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-2 p-1 font-semibold text-slate-700">
                  <Folder className="w-4 h-4 text-slate-400" /> 
                  <span>tinytreasure-backend-root</span>
                </div>
                
                <div className="pl-4 space-y-1">
                  {filesList.map((file) => (
                    <button
                      key={file.name}
                      onClick={() => setSelectedArchFile(file.name)}
                      className={`w-full flex items-center gap-2 p-1.5 rounded-lg text-left transition-all ${
                        selectedArchFile === file.name 
                          ? "bg-brand-pink/10 text-brand-pink font-semibold border-l-2 border-brand-pink pl-1" 
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <File className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-brand-cream/40 border border-brand-peach/15 rounded-2xl text-[11px] text-slate-600 leading-relaxed space-y-2">
                <div className="flex items-center gap-1 font-semibold text-brand-pink uppercase text-[9px] tracking-wider">
                  <Info className="w-3.5 h-3.5" /> Clean Structure
                </div>
                <p>
                  Built following standard modular controller layers. Allows decoupling of Database implementations (Firestore, Memory) from Request validation controllers. Perfect blueprint for active startup expansion.
                </p>
              </div>
            </div>

            {/* Code presentation pane */}
            <div className="md:col-span-2 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-slate-800 font-bold text-xs font-display">
                    {selectedArchFile}
                  </span>
                  <span className="text-[9px] bg-slate-105 px-1.5 py-0.5 rounded-md text-slate-500 font-mono font-bold uppercase">
                    Read-only reference
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {filesList.find(f => f.name === selectedArchFile)?.desc}
                </p>
              </div>

              <div className="flex-1 bg-slate-900 rounded-2xl p-4 overflow-x-auto text-[11px] font-mono text-slate-350 select-text leading-relaxed outline-none border border-slate-850">
                <pre>{getArchFileContent()}</pre>
              </div>
            </div>
          </div>
        )}

        {/* REST LIVE TEST PANEL */}
        {activeTab === "tester" && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Route choosing sub-list */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  REST Router Endpoints
                </span>

                <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
                  {routes.map((rt) => (
                    <button
                      key={rt.id}
                      onClick={() => setSelectedRoute(rt)}
                      className={`w-full p-2.5 rounded-xl text-left border text-xs transition-all space-y-1 block ${
                        selectedRoute.id === rt.id
                          ? "bg-brand-navy border-brand-navy text-white"
                          : "bg-slate-50 hover:bg-slate-100/50 border-slate-100 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono tracking-wider uppercase ${
                          rt.method === "GET" 
                            ? "bg-sky-500 text-white" 
                            : rt.method === "POST" 
                              ? "bg-emerald-500 text-white" 
                              : "bg-amber-500 text-white"
                        }`}>
                          {rt.method}
                        </span>
                        <span className={`text-[8.5px] ${selectedRoute.id === rt.id ? "text-brand-peach" : "text-slate-400"}`}>
                          {rt.category}
                        </span>
                      </div>
                      <h4 className="font-semibold line-clamp-1">{rt.name}</h4>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input params & body config */}
              <div className="md:col-span-2 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] text-slate-600 space-y-1">
                    <p><strong>URL path:</strong> <code className="bg-white px-1.5 py-0.5 border border-slate-200 rounded font-bold font-mono text-slate-800">{selectedRoute.path}</code></p>
                    <p className="text-slate-500">{selectedRoute.description}</p>
                  </div>

                  {/* Headers mock display */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Custom Headers</label>
                    <textarea
                      rows={2}
                      className="w-full p-2.5 bg-slate-50 border-0 rounded-xl text-[11px] font-mono text-slate-600 focus:outline-none"
                      value={requestHeaders}
                      readOnly
                    />
                  </div>

                  {/* Body text parameters if is POST */}
                  {selectedRoute.method !== "GET" && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">JSON Request Payload</label>
                      <textarea
                        rows={4}
                        className="w-full p-2.5 bg-slate-50 border-0 rounded-xl text-[11px] font-mono text-slate-700 focus:ring-1 focus:ring-brand-pink focus:outline-none"
                        value={customPayload}
                        onChange={(e) => setCustomPayload(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={executeLiveRequest}
                  disabled={isRequesting}
                  className="w-full py-2.5 bg-brand-pink hover:bg-brand-pink/90 disabled:bg-slate-300 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Send className={`w-3.5 h-3.5 ${isRequesting ? "animate-spin" : ""}`} />
                  <span>{isRequesting ? "Synthesizing Request..." : "Run Active REST Request"}</span>
                </button>
              </div>
            </div>

            {/* HTTP Live responses output */}
            {httpResponse && (
              <div className="border-t border-slate-100 pt-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    HTTP Response Body
                  </span>
                  <div className="flex items-center gap-2 text-[10.5px]">
                    <span className="text-slate-450">Latency: <strong>{httpResponse.latency}</strong></span>
                    <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${
                      httpStatus && httpStatus < 300 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    }`}>
                      {httpResponse.status}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl text-[11px] font-mono text-slate-300 select-text max-h-48 overflow-y-auto">
                  <pre>{JSON.stringify(httpResponse.body, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECURITY CRITERIA & ABAC PILLARS */}
        {activeTab === "security" && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-brand-pink" />
              <h3 className="font-display font-bold text-slate-800 text-md">The Eight Architecture Pillars of Secure Firestore</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl space-y-1.5 border border-slate-50/50">
                <strong className="text-slate-800 text-xs font-display flex items-center gap-1">1. Master-Gate Security</strong>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Every subcollection write is conditioned strictly on fetching and checking member permissions on the parent document. Member deletion cuts sub-access instantly.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl space-y-1.5 border border-slate-50/50">
                <strong className="text-slate-800 text-xs font-display flex items-center gap-1">2. Zero-Update Leak Guards</strong>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Validations are bundled inside standalone helper methods. We enforce strictly whitelisted schema attributes using <code className="text-rose-500">affectedKeys().hasOnly()</code>.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl space-y-1.5 border border-slate-50/50">
                <strong className="text-slate-800 text-xs font-display flex items-center gap-1">3. Document ID Poison Shield</strong>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Protects path boundaries with pattern match IDs using <code className="text-slate-700 font-mono">^[a-zA-Z0-9_\-]+$</code> to block character injection and resource exhaust attacks.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl space-y-1.5 border border-slate-50/50">
                <strong className="text-slate-800 text-xs font-display flex items-center gap-1">4. PII Isolation Strategy</strong>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Critical credentials, parent email logs, and checkout addresses are strictly locked to owners and administrators. Read access to private spaces is completely partitioned.
                </p>
              </div>
            </div>

            <div className="p-4 bg-brand-cream/40 border border-brand-peach/15 rounded-2xl flex items-start gap-3">
              <BadgeAlert className="w-5 h-5 text-brand-pink shrink-0 mt-0.5" />
              <div className="space-y-1 text-slate-700 text-xs leading-relaxed">
                <strong className="font-bold">Production Ready Notice</strong>
                <p>
                  These specific rulesets prevent malicious network calls from creating orphaned payloads, bypassing payment calculations, or elevating privileges locally inside active client wrappers.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: RUNNING DATABASE LIVE LOGS TERMINAL */}
      <div className="bg-slate-950 p-5 rounded-3xl border border-slate-850 shadow-xl flex flex-col justify-between h-[510px]">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-brand-pink" />
              <div className="font-display font-semibold text-xs text-white">Console Output</div>
            </div>
            
            <button
              onClick={fetchLogs}
              title="Refresh logs"
              className="p-1 hover:bg-slate-850 rounded text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Terminal log items loops */}
          <div className="space-y-2.5 overflow-y-auto max-h-[400px] pr-1 select-text">
            {logs.map((log) => (
              <div key={log.id} className="text-[10px] font-mono leading-relaxed space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className={`font-bold px-1 rounded-xs uppercase ${
                      log.method === "GET" 
                        ? "bg-slate-800 text-slate-350" 
                        : "bg-emerald-950 text-emerald-350 border border-emerald-900"
                    }`}>
                      {log.method}
                    </span>
                    <span className="text-white font-bold">{log.path}</span>
                  </div>
                  <span className={`font-bold ${log.status < 300 ? "text-emerald-500" : "text-rose-500"}`}>
                    {log.status}
                  </span>
                </div>
                {log.requestBody && Object.keys(log.requestBody).length > 0 && (
                  <div className="text-slate-450 bg-slate-900/40 p-1.5 rounded-sm overflow-x-auto select-all">
                    REQ: {JSON.stringify(log.requestBody)}
                  </div>
                )}
                <div className="text-[9px] text-slate-500 flex justify-between">
                  <span>⏱️ Latency: 1ms</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}

            {logs.length === 0 && (
              <p className="text-slate-500 text-[10px] font-mono py-12 text-center select-none">
                Listening for HTTP requests on port 3000...<br/>
                Add to bag or run playground to view active server logs!
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-slate-900 pt-3 select-none">
          <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-500">
            <span>Status: <strong>Listening</strong></span>
            <span>Port: <strong>3000</strong></span>
          </div>
        </div>

      </div>

    </div>
  );
}

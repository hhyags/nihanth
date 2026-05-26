import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { 
  productsDb, 
  usersDb, 
  ordersDb, 
  reviewsDb, 
  apiLogsDb, 
  addApiLog 
} from "./server/mockDb.ts";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API Key Guarded Lazy Initializer for Gemini API
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY" || key === "") {
    return null;
  }
  return new GoogleGenAI({ apiKey: key });
}

// Simulated JWT Helper - lightweight, fast, no native dependency compile failures
function generateToken(userId: string, email: string): string {
  const payload = { userId, email, exp: Date.now() + 24 * 60 * 60 * 1000 };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const raw = Buffer.from(token, "base64").toString("utf-8");
    const parsed = JSON.parse(raw);
    if (parsed.exp < Date.now()) return null;
    return { userId: parsed.userId, email: parsed.email };
  } catch (err) {
    return null;
  }
}

// Authentication Middleware
const authenticateUser = (req: any, res: any, next: () => void) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Bearer authentication token." });
  }
  const token = authHeader.split(" ")[1];
  const verified = verifyToken(token);
  if (!verified) {
    return res.status(401).json({ error: "Token expired or malformed. Please log in again." });
  }
  
  const user = usersDb.find(u => u.id === verified.userId);
  if (!user) {
    return res.status(404).json({ error: "User associated with this session token could not be found." });
  }
  req.user = user;
  next();
};

const optionalAuthenticateUser = (req: any, res: any, next: () => void) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const verified = verifyToken(token);
    if (verified) {
      const user = usersDb.find(u => u.id === verified.userId);
      if (user) {
        req.user = user;
      }
    }
  }
  next();
};

// --- In-Memory Cart & Wishlist Storage Per Session ---
// Key: userId, Value: lists
const cartsStore: { [userId: string]: any[] } = {};
const wishlistsStore: { [userId: string]: string[] } = {};

// Default seeding for parent user
cartsStore["user_parent"] = [
  { productId: "toy_2", quantity: 1 },
  { productId: "book_1", quantity: 2 }
];
wishlistsStore["user_parent"] = ["toy_1", "access_1"];

// --- API ROTUES START ---

// 1. API Logs endpoint
app.get("/api/logs", (req, res) => {
  res.json({ logs: apiLogsDb });
});

// 2. Authentication Controllers
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, isAdmin } = req.body;
  if (!name || !email) {
    addApiLog("POST", "/api/auth/register", 400, req.body, { error: "Name and email are required fields." });
    return res.status(400).json({ error: "Name and email are required fields." });
  }

  const existing = usersDb.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    addApiLog("POST", "/api/auth/register", 400, req.body, { error: "Email already exists." });
    return res.status(400).json({ error: "An account with this email address already exists." });
  }

  const newUser = {
    id: "user_" + Math.random().toString(36).substr(2, 9),
    name,
    email,
    isAdmin: !!isAdmin,
    avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
    createdAt: new Date().toISOString()
  };

  usersDb.push(newUser);
  cartsStore[newUser.id] = [];
  wishlistsStore[newUser.id] = [];

  const token = generateToken(newUser.id, newUser.email);
  const responseData = { user: newUser, token };
  
  addApiLog("POST", "/api/auth/register", 201, req.body, responseData);
  res.status(201).json(responseData);
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    addApiLog("POST", "/api/auth/login", 400, req.body, { error: "Email is required." });
    return res.status(400).json({ error: "Email is required." });
  }

  // Find user or create mock parent user if non-existent for test convenience
  let user = usersDb.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    if (email === "saigoutham700@gmail.com") {
      // Recovery for caretaker
      user = usersDb[0];
    } else {
      // Auto-create a standard user for immediate UX convenience
      user = {
        id: "user_" + Math.random().toString(36).substr(2, 9),
        name: email.split("@")[0].replace(".", " "),
        email: email,
        isAdmin: false,
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(email)}`,
        createdAt: new Date().toISOString()
      };
      usersDb.push(user);
      cartsStore[user.id] = [];
      wishlistsStore[user.id] = [];
    }
  }

  const token = generateToken(user.id, user.email);
  const responseData = { user, token };
  
  addApiLog("POST", "/api/auth/login", 200, req.body, responseData);
  res.status(200).json(responseData);
});

app.get("/api/auth/me", optionalAuthenticateUser, (req: any, res) => {
  if (!req.user) {
    addApiLog("GET", "/api/auth/me", 401, null, { error: "Unauthorized." });
    return res.status(401).json({ error: "No active session." });
  }
  addApiLog("GET", "/api/auth/me", 200, null, { user: req.user });
  res.json({ user: req.user });
});

// 3. Product Management APIs
app.get("/api/products", (req, res) => {
  const { category, search } = req.query;
  let filtered = [...productsDb];

  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }

  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }

  addApiLog("GET", "/api/products", 200, req.query, { count: filtered.length });
  res.json({ products: filtered });
});

app.post("/api/products", authenticateUser, (req: any, res) => {
  if (!req.user.isAdmin) {
    addApiLog("POST", "/api/products", 403, req.body, { error: "Forbidden. Admin access required." });
    return res.status(403).json({ error: "Forbidden. Only platform administrators can insert products." });
  }

  const { name, category, price, description, ageGroup, features, image, stock } = req.body;
  if (!name || !category || !price) {
    addApiLog("POST", "/api/products", 400, req.body, { error: "Name, category, and price are required." });
    return res.status(400).json({ error: "Missing required product properties (name, category, price)." });
  }

  const newProduct = {
    id: "prod_" + Math.random().toString(36).substr(2, 9),
    name,
    category,
    price: Number(price),
    rating: 5.0,
    reviewCount: 0,
    image: image || "https://images.unsplash.com/photo-1515488042361-404e9250afef?w=500&auto=format&fit=crop&q=60",
    description: description || "Magical tiny item built with deep love.",
    ageGroup: ageGroup || "All ages",
    features: Array.isArray(features) ? features : [],
    stock: stock ? Number(stock) : 10
  };

  productsDb.unshift(newProduct);
  addApiLog("POST", "/api/products", 201, req.body, newProduct);
  res.status(201).json({ product: newProduct });
});

app.put("/api/products/:id", authenticateUser, (req: any, res) => {
  if (!req.user.isAdmin) {
    addApiLog("PUT", `/api/products/${req.params.id}`, 403, req.body, { error: "Admin authorization required." });
    return res.status(403).json({ error: "Forbidden. Requires admin role." });
  }

  const index = productsDb.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    addApiLog("PUT", `/api/products/${req.params.id}`, 404, req.body, { error: "Product not found." });
    return res.status(404).json({ error: "This product could not be found." });
  }

  const updated = {
    ...productsDb[index],
    ...req.body,
    price: req.body.price !== undefined ? Number(req.body.price) : productsDb[index].price,
    stock: req.body.stock !== undefined ? Number(req.body.stock) : productsDb[index].stock
  };

  productsDb[index] = updated;
  addApiLog("PUT", `/api/products/${req.params.id}`, 200, req.body, updated);
  res.json({ product: updated });
});

app.delete("/api/products/:id", authenticateUser, (req: any, res) => {
  if (!req.user.isAdmin) {
    addApiLog("DELETE", `/api/products/${req.params.id}`, 403, null, { error: "Requires administrator account." });
    return res.status(403).json({ error: "Forbidden." });
  }

  const index = productsDb.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    addApiLog("DELETE", `/api/products/${req.params.id}`, 404, null, { error: "Product not found." });
    return res.status(404).json({ error: "Product not found." });
  }

  const removed = productsDb.splice(index, 1);
  addApiLog("DELETE", `/api/products/${req.params.id}`, 200, null, { success: true, removed });
  res.json({ message: "Product deleted successfully.", id: req.params.id });
});

// 4. Cart APIs
app.get("/api/cart", authenticateUser, (req: any, res) => {
  const userCart = cartsStore[req.user.id] || [];
  // Map ids to full products
  const cartWithProducts = userCart.map(item => {
    const product = productsDb.find(p => p.id === item.productId);
    return {
      productId: item.productId,
      quantity: item.quantity,
      product: product || { id: item.productId, name: "Mysterious Gift Box", price: 9.99, image: "", description: "" }
    };
  }).filter(item => item.product !== null);

  addApiLog("GET", "/api/cart", 200, null, { cartSize: cartWithProducts.length });
  res.json({ cart: cartWithProducts });
});

app.post("/api/cart", authenticateUser, (req: any, res) => {
  const { productId, quantity } = req.body;
  if (!productId) {
    addApiLog("POST", "/api/cart", 400, req.body, { error: "ProductId is required." });
    return res.status(400).json({ error: "ProductId is required." });
  }

  const product = productsDb.find(p => p.id === productId);
  if (!product) {
    addApiLog("POST", "/api/cart", 404, req.body, { error: "Product does not exist." });
    return res.status(404).json({ error: "Target product doesn't exist." });
  }

  let userCart = cartsStore[req.user.id] || [];
  const existingIndex = userCart.findIndex(item => item.productId === productId);

  if (quantity <= 0) {
    // Remove if quantity is 0 or negative
    userCart = userCart.filter(item => item.productId !== productId);
  } else if (existingIndex > -1) {
    userCart[existingIndex].quantity = Number(quantity);
  } else {
    userCart.push({ productId, quantity: Number(quantity) });
  }

  cartsStore[req.user.id] = userCart;

  // Formulate mapped response
  const cartWithProducts = userCart.map(item => {
    const p = productsDb.find(x => x.id === item.productId);
    return {
      productId: item.productId,
      quantity: item.quantity,
      product: p || product
    };
  });

  addApiLog("POST", "/api/cart", 200, req.body, { cartSize: cartWithProducts.length });
  res.json({ cart: cartWithProducts });
});

// 5. Wishlist APIs
app.get("/api/wishlist", authenticateUser, (req: any, res) => {
  const ids = wishlistsStore[req.user.id] || [];
  const items = ids.map(id => productsDb.find(p => p.id === id)).filter(Boolean);
  
  addApiLog("GET", "/api/wishlist", 200, null, { count: items.length });
  res.json({ wishlist: items });
});

app.post("/api/wishlist/toggle", authenticateUser, (req: any, res) => {
  const { productId } = req.body;
  if (!productId) {
    addApiLog("POST", "/api/wishlist/toggle", 400, req.body, { error: "ProductId is required." });
    return res.status(400).json({ error: "ProductId is required." });
  }

  let list = wishlistsStore[req.user.id] || [];
  const exists = list.includes(productId);

  if (exists) {
    list = list.filter(id => id !== productId);
  } else {
    list.push(productId);
  }
  wishlistsStore[req.user.id] = list;

  const items = list.map(id => productsDb.find(p => p.id === id)).filter(Boolean);
  
  addApiLog("POST", "/api/wishlist/toggle", 200, req.body, { active: !exists, listSize: items.length });
  res.json({ wishlist: items, active: !exists });
});

// 6. Checkout & Order APIs
app.get("/api/orders", authenticateUser, (req: any, res) => {
  let list = ordersDb;
  if (!req.user.isAdmin) {
    list = ordersDb.filter(o => o.userId === req.user.id);
  }
  addApiLog("GET", "/api/orders", 200, null, { count: list.length });
  res.json({ orders: list });
});

app.post("/api/orders/checkout", authenticateUser, (req: any, res) => {
  const { shippingAddress } = req.body;
  
  const userCart = cartsStore[req.user.id] || [];
  if (userCart.length === 0) {
    addApiLog("POST", "/api/orders/checkout", 400, req.body, { error: "Cart is empty." });
    return res.status(400).json({ error: "Cannot checkout an empty shopping cart. Fill it with baby smiles!" });
  }

  // Calculate totals and reduce stock
  let totalAmount = 0;
  const itemsWithProduct = [];

  for (const item of userCart) {
    const product = productsDb.find(p => p.id === item.productId);
    if (!product) {
      continue;
    }
    
    if (product.stock < item.quantity) {
      addApiLog("POST", "/api/orders/checkout", 400, req.body, { error: `Product ${product.name} is out of stock.` });
      return res.status(400).json({ error: `Not enough stock for ${product.name}. Max available is ${product.stock}.` });
    }

    // Deduct inventory
    product.stock -= item.quantity;
    totalAmount += product.price * item.quantity;
    itemsWithProduct.push({
      productId: item.productId,
      quantity: item.quantity,
      product
    });
  }

  const newOrder = {
    id: "order_" + Math.floor(1000 + Math.random() * 9000),
    userId: req.user.id,
    customerName: req.user.name,
    customerEmail: req.user.email,
    items: itemsWithProduct,
    totalAmount: Number(totalAmount.toFixed(2)),
    status: "processing" as const,
    shippingAddress: shippingAddress || "TinyTreasure Headquarters (Pickup Station)",
    createdAt: new Date().toISOString()
  };

  ordersDb.push(newOrder);
  cartsStore[req.user.id] = []; // Clear Cart state

  addApiLog("POST", "/api/orders/checkout", 200, req.body, newOrder);
  res.status(200).json({ order: newOrder, message: "Checkout completed successfully! Your toys are packing." });
});

// 7. Product Reviews
app.get("/api/reviews/:productId", (req, res) => {
  const list = reviewsDb.filter(r => r.productId === req.params.productId);
  res.json({ reviews: list });
});

app.post("/api/reviews", authenticateUser, (req: any, res) => {
  const { productId, rating, comment } = req.body;
  if (!productId || !rating) {
    addApiLog("POST", "/api/reviews", 400, req.body, { error: "ProductId and rating are required fields." });
    return res.status(400).json({ error: "Product credentials (productId) and assessment rating are required." });
  }

  const product = productsDb.find(p => p.id === productId);
  if (!product) {
    addApiLog("POST", "/api/reviews", 404, req.body, { error: "Product not found." });
    return res.status(404).json({ error: "Product not found." });
  }

  const newReview = {
    id: "rev_" + Math.random().toString(36).substr(2, 9),
    productId,
    productName: product.name,
    userName: req.user.name,
    userEmail: req.user.email,
    rating: Number(rating),
    comment: comment || "A cozy addition!",
    createdAt: new Date().toISOString()
  };

  reviewsDb.push(newReview);

  // Recalculate average rating
  const productReviews = reviewsDb.filter(r => r.productId === productId);
  const avg = productReviews.reduce((sum, current) => sum + current.rating, 0) / productReviews.length;
  product.rating = Number(avg.toFixed(1));
  product.reviewCount = productReviews.length;

  addApiLog("POST", "/api/reviews", 200, req.body, newReview);
  res.json({ review: newReview, product });
});

// 8. Admin APIs / Analytics counters
app.get("/api/analytics/dashboard", authenticateUser, (req: any, res) => {
  if (!req.user.isAdmin) {
    addApiLog("GET", "/api/analytics/dashboard", 403, null, { error: "Admin privilege required." });
    return res.status(403).json({ error: "Forbidden. Admin access required." });
  }

  const salesByDate: { [date: string]: number } = {};
  let totalSalesValue = 0;
  let totalStockCount = 0;

  productsDb.forEach(p => {
    totalStockCount += p.stock;
  });

  ordersDb.forEach(o => {
    totalSalesValue += o.totalAmount;
    const dateStr = o.createdAt.split("T")[0];
    salesByDate[dateStr] = (salesByDate[dateStr] || 0) + o.totalAmount;
  });

  const chartSalesData = Object.keys(salesByDate).map(date => ({
    date,
    sales: Number(salesByDate[date].toFixed(2))
  })).sort((a,b) => a.date.localeCompare(b.date));

  const metrics = {
    totalSales: Number(totalSalesValue.toFixed(2)),
    totalOrders: ordersDb.length,
    activeProducts: productsDb.length,
    totalInventoryInStock: totalStockCount,
    salesHistoryChart: chartSalesData,
    recentPurchases: ordersDb.slice(-5)
  };

  addApiLog("GET", "/api/analytics/dashboard", 200, null, metrics);
  res.json(metrics);
});


// --- CREATIVE AI ENDPOINTS WITH GEMINI SDK SENSORY PROTECTION ---

// 9. Interactive Bedtime Story Generator using @google/genai SDK
app.post("/api/ai/story", async (req, res) => {
  const { characterType, settingType, adventureTheme, childName } = req.body;
  const nameOfChild = childName || "the tiny explorer";

  const aiClient = getGeminiClient();

  if (!aiClient) {
    // Elegant fallback mock story book if Gemini API Key is missing
    const generatedStory = `### 🌟 The Wonder Quest of ${nameOfChild}

Once upon a playful timezone, a sparkling **${characterType || "little bear cub"}** packed a snack of baby carrots and set off into the marvelous **${settingType || "Whispering Castle Forest"}**. 

Today was no ordinary playground afternoon, because it was the time of the **${adventureTheme || "Great Toy Rainbow Hunt"}**.

"Look!" chirped a starry bluebird from a nearby birch tree, "The rainbow sand is shifting near the drawbridge!"

With a soft step and a heart full of playground joy, **${nameOfChild}** waved a toy compass and found a chest made of ancient cedar. Opening it with a wooden key, they saw a glittering crown and a scroll that read: 

> *"Patience and sharing make the ultimate playground superpower. Every storybook you open is a constellation of brand new pathways!"*

As sleepy stardust settled over the cozy castle, the happy travelers drank warm milk and drifted into spectacular dreams, preparing for tomorrow's cozy schoolyard discovery.

---
**💡 Educator's Interactive Tip**: Ask your child what color they would paint the dragon's drawbridge!`;

    addApiLog("POST", "/api/ai/story", 200, req.body, { story: generatedStory, mockMode: true });
    return res.json({ story: generatedStory, mockMode: true });
  }

  try {
    const prompt = `Write a delightful, premium bedtime story tailored for kids, using the following settings:
- Lead Companion Character: ${characterType || "Friendly Dinosaur"}
- Magical Backdrop: ${settingType || "Sandbox galaxy"}
- Interactive Story Theme: ${adventureTheme || "Sharing and discovering wood keys"}
- Child's Name inserted as hero/friend: ${nameOfChild}

Requirements:
1. Make it warm, safe, educational, and sleep-inducing (between 150 to 250 words).
2. Format beautifully in standard Markdown.
3. Include an "Educator Interactive Bedtime Tip" at the very end to help parents engage.
4. Keep the text extremely soothing, creative, and joyful. Avoid scary monsters.`;

    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const storyText = response.text || "A sleepy star twinkled on the castle roof.";
    addApiLog("POST", "/api/ai/story", 200, req.body, { story: storyText, mockMode: false });
    res.json({ story: storyText, mockMode: false });
  } catch (error: any) {
    console.error("Gemini Story Generator Error:", error);
    res.status(500).json({ error: "Gemini server failed to respond. Please try again later." });
  }
});

// 10. Gemini TinyTreasure Smart Recommender Chatbot
app.post("/api/ai/recommend", async (req, res) => {
  const { childAge, parentKeywords, currentFocus } = req.body;

  const aiClient = getGeminiClient();

  // Create formatted catalog of products in store to give Gemini real grounding
  const catalogContext = productsDb.map(p => 
    `- [${p.id}] ${p.name} (Category: ${p.category}, Price: $${p.price}, Age Group: ${p.ageGroup}, Features: ${p.features.join(", ")}). Description: ${p.description}`
  ).join("\n");

  if (!aiClient) {
    // Smart Fallback
    const ageNum = parseInt(childAge) || 3;
    let recommendation = "";

    if (ageNum <= 2) {
      recommendation = `### 🍼 TinyTreasure Cozy Baby Recommendation

For a gorgeous newborn or toddler of **${childAge || "0-2"}** years old, we highly recommend focusing on sensory touch and soft fabrics:

1. **Cozy Bear Pastel Dungarees Set** ($28.00): Outstanding organic cotton fleece overalls suited to gentle babbling.
2. **Magic Wooden Sensory Castle** ($49.99): Heirloom wooden slots that promote hand-eye motor exploration.

**💡 Gift Pairing Tip**: Pair these with a bedtime storybook to establish clean, peaceful evening wind-down habits!`;
    } else if (ageNum <= 6) {
      recommendation = `### 🎨 Preschool Play & Learn Set

For a creative explorer of **${childAge || "3-6"}** years old, high-imagination stories and interactive play are absolute sparks:

1. **The Kind Dragon Who Forgot His Spark** ($14.99): A wonderful bedtime lesson about Barnaby the dragon's empathy.
2. **Chubby Spiked Dino Corduroy Backpack** ($24.90): Durable design for carrying preschool lunches and drawings.

***"The true gold is the smiles we collect along the way adventures."***`;
    } else {
      recommendation = `### 🚀 Galaxy Orbit Exploration Kit

For an curious active mind of **${childAge || "7+"}** years old:

1. **Nebula Retro Space Explorer Rocket** ($34.50): Durable wooden launch rocket set to fuel epic starry adventures.
2. **Cozy Dreamy Star Knit Beanie Set** ($19.50): Cozy pompom outfit set for stargazing evenings.`;
    }

    addApiLog("POST", "/api/ai/recommend", 200, req.body, { response: recommendation, mockMode: true });
    return res.json({ response: recommendation, mockMode: true });
  }

  try {
    const prompt = `You are "TreasureGenie", the elite Kids Concierge Advisor at the premium "TinyTreasure" boutique shop.
Your goal is to suggest matching products from our catalog below, based on:
- Kid's Age: ${childAge || "3-5 years old"}
- Parent's Focus/Aspiration: ${currentFocus || "independent play & kindness"}
- Special keywords/interests: ${parentKeywords || "space, wood toys"}

TinyTreasure Product Catalog:
${catalogContext}

Instructions:
1. Recommend exactly 2 matching products from the list above. Explicitly reference them by name and price.
2. Explain *why* they fit this child's development stage.
3. Write your recommendation in a beautifully formatted, joyful parent-friendly Markdown summary.
4. Keep the tone loving, enthusiastic, professional, and full of fairy-tale stardust.`;

    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const recommendationText = response.text || "We suggest checking out our books section!";
    addApiLog("POST", "/api/ai/recommend", 200, req.body, { response: recommendationText, mockMode: false });
    res.json({ response: recommendationText, mockMode: false });
  } catch (error: any) {
    console.error("Gemini Recommender Error:", error);
    res.status(500).json({ error: "Gemini server feedback error. Check API secrets." });
  }
});


// --- VITE MIDDLEWARE SETUP ---

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TinyTreasure backend server running happily on port ${PORT}!`);
  });
}

startServer();

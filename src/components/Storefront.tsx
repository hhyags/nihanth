import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Search, 
  Star, 
  Heart, 
  Sparkles, 
  ArrowRight, 
  Plus, 
  Minus, 
  Trash2, 
  Package, 
  ChevronRight, 
  BookOpen, 
  X,
  MapPin,
  CheckCircle,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product, CartItem, Review } from "../types.ts";

interface StorefrontProps {
  token: string | null;
  onOpenAuth: () => void;
  onTriggerLog: () => void;
}

export default function Storefront({ token, onOpenAuth, onTriggerLog }: StorefrontProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Cart & Wishlist states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  
  // Custom reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  
  // Checkout flow
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [address, setAddress] = useState("");
  const [recentOrder, setRecentOrder] = useState<any | null>(null);

  // Load products & customer states
  const fetchProducts = async () => {
    try {
      let url = "/api/products";
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (search) params.append("search", search);
      if (params.toString()) url += "?" + params.toString();
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCartAndWishlist = async () => {
    if (!token) {
      setCart([]);
      setWishlist([]);
      return;
    }
    try {
      const headers = { "Authorization": `Bearer ${token}` };
      
      const cartRes = await fetch("/api/cart", { headers });
      const cartData = await cartRes.json();
      if (cartData.cart) setCart(cartData.cart);

      const wishRes = await fetch("/api/wishlist", { headers });
      const wishData = await wishRes.json();
      if (wishData.wishlist) setWishlist(wishData.wishlist);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, search]);

  useEffect(() => {
    fetchCartAndWishlist();
  }, [token]);

  // Product Selection/Inspect details
  const inspectProduct = async (product: Product) => {
    setSelectedProduct(product);
    try {
      const res = await fetch(`/api/reviews/${product.id}`);
      const data = await res.json();
      if (data.reviews) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add/Update Cart Action
  const updateCartQuantity = async (productId: string, qty: number) => {
    if (!token) {
      onOpenAuth();
      return;
    }
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity: qty })
      });
      const data = await res.json();
      if (data.cart) {
        setCart(data.cart);
        onTriggerLog();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Wishlist
  const toggleWishlist = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) {
      onOpenAuth();
      return;
    }
    try {
      const res = await fetch("/api/wishlist/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      if (data.wishlist) {
        setWishlist(data.wishlist);
        onTriggerLog();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Review
  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      onOpenAuth();
      return;
    }
    if (!selectedProduct) return;

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          rating: newRating,
          comment: newComment
        })
      });

      const data = await res.json();
      if (data.review) {
        setReviews([...reviews, data.review]);
        setNewComment("");
        setNewRating(5);
        
        // Update product metadata locally
        if (data.product) {
          setSelectedProduct(data.product);
          setProducts(products.map(p => p.id === data.product.id ? data.product : p));
        }
        
        onTriggerLog();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Checkout submit
  const submitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ shippingAddress: address })
      });

      const data = await res.json();
      if (data.order) {
        setRecentOrder(data.order);
        setCart([]); // Reset Cart
        setAddress("");
        setIsCheckingOut(false);
        onTriggerLog();
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const categories = [
    { key: "", label: "🧸 All Stores", desc: "Magic Treasures" },
    { key: "toys", label: "🦄 Toy Palace", desc: "Sensory & Action" },
    { key: "clothes", label: "👕 Cozy Fits", desc: "Organic Fabrics" },
    { key: "accessories", label: "🎒 Adventure Gear", desc: "Backpacks & Star hats" },
    { key: "books", label: "📚 Tale Haven", desc: "Whimsical Stories" }
  ];

  return (
    <div id="storefront-root" className="space-y-8">
      {/* Hero Welcome Slide */}
      <div className="bg-gradient-to-r from-brand-peach/20 via-brand-pink/15 to-brand-blue/20 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 bg-[radial-gradient(#FF8E9E_2px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 rounded-full border border-brand-pink/20 text-brand-pink text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" /> Premium Children Boutique
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-slate-800 leading-tight">
            Magical gear for tiny spirits & big adventures!
          </h1>
          <p className="text-sm md:text-base text-slate-600 leading-relaxed max-w-lg">
            Heirloom wooden sensory toys, organic double-knit cotton garments, custom-designed kid backpacks, and illustrated bedtime moral tales of empathy.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button 
              onClick={() => { setCategory("toys"); }}
              className="px-4 py-2 bg-brand-pink text-white rounded-xl text-xs font-medium hover:bg-brand-pink/90 shadow-sm shadow-brand-pink/20 transition-all flex items-center gap-1"
            >
              Explore Toys <ArrowRight className="w-3 h-3" />
            </button>
            <button 
              onClick={() => { setCategory("books"); }}
              className="px-4 py-2 bg-brand-blue text-slate-800 rounded-xl text-xs font-medium hover:bg-brand-blue/90 transition-all flex items-center gap-1"
            >
              Bedtime Tales <BookOpen className="w-3.5 h-3.5 text-slate-800" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        {/* Category Pill Sliders */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex flex-col items-start ${
                category === cat.key
                  ? "bg-brand-navy text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100/80"
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[9px] font-normal ${category === cat.key ? "text-brand-peach" : "text-slate-400"}`}>
                {cat.desc}
              </span>
            </button>
          ))}
        </div>

        {/* Search controls */}
        <div className="relative flex-1 max-w-xs min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search toy, clothes, tale..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border-0 rounded-xl text-xs focus:ring-2 focus:ring-brand-pink/30 focus:outline-none placeholder:text-slate-400 leading-none"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action drawers triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsWishlistOpen(true)}
            className="p-2.5 bg-slate-50 hover:bg-brand-peach/10 text-slate-600 hover:text-brand-pink rounded-xl relative transition-all"
            title="Wishlist"
          >
            <Heart className="w-4 h-4" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-pink text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="px-4 py-2.5 bg-brand-pink hover:bg-brand-pink/90 text-white rounded-xl flex items-center gap-2 font-semibold text-xs transition-all shadow-sm shadow-brand-pink/10"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Bag</span>
            <span className="bg-white/25 px-1.5 py-0.5 rounded-md text-[10px] font-bold">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </button>
        </div>
      </div>

      {/* Main product catalog display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            key={product.id}
            onClick={() => inspectProduct(product)}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:shadow-slate-100 transition-all cursor-pointer group flex flex-col justify-between h-full relative"
          >
            {/* Image section */}
            <div className="relative aspect-square overflow-hidden bg-slate-50">
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
              />
              <button
                onClick={(e) => toggleWishlist(product.id, e)}
                className="absolute right-3 top-3 p-2 bg-white/90 hover:bg-white text-slate-400 hover:text-brand-pink rounded-full shadow-sm transition-all"
              >
                <Heart className={`w-3.5 h-3.5 ${wishlist.some(w => w.id === product.id) ? "fill-brand-pink text-brand-pink" : ""}`} />
              </button>
              
              <span className="absolute left-3 top-3 px-2 py-1 bg-brand-navy/85 backdrop-blur-xs text-white text-[9px] font-bold rounded-md tracking-wider uppercase">
                {product.category}
              </span>
            </div>

            {/* Info contents */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>👶 {product.ageGroup}</span>
                  <div className="flex items-center gap-1 font-semibold text-brand-gold">
                    <Star className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
                    <span className="text-slate-700">{product.rating}</span>
                  </div>
                </div>

                <h3 className="font-display font-semibold text-slate-850 text-xs md:text-sm line-clamp-1 group-hover:text-brand-pink transition-colors">
                  {product.name}
                </h3>
                <p className="text-slate-500 text-[11px] line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Sparkly dynamic quote if generated */}
              {product.sparklyIntro && (
                <div className="py-1 px-2 border border-brand-peach/20 bg-brand-peach/10 text-brand-pink text-[10px] rounded-lg font-medium">
                  {product.sparklyIntro}
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                <span className="text-slate-800 font-display font-bold text-sm">
                  ${product.price.toFixed(2)}
                </span>
                
                {product.stock <= 0 ? (
                  <span className="text-red-500 text-[9px] font-bold uppercase tracking-wider bg-red-50 py-1 px-2 rounded-md">
                    Out of Stock
                  </span>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateCartQuantity(product.id, 1);
                    }}
                    className="p-1 px-2 bg-slate-55 hover:bg-brand-pink text-slate-800 hover:text-white rounded-lg text-[10px] font-semibold transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {products.length === 0 && (
          <div className="col-span-full py-16 text-center space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-display font-semibold text-slate-700">No Treasures Found</h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">
              We couldn't search any toys or tale books matching "{search}". Try resetting the search or look in other categories!
            </p>
            <button 
              onClick={() => { setSearch(""); setCategory(""); }}
              className="text-xs font-semibold text-brand-pink hover:underline"
            >
              Reset Search Filter
            </button>
          </div>
        )}
      </div>

      {/* Product Detail Modal Slide */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setSelectedProduct(null)}
            ></motion.div>

            {/* Slide */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-white shadow-2xl overflow-y-auto p-6 md:p-8 flex flex-col justify-between"
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold text-brand-pink tracking-wider uppercase bg-brand-pink/10 px-2 py-1 rounded-md">
                    {selectedProduct.category}
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold font-display text-slate-850 mt-2">
                    {selectedProduct.name}
                  </h2>
                  <div className="flex items-center gap-1 mt-1 text-slate-500 text-xs">
                    <span>Target Age Group:</span>
                    <strong className="text-slate-700">{selectedProduct.ageGroup}</strong>
                  </div>
                </div>

                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 shadow-xs border border-slate-50">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-y border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Premium Value</span>
                    <strong className="text-xl font-display text-slate-850">${selectedProduct.price.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block text-right">Stock Reserve</span>
                    <strong className={`text-xs ${selectedProduct.stock > 0 ? "text-slate-600" : "text-rose-500 font-bold"}`}>
                      {selectedProduct.stock > 0 ? `${selectedProduct.stock} items remaining` : "Out of Stock"}
                    </strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-display font-semibold text-xs uppercase tracking-wide text-slate-400">
                    Product Adventure Details
                  </h4>
                  <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-display font-semibold text-xs uppercase tracking-wide text-slate-400">
                    Growth Features & Specifications
                  </h4>
                  <ul className="grid grid-cols-1 gap-1.5 text-xs text-slate-600">
                    {selectedProduct.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-brand-pink mt-1">⭐️</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Consumer Reviews Module */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-sm text-slate-850">
                      Parent Assessments ({reviews.length})
                    </h3>
                    <div className="flex items-center gap-1 font-bold text-brand-gold text-xs">
                      <Star className="w-4 h-4 fill-brand-gold text-brand-gold" />
                      <span>{selectedProduct.rating} / 5</span>
                    </div>
                  </div>

                  {/* Reviews list */}
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="bg-slate-50 p-3 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <strong className="text-slate-700">{rev.userName}</strong>
                          <span className="text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-0.5 text-brand-gold">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-brand-gold text-brand-gold" />
                          ))}
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed italic">
                          "{rev.comment}"
                        </p>
                      </div>
                    ))}
                    {reviews.length === 0 && (
                      <p className="text-[11px] text-slate-400 text-center py-4">
                        Be the first parent to share your magical review!
                      </p>
                    )}
                  </div>

                  {/* Submit Review Form */}
                  {token ? (
                    <form onSubmit={submitReview} className="space-y-3 p-3 bg-brand-cream/40 rounded-xl border border-brand-peach/20">
                      <h4 className="text-slate-755 text-xs font-semibold">Write an assessment</h4>
                      <div className="flex gap-2 items-center">
                        <span className="text-xs text-slate-500">My Rating:</span>
                        <div className="flex gap-1 cursor-pointer">
                          {[1,2,3,4,5].map((s) => (
                            <Star
                              key={s}
                              onClick={() => setNewRating(s)}
                              className={`w-4 h-4 ${s <= newRating ? "fill-brand-gold text-brand-gold" : "text-slate-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="My family loves this because..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-brand-pink focus:outline-none"
                        required
                      />
                      <button
                        type="submit"
                        className="w-full py-2 bg-brand-pink text-white text-xs font-semibold rounded-lg hover:bg-brand-pink/90 transition-all"
                      >
                        Submit Bedtime Review
                      </button>
                    </form>
                  ) : (
                    <div className="text-center p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500">
                      Please{" "}
                      <button type="button" onClick={onOpenAuth} className="text-brand-pink underline hover:text-brand-pink/90 font-bold">
                        Register/Login
                      </button>{" "}
                      to post a child product review.
                    </div>
                  )}
                </div>
              </div>

              {/* Keep adding to bag fixed helper */}
              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Fast Express Dispatch</span>
                {selectedProduct.stock <= 0 ? (
                  <button disabled className="px-6 py-2.5 bg-slate-200 text-slate-450 rounded-xl text-xs font-semibold">
                    Sold Out
                  </button>
                ) : (
                  <button
                    onClick={() => updateCartQuantity(selectedProduct.id, 1)}
                    className="px-6 py-2.5 bg-brand-navy hover:bg-brand-navy/95 text-white font-semibold rounded-xl text-xs transition-all shadow-sm"
                  >
                    Add to Shop Bag
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shopping Bag Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setIsCartOpen(false)}
            ></motion.div>

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-white shadow-2xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-rose-50">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-brand-pink" />
                    <h2 className="font-display font-bold text-md text-slate-850">Your Cozy Shop Bag</h2>
                  </div>
                  <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Checkout success message */}
                {recentOrder && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-slate-700 text-xs space-y-2 relative"
                  >
                    <button onClick={() => setRecentOrder(null)} className="absolute right-2 top-2 p-1 text-slate-411 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-1 text-emerald-650 font-semibold text-[13px]">
                      <CheckCircle className="w-4 h-4" /> Checkout Completed!
                    </div>
                    <p>Order reference: <strong>#{recentOrder.id}</strong>. Packagers are preparing your items.</p>
                    <div className="pt-2 border-t border-emerald-100/50 space-y-1">
                      <div>Total amount paid: <strong>${recentOrder.totalAmount.toFixed(2)}</strong></div>
                      <div className="text-[10px] text-slate-500">Delivery destination: {recentOrder.shippingAddress}</div>
                    </div>
                  </motion.div>
                )}

                {/* Items loop */}
                <div className="space-y-4 max-h-[50vh] overflow-y-auto mt-4 pr-1">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex gap-3 bg-slate-50 p-3 rounded-xl relative group">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-white shrink-0">
                        <img src={item.product.image} alt={item.product.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <h4 className="font-semibold text-slate-800 text-xs line-clamp-1">{item.product.name}</h4>
                        <span className="text-slate-500 font-bold text-xs">${item.product.price.toFixed(2)}</span>
                        
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                            className="p-1 bg-white border border-slate-100 hover:bg-slate-100 text-slate-500 rounded-md"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="text-xs font-bold text-slate-700 w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                            className="p-1 bg-white border border-slate-100 hover:bg-slate-100 text-slate-500 rounded-md"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => updateCartQuantity(item.productId, 0)}
                        className="absolute right-3 top-3 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {cart.length === 0 && (
                    <div className="text-center py-12 space-y-2">
                      <ShoppingBag className="w-10 h-10 text-slate-200 mx-auto" />
                      <p className="text-slate-400 text-xs">Your shopping bag is currently empty.</p>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="text-xs text-brand-pink hover:underline font-semibold"
                      >
                        Continue Exploring
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Checkout Block */}
              {cart.length > 0 && (
                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Bag Subtotal</span>
                      <strong className="text-slate-800">${getSubtotal().toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Standard Fragile Delivery</span>
                      <span className="text-green-500 font-semibold">FREE / Sponsored</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-2 text-sm font-bold text-slate-800">
                      <span>Grand Total</span>
                      <span>${getSubtotal().toFixed(2)}</span>
                    </div>
                  </div>

                  {isCheckingOut ? (
                    <form onSubmit={submitCheckout} className="p-3 bg-brand-cream/40 border border-brand-peach/15 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-brand-pink" /> Shipping Address
                        </h4>
                        <button type="button" onClick={() => setIsCheckingOut(false)} className="text-[10px] text-slate-400 hover:underline">
                          Cancel
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="House No, Street name, State Zip"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-brand-pink focus:outline-none"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-brand-navy hover:bg-brand-navy/95 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
                      >
                        Submit Order & Pay <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => {
                        if (!token) {
                          onOpenAuth();
                        } else {
                          setIsCheckingOut(true);
                        }
                      }}
                      className="w-full py-3 bg-brand-pink hover:bg-brand-pink/90 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-brand-pink/15"
                    >
                      Proceed to Checkout <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Wishlist Drawer */}
      <AnimatePresence>
        {isWishlistOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setIsWishlistOpen(false)}
            ></motion.div>

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-sm h-full bg-white shadow-2xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-rose-50">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-brand-pink fill-brand-pink" />
                    <h2 className="font-display font-bold text-md text-slate-850">Saved Treasures</h2>
                  </div>
                  <button onClick={() => setIsWishlistOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto mt-4 pr-1">
                  {wishlist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setIsWishlistOpen(false);
                        inspectProduct(item);
                      }}
                      className="flex gap-3 bg-slate-50 p-2.5 rounded-xl cursor-pointer hover:bg-slate-100 transition-all text-left"
                    >
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-white shrink-0">
                        <img src={item.image} alt={item.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 text-xs truncate">{item.name}</h4>
                        <span className="text-slate-500 font-semibold text-xs">${item.price.toFixed(2)}</span>
                        <div className="text-[10px] text-slate-400">👧 {item.ageGroup}</div>
                      </div>
                    </div>
                  ))}

                  {wishlist.length === 0 && (
                    <div className="text-center py-16 space-y-2">
                      <Heart className="w-10 h-10 text-slate-200 mx-auto" />
                      <p className="text-slate-400 text-xs">No favorites added here yet.</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsWishlistOpen(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Close Shelf Back
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

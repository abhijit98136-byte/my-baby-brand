import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "./api";
import { toast } from "sonner";

const AppCtx = createContext(null);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pk_cart") || "[]"); } catch { return []; }
  });
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pk_wish") || "[]"); } catch { return []; }
  });
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pk_recent") || "[]"); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem("pk_cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem("pk_wish", JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem("pk_recent", JSON.stringify(recentlyViewed)); }, [recentlyViewed]);

  useEffect(() => {
    const token = localStorage.getItem("pk_token");
    if (token) {
      api.get("/auth/me").then((r) => setUser(r.data)).catch(() => {
        localStorage.removeItem("pk_token");
      });
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("pk_token", data.token);
    setUser(data.user);
    toast.success(`Welcome back, ${data.user.name}!`);
    return data.user;
  };

  const signup = async (payload) => {
    const { data } = await api.post("/auth/signup", payload);
    localStorage.setItem("pk_token", data.token);
    setUser(data.user);
    toast.success("Account created successfully");
    return data.user;
  };

  const otpVerify = async (payload) => {
    const { data } = await api.post("/auth/otp/verify", payload);
    localStorage.setItem("pk_token", data.token);
    setUser(data.user);
    toast.success("Logged in via OTP");
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("pk_token");
    setUser(null);
    toast.success("Logged out");
  };

  const addToCart = useCallback((product, qty = 1) => {
    setCart((prev) => {
      const ex = prev.find((p) => p.id === product.id);
      if (ex) return prev.map((p) => p.id === product.id ? { ...p, qty: p.qty + qty } : p);
      return [...prev, { id: product.id, name: product.name, price: product.price, mrp: product.mrp, image: product.images?.[0], slug: product.slug, qty }];
    });
    toast.success(`${product.name} added to cart`);
  }, []);

  const updateQty = (id, qty) => {
    if (qty <= 0) return setCart((p) => p.filter((i) => i.id !== id));
    setCart((p) => p.map((i) => i.id === id ? { ...i, qty } : i));
  };

  const removeFromCart = (id) => setCart((p) => p.filter((i) => i.id !== id));
  const clearCart = () => setCart([]);

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const ex = prev.find((p) => p.id === product.id);
      if (ex) { toast("Removed from wishlist"); return prev.filter((p) => p.id !== product.id); }
      toast.success("Added to wishlist");
      return [...prev, { id: product.id, name: product.name, price: product.price, image: product.images?.[0], slug: product.slug }];
    });
  };

  const addRecentlyViewed = (product) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      return [{ id: product.id, name: product.name, price: product.price, image: product.images?.[0], slug: product.slug }, ...filtered].slice(0, 8);
    });
  };

  return (
    <AppCtx.Provider value={{
      user, setUser, login, signup, otpVerify, logout,
      cart, addToCart, updateQty, removeFromCart, clearCart,
      wishlist, toggleWishlist,
      recentlyViewed, addRecentlyViewed,
    }}>
      {children}
    </AppCtx.Provider>
  );
};

export const useApp = () => useContext(AppCtx);

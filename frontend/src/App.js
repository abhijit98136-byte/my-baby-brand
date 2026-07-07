import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import axios from "axios";
import { AppProvider } from "@/lib/store";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import Mascot from "@/components/Mascot";
import CursorFollower from "@/components/CursorFollower";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Auth from "@/pages/Auth";
import AuthCallback from "@/pages/AuthCallback";
import Account from "@/pages/Account";
import Wishlist from "@/pages/Wishlist";
import TrackOrder from "@/pages/TrackOrder";
import OrderSuccess from "@/pages/OrderSuccess";
import Admin from "@/pages/Admin";
import { About, Contact, FAQ, Privacy, Returns, Terms } from "@/pages/InfoPages";

axios.defaults.withCredentials = true;

function Router() {
  const location = useLocation();
  // Detect session_id in URL fragment synchronously (from Emergent Google Auth callback)
  if (location.hash && location.hash.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/product/:slug" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/account" element={<Account />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/track" element={<TrackOrder />} />
      <Route path="/track/:orderNumber" element={<TrackOrder />} />
      <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/return-policy" element={<Returns />} />
      <Route path="/terms" element={<Terms />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App bg-cream text-ink font-body min-h-screen">
      <AppProvider>
        <BrowserRouter>
          <Navbar />
          <Router />
          <Footer />
          <ChatBot />
          <Mascot />
          <CursorFollower />
          <Toaster position="top-center" richColors />
        </BrowserRouter>
      </AppProvider>
    </div>
  );
}

export default App;

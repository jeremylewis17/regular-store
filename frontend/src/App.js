import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout";
import { Navbar } from "./components/navbar";
import { Footer } from "./components/footer";
import { Shop } from "./pages/shop/shop";
import { Contact } from "./pages/contact";
import { Cart } from "./pages/cart/cart";
import { Register } from "./pages/register/register";
import { Login } from "./pages/login/login";
import { ShopContextProvider } from "./context/shop-context";
import { AuthContextProvider } from "./context/auth-context";

function App() {
  return (
    <div className="App">
      <AuthContextProvider>
        <ShopContextProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Shop />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/cart" element={<Cart />} />
              </Routes>
            </Layout>
          </Router>
        </ShopContextProvider>
      </AuthContextProvider>
    </div>
  );
}

export default App;
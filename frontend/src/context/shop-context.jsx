import { createContext, useContext, useEffect, useState, useCallback } from "react";

import { 
  fetchCart, 
  addToCart as apiAddToCart, 
  removeFromCart as apiRemoveFromCart, 
  checkoutDB as apiCheckoutDB } from "../apis/cart";
import { fetchOrder, fetchOrders } from "../apis/order";
import { fetchProducts, fetchProduct } from "../apis/product";
import { fetchUser, updateUser, loginUser, registerUser } from "../apis/user";
import { AuthContext } from "./auth-context";

export const ShopContext = createContext(null);


export const ShopContextProvider = (props) => {
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState();
  const [products, setProducts] = useState([]);
  const { currentUser } = useContext(AuthContext);
  const user_id = currentUser? currentUser.user_id : null;

  const fetchCartData = async () => {
    try {
      const cartData = await fetchCart(user_id);
      if (cartData.empty === true) {
        setCartItems([]);
      } else {
        setCartItems(cartData);
      }
    } catch (error) {
      console.error("Error fetching cart data: ", error);
    }
  };

  const fetchOrderData = async () => {
    try {
      const orderData = await fetchOrders(user_id);
        setOrders(orderData);
    } catch (error) {
      console.error("Error fetching orders data: ", error);
    }
  };

  async function fetchProductsData() {
    try {
      const productsData = await fetchProducts();
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products: ", error);
    }
  }

  useEffect(() => {

    fetchProductsData();
    console.log('Fetching Products Data');
    fetchCartData();
    console.log('Fetching Cart Data');
    fetchOrderData();
    console.log('Fetching Order Data');
  }, []);

  function getTotalCartAmount() {
    let totalAmount = 0;
    
    for (const item of cartItems) { 
      totalAmount += item.price * item.quantity;
    }
    totalAmount = Math.round(totalAmount * 100) / 100;
  
    return totalAmount.toFixed(2);
  }
  

  async function addToCart(item_id, quantity) {
    try {
      await apiAddToCart(user_id, item_id, quantity);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
    try {
      const cartData = await fetchCart(user_id);
      setCartItems(cartData);
      } catch (error) {
        console.error("Error fetching cart data: ", error);
      }
    };

  async function removeFromCart(item_id) {
    try {
      await apiRemoveFromCart(user_id, item_id);
    } catch (error) {
      console.error("error removing from cart: ", error);
    }
    try {
      const cartData = await fetchCart(user_id);
      if (cartData.empty === true) {
        setCartItems([]);
      } else {
        setCartItems(cartData);
      }
      } catch (error) {
        console.error("Error fetching cart data: ", error);
      }
  };

  async function checkoutDB() {
    try {
      // Call the API to perform checkout
      const res = await apiCheckoutDB(user_id);

      // Clear the cart items in the state
      setCartItems([]);
      fetchProductsData();
      return res;
    } catch (error) {
      console.error("Error during checkout:", error);
    }
  };

  const contextValue = {
    user_id,
    cartItems,
    orders,
    products,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    checkoutDB,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};
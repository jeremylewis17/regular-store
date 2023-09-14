import { createContext, useEffect, useState } from "react";

import { 
  fetchCart, 
  addToCart as apiAddToCart, 
  removeFromCart as apiRemoveFromCart, 
  checkout as apiCheckout } from "../apis/cart";
import { fetchOrder, fetchOrders } from "../apis/order";
import { fetchProducts, fetchProduct } from "../apis/product";
import { fetchUser, updateUser, loginUser, registerUser } from "../apis/user";

export const ShopContext = createContext(null);


export const ShopContextProvider = (props) => {
  const [user_id, setUser_id] = useState();
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);


   // Fetch Data from API
   useEffect(() => {
    async function fetchProductsData() {
      try {
        const productsData = await fetchProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    }

    async function fetchCartData() {
      try {
      const cartData = await fetchCart(user_id);
      setCartItems(cartData);
      } catch (error) {
        console.error("Error fetching cart data: ", error);
      }
    }

    fetchProductsData();
    fetchCartData(user_id);
  }, []);


  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
        totalAmount += item.price * item.quantity;
    }
    return totalAmount;
  };

  const addToCart = async (item_id, quantity) => {
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

  const removeFromCart = async (item_id) => {
    try {
      await apiRemoveFromCart(user_id, item_id);
    } catch (error) {
      console.error("error removing from cart: ", error);
    }
    try {
      const cartData = await fetchCart(user_id);
      setCartItems(cartData);
      } catch (error) {
        console.error("Error fetching cart data: ", error);
      }
  };

  const checkout = async () => {
    try {
      // Call the API to perform checkout
      await apiCheckout(user_id);

      // Clear the cart items in the state
      setCartItems([]);
    } catch (error) {
      console.error("Error during checkout:", error);
    }
  };

  const contextValue = {
    user_id,
    cartItems,
    products,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    checkout,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};
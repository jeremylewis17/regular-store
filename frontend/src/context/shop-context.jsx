import { createContext, useContext, useEffect, useState } from "react";

import { 
  fetchCart, 
  addToCart as apiAddToCart, 
  removeFromCart as apiRemoveFromCart, 
  checkout as apiCheckout } from "../apis/cart";
import { fetchOrder, fetchOrders } from "../apis/order";
import { fetchProducts, fetchProduct } from "../apis/product";
import { fetchUser, updateUser, loginUser, registerUser } from "../apis/user";
import { AuthContext } from "./auth-context";

export const ShopContext = createContext(null);


export const ShopContextProvider = (props) => {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const { currentUser } = useContext(AuthContext);
  const user_id = currentUser? currentUser.user_id : null;

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
  }, [user_id]);


  function getTotalCartAmount() {
    let totalAmount = 0;
    for (const item in cartItems) {
        totalAmount += item.price * item.quantity;
    }
    return totalAmount;
  };

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
      setCartItems(cartData);
      } catch (error) {
        console.error("Error fetching cart data: ", error);
      }
  };

  async function checkout() {
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
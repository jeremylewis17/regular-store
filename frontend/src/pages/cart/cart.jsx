import React, { useContext } from "react";
import { ShopContext } from "../../context/shop-context";
import { AuthContext } from "../../context/auth-context";

import { CartItem } from "./cart-item";
import { useNavigate } from "react-router-dom";

import "./cart.css";
export const Cart = () => {
  const { cartItems, getTotalCartAmount, checkout } = useContext(ShopContext);
  const { currentUser } = useContext(AuthContext);

  const navigate = useNavigate();

  return (
    <div className="cart">
      <div>
        <h1>Your Cart Items</h1>
      </div>
      <div className="cart">
        { cartItems && cartItems.map((product) => {
            return <CartItem key={product.item_id} data={product} />;
        })}
      </div>

      {getTotalCartAmount() > 0 ? (
        <div className="checkout">
          <p> Subtotal: ${getTotalCartAmount()} </p>
          <button onClick={() => navigate("/")}> Continue Shopping </button>
          <button
            onClick={() => {
              checkout();
              navigate("/checkout");
            }}
          >
            {" "}
            Checkout{" "}
          </button>
        </div>
      ) : (<div className="checkout">
            <h1> Your Shopping Cart is Empty</h1>
            <button onClick={() => navigate("/")}> Continue Shopping </button>
          </div>
        
      )}
    </div>
  );
};
import React, { useContext } from "react";
import { StripeContainer } from "../../components/stripeContainer";
import { ShopContext } from "../../context/shop-context";
import { AuthContext } from "../../context/auth-context";
import { useNavigate } from "react-router-dom";


export const CheckoutConfirm = () => {
  const { cartItems, getTotalCartAmount, checkout } = useContext(ShopContext);
  const { currentUser } = useContext(AuthContext);

  const navigate = useNavigate();

  return (
    <h2>Payment Successful. Your order has been placed.</h2>
  );
};
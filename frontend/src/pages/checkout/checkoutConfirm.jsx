import React, { useContext,useEffect } from "react";
import { StripeContainer } from "../../components/stripeContainer";
import { ShopContext } from "../../context/shop-context";
import { AuthContext } from "../../context/auth-context";
import { useNavigate, useLocation } from "react-router-dom";

export const CheckoutConfirm = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const paymentStatus = queryParams.get("redirect_status");
  const { setCurrentUser } = useContext(AuthContext);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    setCurrentUser(user);
  }, []);

  return (
    <div>
      {paymentStatus === "succeeded" ? (
        <p>Payment succeeded!</p>
      ) : (
        <p>Payment failed or unexpected status.</p>
      )}
    </div>
  );
};

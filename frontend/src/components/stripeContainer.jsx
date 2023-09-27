import React, { useContext, useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { PaymentForm } from "./paymentForm";
import { checkoutStripe } from "../apis/cart";
import "./paymentForm.module.css";

import { AuthContext } from "../context/auth-context";
import { ShopContext } from "../context/shop-context";

const PUBLIC_KEY =
  "pk_test_51NsuROEzEyi6rNqY5t3rweasvn5LTvgrT2Q1RqfwvphjbByvjngK9I8fxC2RNvucDkcu0ooHuBlXPng2jZCRvT9e003u2DKlog";
const stripePromise = loadStripe(PUBLIC_KEY);

export const StripeContainer = () => {
  const [clientSecret, setClientSecret] = useState("");
  const { currentUser } = useContext(AuthContext);
  const { cartItems } = useContext(ShopContext);

  const user_id = currentUser ? currentUser.user_id : null;

  useEffect(() => {
    if (cartItems.length > 0) {
      checkoutStripe(user_id).then((res) => setClientSecret(res.clientSecret));
    }
  }, []); 

  const appearance = {
    theme: "stripe",
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="stripe-wrapper">
    <div className="stripe-container">
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <PaymentForm props={user_id}/>
        </Elements>
      )}
    </div>
    </div>
  );
};

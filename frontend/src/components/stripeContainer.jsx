import React, { useContext, useState, useEffect } from "react";
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import { PaymentForm } from "./paymentForm";
import { checkout } from "../apis/cart";
import "./paymentForm.module.css";

import { AuthContext } from "../context/auth-context";

const PUBLIC_KEY = "pk_test_51NsuROEzEyi6rNqY5t3rweasvn5LTvgrT2Q1RqfwvphjbByvjngK9I8fxC2RNvucDkcu0ooHuBlXPng2jZCRvT9e003u2DKlog";
const stripePromise = loadStripe(PUBLIC_KEY);

export const StripeContainer = () => {
  const [clientSecret, setClientSecret] = useState("");
  const { currentUser } = useContext(AuthContext);
  const user_id = currentUser? currentUser.user_id : null;

  useEffect(() => {
    checkout(user_id, 0).then((res) => setClientSecret(res.clientSecret));
  }, []);

  const appearance = {
    theme: 'stripe',
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="stripe-container">
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
        <PaymentForm />
      </Elements>
      )}
    </div>
  );
};
import React, { useContext } from "react";
import { ShopContext } from "../../context/shop-context";
import { AuthContext } from "../../context/auth-context";
import { Order } from "./order";
import { useNavigate } from "react-router-dom";
import "./order.css";

export const Orders = () => {
  const { orders } = useContext(ShopContext);
  const { currentUser } = useContext(AuthContext);

  const navigate = useNavigate();

  return (
    <div className="orders">
      <div>
        <h1>Your Order History</h1>
      </div>
      {orders && orders.map((order) => (
        <Order key={order.order_id} data={order} />
      ))}
      {orders.length === 0 && <h2>You have not placed any orders</h2>}
    </div>
  );
};

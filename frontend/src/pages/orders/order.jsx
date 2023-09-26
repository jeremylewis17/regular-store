import React, { useContext } from "react";
import { ShopContext } from "../../context/shop-context";

export const Order = (props) => {
  const { order_id, order_date, total_price, status } = props.data;

  const dateParser = (date) => {
    const cleanDate = date.slice(0, 10);
    return cleanDate;
  }

  return (
    <div className="order">
      <h4>Order ID: {order_id}</h4> {/* Order ID at the top */}
      <div className="description">
        <p>Placed On: {dateParser(order_date)}</p>
        <p>Total: ${total_price}</p>
      </div>
      <p>Status: {status}</p>
    </div>
  );
};

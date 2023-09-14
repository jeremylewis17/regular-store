import React, { useContext } from "react";
import { ShopContext } from "../../context/shop-context";

export const CartItem = (props) => {
  const { item_id, name, description, price, quantity } = props.data;
  const { cartItems, addToCart, removeFromCart } = useContext(ShopContext);

  function getQuantityByItemId (cartItems, itemId) {
    for (const item of cartItems) {
      if (item.item_id === itemId) {
        return item.quantity;
      }
    }
    return 0;
  }

  return (
    <div className="cartItem">
      <div className="description">
        <p>
          <b>{ name }</b>
        </p>
        <p> Price: ${price}</p>
        <div className="countHandler">
          <button onClick={() => removeFromCart(item_id)}> - </button>
          <input
            value={getQuantityByItemId(cartItems, item_id)}
            onChange={(e) => addToCart(item_id, Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};
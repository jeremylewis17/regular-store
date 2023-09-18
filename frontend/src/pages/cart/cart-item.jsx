import React, { useContext, useState } from "react";
import { ShopContext } from "../../context/shop-context";

export const CartItem = (props) => {
  const { item_id, name, description, price } = props.data;
  const { cartItems, addToCart, removeFromCart } = useContext(ShopContext);
  const [inputQuantity, setInputQuantity] = useState(getQuantityByItemId(cartItems, item_id));

  function getQuantityByItemId(cartItems, itemId) {
    for (const item of cartItems) {
      if (item.item_id === itemId) {
        return item.quantity;
      }
    }
    return 0;
  }

  const handleQuantityChange = () => {
   
    addToCart(item_id, Number(inputQuantity));
  };

  return (
    <div className="cartItem">
      <div className="description">
        <p>
          <b>{name}</b>
        </p>
        <p>Price: ${price}</p>
        <div className="countHandler">
          <p>Quantity: </p>
          <input
            value={inputQuantity}
            onChange={(e) => setInputQuantity(e.target.value)}
            onBlur={handleQuantityChange}
          />
          <button onClick={() => removeFromCart(item_id)}>Remove</button>
        </div>
      </div>
    </div>
  );
};

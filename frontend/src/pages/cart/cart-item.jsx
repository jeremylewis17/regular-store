import React, { useContext, useState } from "react";
import { ShopContext } from "../../context/shop-context";

export const CartItem = (props) => {
  const { item_id, name, description, price } = props.data;
  const { cartItems, addToCart, removeFromCart, products } = useContext(ShopContext);
  const [inputQuantity, setInputQuantity] = useState(getQuantityByItemId(cartItems, item_id));

  function getQuantityByItemId(listOfItems, itemId) {
    for (const item of listOfItems) {
      if (item.item_id === itemId) {
        return item.quantity;
      }
    }
    return 0;
  }

  const handleQuantityChange = () => {
    const maxQuantity = getQuantityByItemId(products, item_id);
  
    if (inputQuantity < 1) {
      setInputQuantity(1);
      addToCart(item_id, 1);
      alert("Quantity cannot be less than 1");
    } else if (inputQuantity > maxQuantity) {
      setInputQuantity(maxQuantity);
      addToCart(item_id, Number(maxQuantity));
      alert(`Quantity cannot exceed the available stock (${maxQuantity})`);
    } else if (Number.isInteger(inputQuantity)) {
      addToCart(item_id, Number(inputQuantity));
    } else{
      addToCart(item_id, Math.floor(Number(inputQuantity)));
      setInputQuantity(Math.floor(Number(inputQuantity)));
      alert("Quantity must be a whole number");
    }
  
  };

  const handleKeyUp = (e) => {
    if (e.key === "Enter") {
      handleQuantityChange();
    }
  };

  return (
    <div className="cartItem">
      <div className="description">
        <p>
          <b>{name} ({getQuantityByItemId(cartItems, item_id)})</b>
        </p>
        <p>Price: ${price} each</p>
        <div className="countHandler">
          <p>Change Quantity: </p>
          <input
            value={inputQuantity}
            onChange={(e) => setInputQuantity(e.target.value)}
            onKeyUp={handleKeyUp}
            onBlur={handleQuantityChange}
          />
          <button onClick={() => removeFromCart(item_id)}>Remove Item</button>
        </div>
      </div>
    </div>
  );
};

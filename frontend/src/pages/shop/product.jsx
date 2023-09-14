import React, { useContext, useEffect } from "react";
import { ShopContext } from "../../context/shop-context";

export const Product = (props) => {
  const { item_id, name, description, price, quantity } = props.data;
  const { addToCart, cartItems } = useContext(ShopContext);

  function getQuantityByItemId (cartItems, itemId) {
    for (const item of cartItems) {
      if (item.item_id === itemId) {
        return item.quantity;
      }
    }
    return 0;
  }

  const cartItemCount = () => getQuantityByItemId(cartItems, item_id);
  const oneMoreItemCount = cartItemCount() + 1;
  

  return (
    <div className="product">
      <div className="description">
        <p className = "product-name">
          <b>{name}</b>
        </p>
        <p> ${price}. Quantity left: {quantity}</p>
        <p> {description}</p>
      </div>
      <button className="addToCartBttn" onClick={() => addToCart(item_id, oneMoreItemCount)}>
        Add To Cart {cartItemCount() > 0 && <> ({cartItemCount()})</>}
      </button>
    </div>
  );
};
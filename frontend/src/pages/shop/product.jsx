import React, { useContext, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ShopContext } from "../../context/shop-context";
import { AuthContext } from "../../context/auth-context";

export const Product = (props) => {
  const { item_id, name, description, price, quantity } = props.data;
  const { addToCart, cartItems } = useContext(ShopContext);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

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

  function handleAddToCart () {
    if (!currentUser) {
      navigate("/login");
    } else {
      if (quantity > 0) {
        addToCart(item_id, oneMoreItemCount);
      } else {
        alert("Cannot add to cart. Item sold out");
      }
    }
  }
  

  return (
    <div className="product">
      <div className="description">
        <p className = "product-name">
          <b>{name}</b>
        </p>
        <p> ${price}. Quantity left: {quantity}</p>
        <p> {description}</p>
      </div>
      {quantity > 0? (<button className="addToCartBttn" onClick={handleAddToCart}>
        Add To Cart {currentUser && cartItemCount() > 0 && <> ({cartItemCount()})</>}
      </button>) : 
      (<h4 className="SoldOut">Sold Out</h4>) }
    </div>
  );
};
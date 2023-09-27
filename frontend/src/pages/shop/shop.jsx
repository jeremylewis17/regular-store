import React, { useContext } from "react";
import { ShopContext } from "../../context/shop-context";

import { Product } from "./product";
import "./shop.css";

export const Shop = () => {
  const { products } = useContext(ShopContext);

  return (
    <div className="shop">
      <div className="shopTitle">
        <h1>Regular Store</h1>
        <p id="store-description">Your store for perfectly mundane items. Nothing special to see here.</p>
      </div>

      <div className="products">
        {products.map((product) => (
          <Product key={product.item_id} data={product} />
        ))}
      </div>
    </div>
  );
};
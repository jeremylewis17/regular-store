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
      </div>

      <div className="products">
        {products.map((product) => (
          <Product key={product.item_id} data={product} />
        ))}
      </div>
    </div>
  );
};
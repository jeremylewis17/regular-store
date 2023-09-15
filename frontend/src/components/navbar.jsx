import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "phosphor-react";
import "./navbar.css";
import { AuthContext } from "../context/auth-context";

export const Navbar = () => {
  const { currentUser, logoutUser } = useContext(AuthContext);
  const userName = currentUser? currentUser.username : null;

  return (
    <div className="navbar">
      <div className="links">
        { userName == null && <Link to="/login"> Login </Link>}
        { userName && <>Welcome, {userName}</>}
        <Link to="/"> Shop </Link>
        <Link to="/contact"> Contact </Link>
        { userName && (<Link to="/cart">
          <ShoppingCart size={27} />
        </Link>)}
        { userName && (<Link to="/login" onClick={logoutUser}> Logout </Link>)}
      </div>
    </div>
  );
};
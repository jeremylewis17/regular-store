// Layout.js
import React from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

export const Layout = ({ children }) => {
    return (
      <div className="app">
        <header className="header">
          <Navbar />
        </header>
        <main className="content">{children}</main>
        <footer className="footer">
          <Footer />
        </footer>
      </div>
    );
  };

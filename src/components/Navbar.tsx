import React from "react";
import compGif from "../assets/Comp 1.gif";
import "bootstrap/dist/css/bootstrap.min.css";

const Navbar = () => {
  return (
    <nav className="glass-navbar">
      <div className="text-center">
        <div className="row align-items-center">
          <div className="col">
            <img src={compGif} alt="Animation" className="navbar-gif" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

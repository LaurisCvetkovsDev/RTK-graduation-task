import React from "react";
import myGif from "../assets/000102401.gif";
import "bootstrap/dist/css/bootstrap.min.css";

const Navbar = () => {
  return (
    <nav className="glass-navbar">
      <div className=" text-center">
        <div className="row align-items-start">
          <div className="col">
            <h1>You have done 15 POMODOROS</h1>
          </div>
          <div className="col">
            <img
              src={myGif}
              alt="Bootstrap"
              width="100"
              className="img-fluid "
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

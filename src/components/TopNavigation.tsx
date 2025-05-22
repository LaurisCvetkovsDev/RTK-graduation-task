import React from "react";
import { NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const TopNavigation = () => {
  return (
    <div className="tab-navigation">
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <NavLink
            to="/"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            end
          >
            Daily Goal
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/friends"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Friends
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/stats"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Statistics
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/about"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            About
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default TopNavigation;

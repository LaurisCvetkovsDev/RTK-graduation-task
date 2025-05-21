import React from "react";
import { NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const TabNavigation = () => {
  return (
    <div className="tab-navigation mb-4">
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
      </ul>
    </div>
  );
};

export default TabNavigation;

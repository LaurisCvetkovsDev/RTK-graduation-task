import React from "react";
import { Link } from "react-router-dom";
import Stopwatch from "./Stopwatch";

const Sidebar: React.FC = () => {
  return (
    <div className="sideBar">
      <Stopwatch />
    </div>
  );
};

export default Sidebar;

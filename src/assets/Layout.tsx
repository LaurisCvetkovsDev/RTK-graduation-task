import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import TabNavigation from "../components/TabNavigation";

const Layout = () => {
  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        <div className="timer-section">
          <Sidebar />
        </div>
        <div className="tabs-section">
          <TabNavigation />
          <div className="tab-content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;

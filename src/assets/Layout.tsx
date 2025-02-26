import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const Layout = () => {
  return (
    <div className="padding">
      <Navbar />

      <div className="content">
        <Sidebar />
        <div className="container">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
export default Layout;

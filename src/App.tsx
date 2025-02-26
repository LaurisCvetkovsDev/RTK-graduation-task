import "./App.css";
import Layout from "./assets/Layout";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Friends from "./components/Friends";
import Goal from "./components/Goal";
import Stats from "./components/Stats";
import "./font/ShareTechMono-Regular.ttf";

function App() {
  return (
    <>
      <div className="background">
        <Router>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/friends" element={<Friends />} />
              <Route path="/" element={<Goal />} />
              <Route path="/stats" element={<Stats />} />
            </Route>
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;

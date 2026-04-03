import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./Home.jsx";
import Messages from "./Messages.jsx";
import NavbarPhone from "./components/Navbar-phone.jsx";
import SearchBar from "./components/Search-bar.jsx";
import Community from "./Community.jsx";

export default function App() {
    return (
        <Router>
            <Navbar />
            <NavbarPhone/>
            <SearchBar/>
            <main className="sm:ml-64 bg-[#1c1c1e] min-h-screen">
                {/* ml-64 = compense la largeur de la navbar */}
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/communities" element={<Community />} />
                </Routes>
            </main>
        </Router>
    );
}
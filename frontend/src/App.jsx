import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./ProtectedRoute";
import Home from "./Home.jsx";
import Messages from "./Messages.jsx";
import Community from "./Community.jsx";
import Connexion from "./Connexion.jsx";
import Inscription from "./Inscription.jsx";
import NavbarPhone from "./components/Navbar-phone.jsx";
import Commentaires from "./Commentaires.jsx";


export default function App() {
    const [token, setToken] = useState(localStorage.getItem("token"));



    return (
        <Router>
            {token && <Navbar />}
            {token && <NavbarPhone />}
            <main className={token ? "sm:ml-40 min-h-screen bg-[#1c1c1e]" : "min-h-screen bg-[#1c1c1e]"}>
                <Routes>
                    <Route path="/connexion" element={<Connexion onLogin={() => setToken(localStorage.getItem("token"))} />} />
                    <Route path="/inscription" element={<Inscription />} />
                    <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                    <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                    <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                    <Route path="/publications/:id/commentaires" element={
                        <ProtectedRoute><Commentaires /></ProtectedRoute>
                    } />
                </Routes>
            </main>
        </Router>
    );
}
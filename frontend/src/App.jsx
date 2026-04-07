import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useRef } from "react";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./ProtectedRoute";
import Home from "./Home.jsx";
import Messages from "./Messages.jsx";
import Community from "./Community.jsx";
import Connexion from "./Connexion.jsx";
import Inscription from "./Inscription.jsx";
import NavbarPhone from "./components/Navbar-phone.jsx";
import Commentaires from "./Commentaires.jsx";
import PublierModal from "./components/PublierModals.jsx";
import Profile from "./Profile.jsx";
import MessagesCommunaute from "./MessagesCommunaute.jsx";

export default function App() {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [showPublier, setShowPublier] = useState(false);
    const refreshPostsRef = useRef(null);

    return (
        <Router>
            {token && <Navbar onPublier={() => setShowPublier(true)} />}
            {token && <NavbarPhone onPublier={() => setShowPublier(true)} />}
            {showPublier && (
                <PublierModal
                    onClose={() => setShowPublier(false)}
                    onPublished={() => {
                        setShowPublier(false);
                        if (refreshPostsRef.current) refreshPostsRef.current();
                    }}
                />
            )}
            <main className={token ? "sm:ml-40 min-h-screen bg-[#1c1c1e]" : "min-h-screen bg-[#1c1c1e]"}>
                <Routes>
                    <Route path="/connexion" element={<Connexion onLogin={() => setToken(localStorage.getItem("token"))} />} />
                    <Route path="/inscription" element={<Inscription />} />
                    <Route path="/" element={<ProtectedRoute><Home refreshRef={refreshPostsRef} /></ProtectedRoute>} />
                    <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                    <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                    <Route path="/publications/:id/commentaires" element={
                        <ProtectedRoute><Commentaires /></ProtectedRoute>
                    } />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/community/:id_communaute" element={<ProtectedRoute><MessagesCommunaute /></ProtectedRoute>} />
                </Routes>
            </main>
        </Router>
    );
}
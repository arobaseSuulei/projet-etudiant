import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Connexion({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [erreur, setErreur] = useState('');
    const navigate = useNavigate();

    const handleConnexion = async () => {
        const res = await fetch("http://localhost:3000/auth/connexion", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            setErreur(data.error);
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onLogin();
        navigate("/");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#1c1c1e] px-4">
            <div className="bg-[#2c2c2e] rounded-3xl p-6 sm:p-8 w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col gap-4">
                <h1 className="text-white text-xl font-semibold">Connexion</h1>
                {erreur && <p className="text-red-400 text-sm">{erreur}</p>}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="bg-[#3a3a3c] text-white rounded-xl px-4 py-3 outline-none w-full"
                />
                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="bg-[#3a3a3c] text-white rounded-xl px-4 py-3 outline-none w-full"
                />
                <button
                    onClick={handleConnexion}
                    className="bg-purple-600 text-white rounded-xl py-3 font-semibold w-full"
                >
                    Se connecter
                </button>
                <p className="text-gray-400 text-sm text-center">
                    Pas de compte ?{' '}
                    <span onClick={() => navigate('/inscription')} className="text-purple-400 cursor-pointer">
                    S'inscrire
                </span>
                </p>
            </div>
        </div>
    );
}
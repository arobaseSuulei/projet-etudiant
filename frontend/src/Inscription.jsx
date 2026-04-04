import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Inscription() {
    const [form, setForm] = useState({
        email: '', password: '', nom: '', prenom: '',
        num_etudiant: '', date_naissance: '', formation: ''
    });
    const [erreur, setErreur] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleInscription = async () => {
        const res = await fetch("http://localhost:3000/auth/inscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        });

        const data = await res.json();

        if (!res.ok) {
            setErreur(data.error);
            return;
        }

        navigate("/connexion");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#1c1c1e]">
            <div className="bg-[#2c2c2e] rounded-3xl p-8 w-full max-w-sm flex flex-col gap-4">
                <h1 className="text-white text-xl font-semibold">Inscription</h1>
                {erreur && <p className="text-red-400 text-sm">{erreur}</p>}

                {['prenom', 'nom', 'email', 'password', 'num_etudiant', 'date_naissance', 'formation'].map(field => (
                    <input
                        key={field}
                        type={field === 'password' ? 'password' : field === 'date_naissance' ? 'date' : 'text'}
                        name={field}
                        placeholder={field.replace('_', ' ')}
                        value={form[field]}
                        onChange={handleChange}
                        className="bg-[#3a3a3c] text-white rounded-xl px-4 py-3 outline-none"
                    />
                ))}

                <button
                    onClick={handleInscription}
                    className="bg-purple-600 text-white rounded-xl py-3 font-semibold"
                >
                    S'inscrire
                </button>

                <p className="text-gray-400 text-sm text-center">
                    Déjà un compte ?{' '}
                    <span onClick={() => navigate('/connexion')} className="text-purple-400 cursor-pointer">
                        Se connecter
                    </span>
                </p>
            </div>
        </div>
    );
}
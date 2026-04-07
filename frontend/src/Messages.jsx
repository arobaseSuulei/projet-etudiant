// frontend/src/Messages.jsx
import { useState, useEffect, useRef } from "react";

export default function Messages() {
    const [recherche, setRecherche] = useState('');
    const [resultats, setResultats] = useState([]);
    const [destinataire, setDestinataire] = useState(null);
    const [messages, setMessages] = useState([]);
    const [texte, setTexte] = useState('');
    const [messageEnCoursModif, setMessageEnCoursModif] = useState(null);
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Recherche - Version qui fonctionne avec VOTRE backend
    useEffect(() => {
        if (!recherche.trim()) { 
            setResultats([]); 
            return; 
        }
        
        const timeout = setTimeout(async () => {
            try {
                // Utilisez le token comme vous le faites déjà pour messages
                const response = await fetch(`http://localhost:3000/recherche?q=${recherche}`, {
                    headers: { 
                        "Authorization": `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log("Résultat recherche:", data);
                    // Votre backend retourne { resultats: [...] }
                    setResultats(data.resultats || []);
                } else {
                    console.error("Erreur HTTP:", response.status);
                    setResultats([]);
                }
            } catch (error) {
                console.error("Erreur recherche:", error);
                setResultats([]);
            }
        }, 300);
        
        return () => clearTimeout(timeout);
    }, [recherche, token]);

    const ouvrirConversation = async (etudiant) => {
        setDestinataire(etudiant);
        setResultats([]);
        setRecherche('');
        
        const res = await fetch(`http://localhost:3000/messages/conversation/${etudiant.id_etudiant}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
            setMessages(data.conversation ?? []);
        }
    };

    const envoyerMessage = async () => {
        if (!texte.trim()) return;
        
        const res = await fetch(`http://localhost:3000/messages/envoyer/${destinataire.id_etudiant}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ text_message: texte })
        });
        
        const data = await res.json();
        if (res.ok) {
            setMessages(prev => [...prev, data.data]);
            setTexte('');
        } else {
            alert(data.error);
        }
    };

    const supprimerMessage = async (id_message) => {
        if (!window.confirm("Supprimer ce message ?")) return;
        
        const res = await fetch(`http://localhost:3000/messages/${id_message}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.ok) {
            setMessages(prev => prev.filter(m => m.id_message !== id_message));
        }
    };

    const modifierMessage = async (id_message, nouveauTexte) => {
        if (!nouveauTexte.trim()) return;
        
        const res = await fetch(`http://localhost:3000/messages/${id_message}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ text_message: nouveauTexte })
        });
        
        const data = await res.json();
        if (res.ok) {
            setMessages(prev => prev.map(m => 
                m.id_message === id_message ? { ...m, text_message: data.data.text_message } : m
            ));
            setMessageEnCoursModif(null);
        }
    };

    const heureDepuis = (date) => {
        const diff = Math.floor((new Date() - new Date(date)) / 1000 / 60);
        if (diff < 1) return "à l'instant";
        if (diff < 60) return `${diff}min`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h`;
        return `${Math.floor(diff / 1440)}j`;
    };

    return (
        <div className="flex h-screen bg-[#1c1c1e]">
            {/* Sidebar gauche */}
            <div className={`${destinataire ? 'hidden sm:flex' : 'flex'} flex-col w-full sm:w-80 border-r border-[#3a3a3c]`}>
                <div className="p-4 border-b border-[#3a3a3c]">
                    <p className="text-white font-semibold text-lg mb-3">Messages</p>
                    <input
                        type="text"
                        placeholder="Rechercher un étudiant..."
                        value={recherche}
                        onChange={e => setRecherche(e.target.value)}
                        className="w-full bg-[#2c2c2e] text-white text-sm rounded-xl px-4 py-2 outline-none placeholder-gray-500"
                    />
                </div>

                {resultats.length > 0 && (
                    <div className="flex flex-col">
                        {resultats.map(r => (
                            <div
                                key={r.id_etudiant}
                                onClick={() => ouvrirConversation(r)}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-[#2c2c2e] cursor-pointer"
                            >
                                {r.photo_profil ? (
                                    <img src={r.photo_profil} className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-[#5e5ce6] flex items-center justify-center text-white text-sm">
                                        {r.prenom_etudiant?.[0]}{r.nom_etudiant?.[0]}
                                    </div>
                                )}
                                <div>
                                    <p className="text-white text-sm font-medium">{r.prenom_etudiant} {r.nom_etudiant}</p>
                                    <p className="text-gray-400 text-xs">{r.formation}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {resultats.length === 0 && !recherche && (
                    <div className="flex flex-col items-center justify-center flex-1 gap-2">
                        <p className="text-gray-500 text-sm">Recherche un étudiant</p>
                        <p className="text-gray-600 text-xs">pour démarrer une conversation</p>
                    </div>
                )}
            </div>

            {/* Zone de chat */}
            {destinataire ? (
                <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-[#3a3a3c]">
                        <button onClick={() => setDestinataire(null)} className="sm:hidden text-gray-400">
                            ←
                        </button>
                        {destinataire.photo_profil ? (
                            <img src={destinataire.photo_profil} className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-[#5e5ce6] flex items-center justify-center text-white text-sm">
                                {destinataire.prenom_etudiant?.[0]}{destinataire.nom_etudiant?.[0]}
                            </div>
                        )}
                        <p className="text-white font-medium text-sm">{destinataire.prenom_etudiant} {destinataire.nom_etudiant}</p>
                    </div>

                    <div className="flex-1 overflow-y-auto flex flex-col gap-2 px-4 py-4">
                        {messages.length === 0 && (
                            <p className="text-gray-500 text-sm text-center mt-8">Commencez la conversation !</p>
                        )}
                        {messages.map(m => {
                            const estMoi = m.id_emetteur === user.id;
                            return (
                                <div key={m.id_message} className={`flex ${estMoi ? 'justify-end' : 'justify-start'} group`}>
                                    <div className="max-w-xs sm:max-w-md relative">
                                        {messageEnCoursModif === m.id_message ? (
                                            <div className="bg-[#2c2c2e] rounded-2xl p-2">
                                                <input
                                                    type="text"
                                                    defaultValue={m.text_message}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') modifierMessage(m.id_message, e.target.value);
                                                        if (e.key === 'Escape') setMessageEnCoursModif(null);
                                                    }}
                                                    className="bg-[#3a3a3c] text-white text-sm rounded-xl px-3 py-2 outline-none"
                                                    autoFocus
                                                />
                                                <div className="flex gap-2 justify-end mt-2">
                                                    <button onClick={() => setMessageEnCoursModif(null)} className="text-xs text-gray-400">Annuler</button>
                                                    <button onClick={(e) => modifierMessage(m.id_message, e.target.parentElement.previousSibling.value)} className="text-xs text-purple-400">OK</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={`px-4 py-2 rounded-2xl text-sm ${estMoi ? 'bg-purple-600 text-white rounded-br-sm' : 'bg-[#2c2c2e] text-white rounded-bl-sm'}`}>
                                                {m.text_message}
                                            </div>
                                        )}
                                        <p className="text-gray-600 text-xs mt-1 px-1">{heureDepuis(m.date_message)}</p>
                                        {estMoi && messageEnCoursModif !== m.id_message && (
                                            <button
                                                onClick={() => setMessageEnCoursModif(m.id_message)}
                                                className="absolute -top-2 -left-6 hidden group-hover:block text-gray-500 hover:text-blue-400"
                                            >
                                                ✏️
                                            </button>
                                        )}
                                        {estMoi && messageEnCoursModif !== m.id_message && (
                                            <button
                                                onClick={() => supprimerMessage(m.id_message)}
                                                className="absolute -top-2 -left-12 hidden group-hover:block text-gray-500 hover:text-red-400"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="flex items-center gap-3 px-4 py-3 border-t border-[#3a3a3c]">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Message..."
                            value={texte}
                            onChange={e => setTexte(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && envoyerMessage()}
                            className="flex-1 bg-[#2c2c2e] text-white text-sm rounded-2xl px-4 py-2 outline-none"
                        />
                        <button onClick={envoyerMessage} className="text-purple-400">
                            ➤
                        </button>
                    </div>
                </div>
            ) : (
                <div className="hidden sm:flex flex-1 items-center justify-center">
                    <p className="text-gray-500">Sélectionnez une conversation</p>
                </div>
            )}
        </div>
    );
}
// frontend/src/MessagesCommunaute.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function MessagesCommunaute() {
    const { id_communaute } = useParams();
    const navigate = useNavigate();
    const [communaute, setCommunaute] = useState(null);
    const [messages, setMessages] = useState([]);
    const [texte, setTexte] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [messageEnCoursModif, setMessageEnCoursModif] = useState(null);
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Charger les infos de la communauté
    useEffect(() => {
        fetch(`http://localhost:3000/communautes`)
            .then(res => res.json())
            .then(data => {
                const found = (data.communautes ?? []).find(c => c.id_communaute === parseInt(id_communaute));
                setCommunaute(found);
            })
            .catch(err => console.error("Erreur chargement communauté:", err));
    }, [id_communaute]);

    // Charger les messages de la communauté
    const chargerMessages = async () => {
        try {
            const res = await fetch(`http://localhost:3000/messages/communautes/${id_communaute}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            if (res.status === 404) {
                setError("L'API des messages n'est pas disponible. Veuillez contacter l'administrateur.");
                setLoading(false);
                return;
            }
            
            if (res.status === 403) {
                setError("Vous n'êtes pas membre de cette communauté");
                setTimeout(() => navigate("/community"), 2000);
                return;
            }
            
            const data = await res.json();
            if (data && data.messages) {
                setMessages(data.messages);
                setError(null);
            }
            setLoading(false);
        } catch (err) {
            console.error("Erreur chargement messages:", err);
            setError("Impossible de charger les messages");
            setLoading(false);
        }
    };

    useEffect(() => {
        chargerMessages();
        const interval = setInterval(chargerMessages, 5000);
        return () => clearInterval(interval);
    }, [id_communaute]);

    const envoyerMessage = async () => {
        if (!texte.trim()) return;

        try {
            const res = await fetch(`http://localhost:3000/messages/communautes/${id_communaute}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ text_message: texte })
            });

            if (res.ok) {
                chargerMessages();
                setTexte('');
            } else {
                const data = await res.json();
                alert(data.error || "Erreur lors de l'envoi");
            }
        } catch (err) {
            console.error("Erreur envoi:", err);
            alert("Erreur de connexion");
        }
    };

    const supprimerMessage = async (id_message) => {
        if (!window.confirm("Supprimer ce message ?")) return;

        try {
            const res = await fetch(`http://localhost:3000/messages/${id_message}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                chargerMessages();
            }
        } catch (err) {
            console.error("Erreur suppression:", err);
        }
    };

    const modifierMessage = async (id_message, nouveauTexte) => {
        if (!nouveauTexte.trim()) return;

        try {
            const res = await fetch(`http://localhost:3000/messages/${id_message}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ text_message: nouveauTexte })
            });

            if (res.ok) {
                chargerMessages();
                setMessageEnCoursModif(null);
            }
        } catch (err) {
            console.error("Erreur modification:", err);
        }
    };

    const heureDepuis = (date) => {
        const diff = Math.floor((new Date() - new Date(date)) / 1000 / 60);
        if (diff < 1) return "à l'instant";
        if (diff < 60) return `${diff}min`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h`;
        return `${Math.floor(diff / 1440)}j`;
    };

    const formatDateMessage = (date) => {
        const msgDate = new Date(date);
        const now = new Date();
        const diffJours = Math.floor((now - msgDate) / (1000 * 60 * 60 * 24));

        if (diffJours === 0) {
            return msgDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } else if (diffJours === 1) {
            return `Hier à ${msgDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return msgDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p className="text-red-400 text-center">{error}</p>
                <button 
                    onClick={() => navigate("/community")}
                    className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm"
                >
                    Retour aux communautés
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#1c1c1e]">

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#3a3a3c] bg-[#1c1c1e] sticky top-0 z-10">
                <button 
                    onClick={() => navigate("/community")} 
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/>
                    </svg>
                </button>
                {communaute?.photo_groupe ? (
                    <img 
                        src={communaute.photo_groupe} 
                        className="w-10 h-10 rounded-full object-cover"
                        onError={e => e.target.style.display = 'none'}
                        alt="Photo groupe"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                        {communaute?.nom_communaute?.[0]?.toUpperCase()}
                    </div>
                )}
                <div className="flex-1">
                    <p className="text-white font-semibold">{communaute?.nom_communaute}</p>
                    <p className="text-gray-400 text-xs">{communaute?.description_communaute}</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 px-4 py-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#2c2c2e] flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-gray-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.136-.847-2.1-1.98-2.193a48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286m10.5-2.001a2.126 2.126 0 0 1-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951" />
                                </svg>
                            </div>
                            <p className="text-gray-400 text-sm">Commencez la conversation !</p>
                            <p className="text-gray-500 text-xs mt-1">Soyez le premier à envoyer un message</p>
                        </div>
                    </div>
                )}

                {messages.map((m, index) => {
                    const estMoi = m.id_emetteur === user?.id;
                    const showDate = index === 0 || new Date(m.date_message) - new Date(messages[index - 1]?.date_message) > 1000 * 60 * 5;

                    return (
                        <div key={m.id_message}>
                            {showDate && (
                                <div className="flex justify-center my-4">
                                    <div className="bg-[#2c2c2e] text-gray-400 text-xs px-3 py-1 rounded-full">
                                        {formatDateMessage(m.date_message)}
                                    </div>
                                </div>
                            )}

                            <div className={`flex ${estMoi ? 'justify-end' : 'justify-start'} group mb-2`}>
                                <div className={`max-w-[70%] sm:max-w-md relative ${!estMoi ? 'ml-2' : 'mr-2'}`}>
                                    {!estMoi && (
                                        <div className="flex items-center gap-2 mb-1 ml-1">
                                            {m.etudiants?.photo_profil ? (
                                                <img 
                                                    src={m.etudiants.photo_profil} 
                                                    className="w-5 h-5 rounded-full object-cover"
                                                    onError={e => e.target.style.display = 'none'}
                                                    alt=""
                                                />
                                            ) : (
                                                <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white text-[8px]">
                                                    {m.etudiants?.prenom_etudiant?.[0]}{m.etudiants?.nom_etudiant?.[0]}
                                                </div>
                                            )}
                                            <p className="text-gray-400 text-xs">
                                                {m.etudiants?.prenom_etudiant} {m.etudiants?.nom_etudiant}
                                            </p>
                                        </div>
                                    )}

                                    {messageEnCoursModif === m.id_message ? (
                                        <div className="bg-[#2c2c2e] rounded-2xl p-2">
                                            <input
                                                type="text"
                                                defaultValue={m.text_message.replace(/^✏️\n/, '')}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        modifierMessage(m.id_message, e.target.value);
                                                    }
                                                    if (e.key === 'Escape') {
                                                        setMessageEnCoursModif(null);
                                                    }
                                                }}
                                                className="bg-[#3a3a3c] text-white text-sm rounded-xl px-3 py-2 outline-none w-full"
                                                autoFocus
                                            />
                                            <div className="flex gap-2 justify-end mt-2">
                                                <button onClick={() => setMessageEnCoursModif(null)} className="text-xs text-gray-400 hover:text-white px-2 py-1">
                                                    Annuler
                                                </button>
                                                <button onClick={(e) => {
                                                    const input = e.target.parentElement.previousSibling;
                                                    modifierMessage(m.id_message, input.value);
                                                }} className="text-xs text-purple-400 hover:text-purple-300 px-2 py-1">
                                                    Enregistrer
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className={`px-4 py-2 rounded-2xl text-sm break-words ${
                                                estMoi 
                                                    ? 'bg-purple-600 text-white rounded-br-sm' 
                                                    : 'bg-[#2c2c2e] text-white rounded-bl-sm'
                                            }`}>
                                                {m.text_message.startsWith('✏️') && (
                                                    <span className="text-xs opacity-70 mr-1">✏️</span>
                                                )}
                                                {m.text_message.replace(/^✏️\n/, '')}
                                            </div>
                                            <div className="flex items-center gap-1 mt-1 px-1">
                                                <p className="text-gray-500 text-[10px]">
                                                    {heureDepuis(m.date_message)}
                                                </p>
                                            </div>
                                        </>
                                    )}

                                    {estMoi && messageEnCoursModif !== m.id_message && (
                                        <div className="absolute -top-2 -right-6 hidden group-hover:flex gap-1">
                                            <button
                                                onClick={() => setMessageEnCoursModif(m.id_message)}
                                                className="text-gray-400 hover:text-blue-400 transition-colors"
                                                title="Modifier"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3.5 h-3.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"/>
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => supprimerMessage(m.id_message)}
                                                className="text-gray-400 hover:text-red-400 transition-colors"
                                                title="Supprimer"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3.5 h-3.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input message */}
            <div className="flex items-center gap-3 px-4 py-3 border-t border-[#3a3a3c] bg-[#1c1c1e]">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Message..."
                    value={texte}
                    onChange={e => setTexte(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && envoyerMessage()}
                    className="flex-1 bg-[#2c2c2e] text-white text-sm rounded-2xl px-4 py-2.5 outline-none placeholder-gray-500 focus:ring-1 focus:ring-purple-500"
                />
                <button 
                    onClick={envoyerMessage} 
                    disabled={!texte.trim()}
                    className={`transition-all p-1 rounded-full ${
                        texte.trim() 
                            ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-400/10' 
                            : 'text-gray-600 cursor-not-allowed'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"/>
                    </svg>
                </button>
            </div>
        </div>
    );
}
// frontend/src/Messages.jsx
import { useState, useEffect, useRef } from "react";

export default function Messages() {
    const [recherche, setRecherche] = useState('');
    const [resultats, setResultats] = useState([]);
    const [amis, setAmis] = useState([]);
    const [destinataire, setDestinataire] = useState(null);
    const [messages, setMessages] = useState([]);
    const [texte, setTexte] = useState('');
    const [messageEnCoursModif, setMessageEnCoursModif] = useState(null);
    const [invitationsEnAttente, setInvitationsEnAttente] = useState([]);
    const [onglet, setOnglet] = useState('amis'); // 'amis', 'recherche', 'invitations'
    const [loading, setLoading] = useState(false);
    
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Charger les amis au montage
    useEffect(() => {
        chargerAmis();
        chargerInvitations();
    }, []);

    const chargerAmis = async () => {
        try {
            const res = await fetch(`http://localhost:3000/amis`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setAmis(data.amis ?? []);
            }
        } catch (error) {
            console.error("Erreur chargement amis:", error);
        }
    };

    const chargerInvitations = async () => {
        try {
            const res = await fetch(`http://localhost:3000/invitations/mes-invitations`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                const enAttente = data.invitations.filter(
                    inv => inv.statut === 'en_attente' && inv.id_recepteur === user.id
                );
                setInvitationsEnAttente(enAttente);
            }
        } catch (error) {
            console.error("Erreur chargement invitations:", error);
        }
    };

    // Recherche d'étudiants
    useEffect(() => {
        if (!recherche.trim() || onglet !== 'recherche') { 
            setResultats([]); 
            return; 
        }
        
        setLoading(true);
        const timeout = setTimeout(() => {
            fetch(`http://localhost:3000/recherche?q=${recherche}`, {
                headers: { 
                    "Authorization": `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    // Filtrer les étudiants déjà amis
                    const amisIds = new Set(amis.map(a => a.id_etudiant));
                    const resultatsFiltres = (data.resultats ?? []).filter(
                        etudiant => etudiant.id_etudiant !== user.id && !amisIds.has(etudiant.id_etudiant)
                    );
                    setResultats(resultatsFiltres);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Erreur recherche:", err);
                    setLoading(false);
                });
        }, 400);
        
        return () => clearTimeout(timeout);
    }, [recherche, token, onglet, amis, user.id]);

    const envoyerInvitation = async (etudiantId) => {
        try {
            const res = await fetch(`http://localhost:3000/invitations/envoyer/${etudiantId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            
            const data = await res.json();
            if (res.ok) {
                alert("Invitation envoyée !");
                setResultats(prev => prev.filter(r => r.id_etudiant !== etudiantId));
            } else {
                alert(data.error || "Erreur lors de l'envoi");
            }
        } catch (error) {
            console.error("Erreur envoi invitation:", error);
        }
    };

    const accepterInvitation = async (invitationId) => {
        try {
            const res = await fetch(`http://localhost:3000/invitations/accepter/${invitationId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            
            if (res.ok) {
                alert("Invitation acceptée !");
                chargerAmis();
                chargerInvitations();
            }
        } catch (error) {
            console.error("Erreur acceptation:", error);
        }
    };

    const refuserInvitation = async (invitationId) => {
        try {
            const res = await fetch(`http://localhost:3000/invitations/refuser/${invitationId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            
            if (res.ok) {
                alert("Invitation refusée");
                chargerInvitations();
            }
        } catch (error) {
            console.error("Erreur refus:", error);
        }
    };

    const ouvrirConversation = (etudiant) => {
        setDestinataire(etudiant);
        setResultats([]);
        setRecherche('');
        
        fetch(`http://localhost:3000/messages/conversation/${etudiant.id_etudiant}`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setMessages(data.conversation ?? []))
            .catch(err => console.error("Erreur chargement conversation:", err));
    };

    const envoyerMessage = async () => {
        if (!texte.trim()) return;
        
        fetch(`http://localhost:3000/messages/envoyer/${destinataire.id_etudiant}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ text_message: texte })
        })
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setMessages(prev => [...prev, data.data]);
                    setTexte('');
                } else {
                    alert(data.error || "Impossible d'envoyer le message");
                }
            })
            .catch(err => console.error("Erreur envoi message:", err));
    };

    const supprimerMessage = async (id_message) => {
        if (!window.confirm("Supprimer ce message ?")) return;
        
        fetch(`http://localhost:3000/messages/${id_message}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => {
                if (res.ok) {
                    setMessages(prev => prev.filter(m => m.id_message !== id_message));
                }
            })
            .catch(err => console.error("Erreur suppression:", err));
    };

    const modifierMessage = async (id_message, nouveauTexte) => {
        if (!nouveauTexte.trim()) return;
        
        fetch(`http://localhost:3000/messages/${id_message}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ text_message: nouveauTexte })
        })
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setMessages(prev => prev.map(m => 
                        m.id_message === id_message ? data.data : m
                    ));
                    setMessageEnCoursModif(null);
                }
            })
            .catch(err => console.error("Erreur modification:", err));
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
            <div className={`${destinataire ? 'hidden sm:flex' : 'flex'} flex-col w-full sm:w-96 border-r border-[#3a3a3c]`}>
                <div className="p-4 border-b border-[#3a3a3c] sticky top-0 bg-[#1c1c1e] z-10">
                    <p className="text-white font-semibold text-xl mb-3">Messages</p>
                    
                    {/* Onglets */}
                    <div className="flex gap-2 mb-3">
                        <button
                            onClick={() => setOnglet('amis')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                                onglet === 'amis' 
                                    ? 'bg-purple-600 text-white' 
                                    : 'bg-[#2c2c2e] text-gray-400 hover:text-white'
                            }`}
                        >
                            Amis ({amis.length})
                        </button>
                        <button
                            onClick={() => setOnglet('invitations')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                                onglet === 'invitations' 
                                    ? 'bg-purple-600 text-white' 
                                    : 'bg-[#2c2c2e] text-gray-400 hover:text-white'
                            }`}
                        >
                            Invitations ({invitationsEnAttente.length})
                        </button>
                        <button
                            onClick={() => setOnglet('recherche')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                                onglet === 'recherche' 
                                    ? 'bg-purple-600 text-white' 
                                    : 'bg-[#2c2c2e] text-gray-400 hover:text-white'
                            }`}
                        >
                            Rechercher
                        </button>
                    </div>

                    {onglet === 'recherche' && (
                        <input
                            type="text"
                            placeholder="Rechercher par nom ou prénom..."
                            value={recherche}
                            onChange={e => setRecherche(e.target.value)}
                            className="w-full bg-[#2c2c2e] text-white text-sm rounded-xl px-4 py-2.5 outline-none placeholder-gray-500 focus:ring-1 focus:ring-purple-500"
                        />
                    )}
                </div>

                {/* Liste des amis */}
                {onglet === 'amis' && (
                    <div className="flex-1 overflow-y-auto">
                        {amis.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-16 h-16 text-gray-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                                </svg>
                                <p className="text-gray-400 mt-3">Aucun ami</p>
                                <p className="text-gray-500 text-sm mt-1">Envoie des invitations pour discuter</p>
                            </div>
                        ) : (
                            amis.map(ami => (
                                <div
                                    key={ami.id_etudiant}
                                    onClick={() => ouvrirConversation(ami)}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#2c2c2e] cursor-pointer transition-colors"
                                >
                                    {ami.photo_profil ? (
                                        <img src={ami.photo_profil} className="w-12 h-12 rounded-full object-cover flex-shrink-0" onError={e => e.target.style.display = 'none'} />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-base font-semibold flex-shrink-0">
                                            {ami.prenom_etudiant?.[0]}{ami.nom_etudiant?.[0]}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium">{ami.prenom_etudiant} {ami.nom_etudiant}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Liste des invitations reçues */}
                {onglet === 'invitations' && (
                    <div className="flex-1 overflow-y-auto">
                        {invitationsEnAttente.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-16 h-16 text-gray-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9" />
                                </svg>
                                <p className="text-gray-400 mt-3">Aucune invitation</p>
                            </div>
                        ) : (
                            invitationsEnAttente.map(inv => (
                                <div key={inv.id_invitation} className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#3a3a3c]">
                                    <div className="flex items-center gap-3 flex-1">
                                        {inv.expediteur?.photo_profil ? (
                                            <img src={inv.expediteur.photo_profil} className="w-12 h-12 rounded-full object-cover flex-shrink-0" onError={e => e.target.style.display = 'none'} />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-base font-semibold flex-shrink-0">
                                                {inv.expediteur?.prenom_etudiant?.[0]}{inv.expediteur?.nom_etudiant?.[0]}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium">{inv.expediteur?.prenom_etudiant} {inv.expediteur?.nom_etudiant}</p>
                                            <p className="text-yellow-500 text-xs mt-1">Vous a invité à discuter</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => accepterInvitation(inv.id_invitation)}
                                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                                        >
                                            Accepter
                                        </button>
                                        <button
                                            onClick={() => refuserInvitation(inv.id_invitation)}
                                            className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm rounded-lg transition-colors"
                                        >
                                            Refuser
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Résultats de recherche */}
                {onglet === 'recherche' && (
                    <div className="flex-1 overflow-y-auto">
                        {loading && (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                            </div>
                        )}
                        
                        {!loading && resultats.length === 0 && recherche && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <p className="text-gray-400">Aucun étudiant trouvé</p>
                            </div>
                        )}
                        
                        {!loading && resultats.length === 0 && !recherche && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-16 h-16 text-gray-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                                <p className="text-gray-400 mt-3">Recherche un étudiant</p>
                                <p className="text-gray-500 text-sm mt-1">pour lui envoyer une invitation</p>
                            </div>
                        )}
                        
                        {resultats.map(etudiant => (
                            <div
                                key={etudiant.id_etudiant}
                                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#2c2c2e] transition-colors"
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    {etudiant.photo_profil ? (
                                        <img src={etudiant.photo_profil} className="w-12 h-12 rounded-full object-cover flex-shrink-0" onError={e => e.target.style.display = 'none'} />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-base font-semibold flex-shrink-0">
                                            {etudiant.prenom_etudiant?.[0]}{etudiant.nom_etudiant?.[0]}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium">{etudiant.prenom_etudiant} {etudiant.nom_etudiant}</p>
                                        <p className="text-gray-400 text-sm truncate">{etudiant.formation}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => envoyerInvitation(etudiant.id_etudiant)}
                                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-full transition-colors"
                                >
                                    Inviter
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Zone de chat - uniquement si un ami est sélectionné */}
            {destinataire ? (
                <div className="flex flex-col flex-1">

                    {/* Header chat */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-[#3a3a3c] bg-[#1c1c1e] sticky top-0 z-10">
                        <button 
                            onClick={() => setDestinataire(null)} 
                            className="sm:hidden text-gray-400 hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/>
                            </svg>
                        </button>
                        {destinataire.photo_profil ? (
                            <img src={destinataire.photo_profil} className="w-10 h-10 rounded-full object-cover" onError={e => e.target.style.display = 'none'} />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                                {destinataire.prenom_etudiant?.[0]}{destinataire.nom_etudiant?.[0]}
                            </div>
                        )}
                        <div className="flex-1">
                            <p className="text-white font-semibold">{destinataire.prenom_etudiant} {destinataire.nom_etudiant}</p>
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
                                </div>
                            </div>
                        )}
                        
                        {messages.map(m => {
                            const estMoi = m.id_emetteur === user?.id;
                            return (
                                <div key={m.id_message} className={`flex ${estMoi ? 'justify-end' : 'justify-start'} group`}>
                                    <div className={`max-w-[70%] sm:max-w-md relative ${!estMoi ? 'ml-2' : 'mr-2'}`}>
                                        {messageEnCoursModif === m.id_message ? (
                                            <div className="bg-[#2c2c2e] rounded-2xl p-2">
                                                <input
                                                    type="text"
                                                    defaultValue={m.text_message}
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
                                                <div className={`px-4 py-2 rounded-2xl text-sm ${estMoi ? 'bg-purple-600 text-white rounded-br-sm' : 'bg-[#2c2c2e] text-white rounded-bl-sm'}`}>
                                                    {m.text_message}
                                                </div>
                                                <p className="text-gray-500 text-[10px] mt-1 px-1">{heureDepuis(m.date_message)}</p>
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
            ) : (
                <div className="hidden sm:flex flex-1 items-center justify-center">
                    <div className="text-center">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="white" className="w-12 h-12">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.136-.847-2.1-1.98-2.193a48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286m10.5-2.001a2.126 2.126 0 0 1-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951" />
                            </svg>
                        </div>
                        <p className="text-white font-semibold text-xl">Messages</p>
                        <p className="text-gray-400 mt-2">Ajoute des amis pour commencer</p>
                        <p className="text-gray-500 text-sm mt-1">à discuter !</p>
                    </div>
                </div>
            )}
        </div>
    );
}
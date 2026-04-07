// frontend/src/Community.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Community() {
    const navigate = useNavigate();
    const [commu, setCommu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [membres, setMembres] = useState([]);
    const [commuSelectionnee, setCommuSelectionnee] = useState(null);
    const [showCreer, setShowCreer] = useState(false);
    const [nom, setNom] = useState('');
    const [description, setDescription] = useState('');
    const [photoGroupe, setPhotoGroupe] = useState('');
    const [erreur, setErreur] = useState('');
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        fetch("http://localhost:3000/communautes")
            .then(res => res.json())
            .then(data => {
                setCommu(data.communautes ?? []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur fetch :", err);
                setLoading(false);
            });
    }, []);

    const ouvrirMembres = async (c) => {
        setCommuSelectionnee(c);
        const res = await fetch(`http://localhost:3000/communautes/${c.id_communaute}/membres`);
        const data = await res.json();
        setMembres(data.membres ?? []);
    };

    const rejoindre = async (id_communaute) => {
        const res = await fetch(`http://localhost:3000/communautes/${id_communaute}/rejoindre`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
            setCommu(prev => prev.map(c =>
                c.id_communaute === id_communaute ? { ...c, est_membre: true } : c
            ));
        }
    };

    const quitter = async (id_communaute) => {
        const res = await fetch(`http://localhost:3000/communautes/${id_communaute}/quitter`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
            setCommu(prev => prev.map(c =>
                c.id_communaute === id_communaute ? { ...c, est_membre: false } : c
            ));
        }
    };

    const creerCommunaute = async () => {
        if (!nom.trim()) {
            setErreur('Le nom est obligatoire');
            return;
        }

        const res = await fetch("http://localhost:3000/communautes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ 
                nom_communaute: nom, 
                description_communaute: description,
                photo_groupe: photoGroupe || null
            })
        });

        const data = await res.json();

        if (!res.ok) {
            setErreur(data.error);
            return;
        }

        setCommu(prev => [data.communaute, ...prev]);
        setNom('');
        setDescription('');
        setPhotoGroupe('');
        setErreur('');
        setShowCreer(false);
    };

    const supprimerCommunaute = async (id_communaute) => {
        if (!window.confirm("Supprimer cette communauté ? Cette action est irréversible.")) return;

        const res = await fetch(`http://localhost:3000/communautes/${id_communaute}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
            setCommu(prev => prev.filter(c => c.id_communaute !== id_communaute));
            if (commuSelectionnee?.id_communaute === id_communaute) {
                setCommuSelectionnee(null);
            }
        } else {
            const data = await res.json();
            alert(data.error || "Erreur lors de la suppression");
        }
    };

    if (loading) return <p className="text-white p-8">Chargement...</p>;

    return (
        <div className="flex flex-col items-center gap-4 py-8 px-4">

            {/* Bouton créer */}
            <div className="w-full md:max-w-2xl flex justify-end">
                <button
                    onClick={() => setShowCreer(true)}
                    className="bg-purple-600 text-white text-sm rounded-full px-4 py-2"
                >
                    + Créer une communauté
                </button>
            </div>

            {commu.map(c => (
                <div
                    key={c.id_communaute}
                    className="w-full md:max-w-2xl bg-[#2c2c2e] rounded-3xl p-5 flex items-center gap-4 cursor-pointer hover:bg-[#3a3a3c] transition-colors"
                    onClick={() => navigate(`/community/${c.id_communaute}`)}
                >
                    <img
                        src={c.photo_groupe}
                        alt={c.nom_communaute}
                        className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                        onError={(e) => e.target.style.display = 'none'}
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm">{c.nom_communaute}</p>
                        <p className="text-gray-400 text-xs mt-1 truncate">{c.description_communaute}</p>
                        {c.id_createur === user?.id && (
                            <p className="text-purple-400 text-xs mt-1">👑 Créateur</p>
                        )}
                    </div>
                    
                    <div className="flex gap-2">
                        {c.id_createur === user?.id && (
                            <button
                                onClick={(e) => { e.stopPropagation(); supprimerCommunaute(c.id_communaute); }}
                                className="text-red-500 hover:text-red-400 transition-colors p-1"
                                title="Supprimer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                                </svg>
                            </button>
                        )}
                        
                        <button
                            onClick={(e) => { e.stopPropagation(); ouvrirMembres(c); }}
                            className="text-xs text-gray-400 border border-gray-600 rounded-full px-3 py-1 flex-shrink-0"
                        >
                            Membres
                        </button>
                        
                        {c.est_membre ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); quitter(c.id_communaute); }}
                                className="text-xs text-gray-400 border border-gray-600 rounded-full px-3 py-1 flex-shrink-0"
                            >
                                Quitter
                            </button>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); rejoindre(c.id_communaute); }}
                                className="text-xs text-white bg-purple-600 rounded-full px-3 py-1 flex-shrink-0"
                            >
                                Rejoindre
                            </button>
                        )}
                    </div>
                </div>
            ))}

            {/* Modal membres */}
            {commuSelectionnee && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-end sm:items-center justify-center" onClick={() => setCommuSelectionnee(null)}>
                    <div className="bg-[#2c2c2e] w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl p-5 max-h-[80vh] flex flex-col gap-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <p className="text-white font-semibold">{commuSelectionnee.nom_communaute}</p>
                            <button onClick={() => setCommuSelectionnee(null)} className="text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                        <hr className="border-[#3a3a3c]" />
                        <div className="flex-1 overflow-y-auto flex flex-col gap-3">
                            {membres.length === 0 && (
                                <p className="text-gray-400 text-sm text-center">Aucun membre</p>
                            )}
                            {membres.map(m => (
                                <div key={m.id_etudiant} className="flex items-center gap-3">
                                    {m.etudiants?.photo_profil ? (
                                        <img
                                            src={m.etudiants.photo_profil}
                                            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-[#5e5ce6] flex items-center justify-center text-white text-xs flex-shrink-0">
                                            {m.etudiants?.prenom_etudiant?.[0]}{m.etudiants?.nom_etudiant?.[0]}
                                        </div>
                                    )}
                                    <p className="text-white text-sm">{m.etudiants?.prenom_etudiant} {m.etudiants?.nom_etudiant}</p>
                                    {m.id_etudiant === commuSelectionnee.id_createur && (
                                        <p className="text-purple-400 text-xs ml-auto">👑 Créateur</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal créer communauté */}
            {showCreer && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-end sm:items-center justify-center" onClick={() => {
                    setShowCreer(false);
                    setPhotoGroupe('');
                    setErreur('');
                }}>
                    <div className="bg-[#2c2c2e] w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl p-5 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <button onClick={() => {
                                setShowCreer(false);
                                setPhotoGroupe('');
                                setErreur('');
                            }} className="text-gray-400 text-sm">Annuler</button>
                            <p className="text-white font-semibold">Nouvelle communauté</p>
                            <button onClick={creerCommunaute} className="text-purple-400 font-semibold text-sm">
                                Créer
                            </button>
                        </div>
                        <hr className="border-[#3a3a3c]" />
                        {erreur && <p className="text-red-400 text-sm">{erreur}</p>}
                        <input
                            type="text"
                            placeholder="Nom de la communauté *"
                            value={nom}
                            onChange={e => setNom(e.target.value)}
                            className="bg-[#1c1c1e] text-white text-sm rounded-xl px-4 py-3 outline-none placeholder-gray-500"
                        />
                        <textarea
                            placeholder="Description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            className="bg-[#1c1c1e] text-white text-sm rounded-xl px-4 py-3 outline-none placeholder-gray-500 resize-none"
                        />
                        <input
                            type="text"
                            placeholder="URL de la photo de profil (optionnel)"
                            value={photoGroupe}
                            onChange={e => setPhotoGroupe(e.target.value)}
                            className="bg-[#1c1c1e] text-white text-sm rounded-xl px-4 py-3 outline-none placeholder-gray-500"
                        />
                        {photoGroupe && (
                            <div className="flex justify-center mt-2">
                                <img 
                                    src={photoGroupe} 
                                    alt="Aperçu"
                                    className="w-16 h-16 rounded-full object-cover"
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
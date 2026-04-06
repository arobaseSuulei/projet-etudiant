import { useState, useEffect } from "react";

export default function Community() {
    const [commu, setCommu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [membres, setMembres] = useState([]);
    const [commuSelectionnee, setCommuSelectionnee] = useState(null);
    const token = localStorage.getItem("token");

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

    if (loading) return <p className="text-white p-8">Chargement...</p>;

    return (
        <div className="flex flex-col items-center gap-4 py-8 px-4">
            {commu.map(c => (
                <div
                    key={c.id_communaute}
                    className="w-full md:max-w-2xl bg-[#2c2c2e] rounded-3xl p-5 flex items-center gap-4 cursor-pointer"
                    onClick={() => ouvrirMembres(c)}
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
                    </div>

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
            ))}

            {/* Modal membres */}
            {commuSelectionnee && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-end sm:items-center justify-center" onClick={() => setCommuSelectionnee(null)}>
                    <div className="bg-[#2c2c2e] w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl p-5 max-h-[80vh] flex flex-col gap-4" onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <p className="text-white font-semibold">{commuSelectionnee.nom_communaute}</p>
                            <button onClick={() => setCommuSelectionnee(null)} className="text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>

                        <hr className="border-[#3a3a3c]" />

                        {/* Liste membres */}
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
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
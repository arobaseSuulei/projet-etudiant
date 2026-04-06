import { useState, useEffect } from "react";

export default function Community() {
    const [commu, setCommu] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch("http://localhost:3000/communautes")
            .then(res => res.json())
            .then(data => {
                
                console.log(data.communautes[0]);
                setCommu(data.communautes ?? []);
                setLoading(false);
                
            })
            .catch(err => {
                console.error("Erreur fetch :", err);
                setLoading(false);
            });
    }, []);

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
                <div key={c.id_communaute} className="w-full md:max-w-2xl bg-[#2c2c2e] rounded-3xl p-5 flex items-center gap-4">

                    <img
                        src={c.photo_groupe}
                        
                        className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                        onError={(e) => e.target.style.display = 'none'}
                    />

                    <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm">{c.nom_communaute}</p>
                        <p className="text-gray-400 text-xs mt-1 truncate">{c.description_communaute}</p>
                    </div>

                    {c.est_membre ? (
                        <button
                            onClick={() => quitter(c.id_communaute)}
                            className="text-xs text-gray-400 border border-gray-600 rounded-full px-3 py-1 flex-shrink-0"
                        >
                            Quitter
                        </button>
                    ) : (
                        <button
                            onClick={() => rejoindre(c.id_communaute)}
                            className="text-xs text-white bg-purple-600 rounded-full px-3 py-1 flex-shrink-0"
                        >
                            Rejoindre
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
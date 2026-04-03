import { useState, useEffect } from "react";

export default function Community() {
    const [commu, setCommu] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:3000/communautes")
            .then(res => res.json())
            .then(data => {
                console.log(data); // 👈 garde ça pour vérifier les vrais noms des champs
                setCommu(data.communautes); // ✅ pas data.publications
                setLoading(false);
            }) .catch(err => {
            console.error("Erreur fetch :", err);
            setLoading(false);
        });
    },
        []);

    if (loading) return <p className="text-white">Chargement...</p>;

    return (
        <div className="flex flex-col gap-4 p-8">
            {commu.map(c => (
                <div key={c.id_communaute} className="bg-[#2c2c2e] text-white p-4 rounded-xl">
                    <p className="font-semibold">{c.nom_communaute}</p>  {/* ✅ */}
                    <p>{c.description_communaute}</p>  {/* ✅ */}
                </div>
            ))}
        </div>
    );
}
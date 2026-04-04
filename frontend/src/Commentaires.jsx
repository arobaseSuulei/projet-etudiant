import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function Commentaires() {
    const { id } = useParams(); // id du post
    const [commentaires, setCommentaires] = useState([]);
    const user = JSON.parse(localStorage.getItem("user"));


    useEffect(() => {
        fetch(`http://localhost:3000/commentaires/publication/${id}`)
            .then(res => res.json())
            .then(data => setCommentaires(data.commentaires));
    }, [id]);

    return (
        <div className="flex flex-col items-center gap-4 py-8 px-4">
            <h2 className="text-white font-semibold text-lg">Commentaires</h2>
            {commentaires.map(c => (
                <div key={c.id_commentaire} className={`w-full md:max-w-2xl rounded-2xl p-4 ${c.id_etudiant === user.id ? 'bg-purple-900' : 'bg-[#2c2c2e]'}`}>
                    <p className="text-white text-sm">{c.commentaire}</p>
                    <p className="text-gray-400 text-xs mt-1">{c.id_etudiant === user.id ? 'Moi' : `Étudiant ${c.id_etudiant}`}</p>
                </div>
            ))}
        </div>
    );
}
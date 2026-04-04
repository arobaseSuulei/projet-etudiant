import { useState, useEffect } from "react";
import PostCard from "./components/PostCard.jsx";
import CommentaireModal from "./components/CommentaireModals.jsx";

export default function Posts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [postSelectionne, setPostSelectionne] = useState(null);

    useEffect(() => {
        fetch("http://localhost:3000/publications")
            .then(res => res.json())
            .then(data => {
                setPosts(data.publications ?? []);
                setLoading(false);
            });
    }, []);

    if (loading) return <p className="text-white">Chargement...</p>;

    return (
        <div className="flex flex-col items-center gap-4 py-8 px-4">
            {posts.map(post => (
                <PostCard
                    key={post.id_publication}
                    post={post}
                    onCommentClick={(p) => setPostSelectionne(p)}
                />
            ))}

            {postSelectionne && (
                <CommentaireModal
                    post={postSelectionne}
                    onClose={() => setPostSelectionne(null)}
                />
            )}
        </div>
    );
}
import { useEffect } from "react";
import TopBar from "./components/Top-bar.jsx";
import Posts from "./Posts.jsx";

export default function Home({ refreshRef }) {
    return (
        <div className="bg-[#1c1c1e]">
            
            <Posts onMounted={(fn) => { refreshRef.current = fn; }} />
        </div>
    );
}
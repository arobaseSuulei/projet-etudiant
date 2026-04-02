import Navbar from "./components/Navbar";
import TopBar from "./components/Top-bar.jsx";
import Connexion from "./Connexion.jsx";
import Posts from "./Posts.jsx";

export default function Home(){
    return(
        <div className={' bg-[#1c1c1e]'}>
            <div className="">

                <p>hey</p>

                <TopBar/>

                <Posts/>



            </div>
        </div>
    );
}
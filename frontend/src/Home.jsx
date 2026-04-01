import Navbar from "./components/Navbar";
import TopBar from "./components/Top-bar.jsx";
import Connexion from "./Connexion.jsx";

export default function Home(){
    return(
        <div className={' bg-[#1c1c1e]'}>
            <div className="">

                <TopBar/>

                <Connexion/>

            </div>
        </div>
    );
}
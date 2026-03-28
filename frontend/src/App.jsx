import Navbar from "./components/Navbar";

export default function App(){
    return(
        <div className={'sm:ml-64'}>
            <div className="hidden sm:block">
                <Navbar />
            </div>
        </div>
    );
}
export default function SearchBar(){
    return (
        <div>
            <div
                className="text-white  pt-2 sm:hidden items-center justify-end flex text-xs gap-2 fixed sm:static top-0 left-0 w-full">


                <nav className={'flex items-center gap-3 font-semibold text-lg px-4 py-2 rounded-full cursor-pointer  '}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                         stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>
                    </svg>

                </nav>


            </div>
        </div>
    );
}
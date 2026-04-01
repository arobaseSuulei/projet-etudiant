import { Link } from "react-router-dom";

export default function NavbarPhone() {
    return (
        <div className=" text-white border-t border-gray-200 pt-2 sm:hidden items-center justify-center  flex text-xs gap-2 fixed sm:static bottom-0 left-0 w-full">












            <nav className={'flex items-center gap-3 font-semibold text-lg px-4 py-2 rounded-full cursor-pointer  '}>
                <div className="relative">
                    <Link to="/">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
                        </svg>
                    </Link>
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-600 rounded-full"></div>
                </div>

            </nav>



            <nav className={'flex items-center gap-3 font-semibold text-lg px-4 py-2 rounded-full cursor-pointer  '}>
                <div className="relative">
                    <Link to="/">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                             stroke="currentColor" className="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                  d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776"/>
                        </svg>

                    </Link>
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-600 rounded-full"></div>
                </div>

            </nav>


            <nav className={'flex items-center gap-3 font-semibold text-lg px-4 py-2 rounded-full cursor-pointer  '}>
                <div className="relative">
                    <Link to={'/messages'}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                             stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/>
                        </svg>
                    </Link>
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-600 rounded-full"></div>
                </div>

            </nav>

            <nav className={'flex items-center gap-3 font-semibold text-lg px-4 py-2 rounded-full cursor-pointer  '}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                     stroke="currentColor" className="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/>
                </svg>


            </nav>








        </div>






    )
}
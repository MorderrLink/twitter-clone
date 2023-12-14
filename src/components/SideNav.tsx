import { signIn, signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { IconHoverEffect } from "./IconHoverEffect"
import { VscHome, VscAccount, VscSignIn, VscSignOut } from "react-icons/vsc";
import { BsBell, BsBellSlash } from "react-icons/bs";
import { useState } from "react";
import { api } from "~/utils/api";

export default function SideNav () {
    const session = useSession()
    const user = session.data?.user
    const currentUserId = user?.id
    const [notifications, setNotifications] = useState<boolean>(false)
    const [permission, setPermission] = useState<"granted" | "denied" | undefined>(undefined)

    const backendNotificationState = api.user.setNotifications.useMutation()

    function changeNotifications() {
        if (currentUserId == undefined) return 
        if (permission === undefined) {
            Notification.requestPermission().then((perm) => {
                try {
                    if (perm === "granted") {
                        setNotifications(true)
                        setPermission("granted")
                        backendNotificationState.mutate({id: currentUserId, NotifFlag: notifications})
                    } else {   
                        setNotifications(false)
                        backendNotificationState.mutate({id: currentUserId, NotifFlag: notifications})
                        setPermission("denied")
                    }
                } catch (error) {
                    console.error(error)
                }
                
            }) 
        }
        if (permission == "granted" && notifications) {
            setNotifications(false)
            backendNotificationState.mutate({id: currentUserId, NotifFlag: notifications})
        }
        if (permission == "granted" && !notifications) {
            setNotifications(true)
            backendNotificationState.mutate({id: currentUserId, NotifFlag: notifications})
        }
    }













    return (
        <nav className="sticky h-screen top-0 px-2 py-4 flex flex-col items-end">
            <ul className="flex flex-col  gap-2 whitespace-nowrap h-full">
                <li className="flex flex-row self-start items-center">
                    <Link href="/">
                        <IconHoverEffect>
                            <span className="flex items-center gap-4">
                                <VscHome className="w-8 h-8"/>
                                <span className="hidden text-lg md:inline">Home</span>
                            </span>  
                        </IconHoverEffect>
                    </Link>
                </li>
                {user != null && 
                (<li className="flex flex-row self-start items-center">
                    <Link href={`/profiles/${user?.id}`}>
                    <IconHoverEffect>
                            <span className="flex items-center gap-4">
                                <VscAccount className="w-8 h-8 font-thin"/>
                                <span className="hidden text-lg md:inline">Profile</span>
                            </span>  
                        </IconHoverEffect>
                    </Link>
                </li>) 
                }
                { user == null 
                ? <li className="flex flex-row self-start items-center">
                    <button onClick={() =>  void signIn() }>
                        <IconHoverEffect>
                            <span className="flex items-center gap-4">
                                <VscSignIn className="w-8 h-8 fill-green-700"/>
                                <span className="hidden text-lg md:inline text-green-700">Log In</span>
                            </span>  
                        </IconHoverEffect>
                    </button>
                </li> 
                :
                <li className="flex flex-row self-start items-center">
                    <button onClick={() =>  void signOut() }>
                        <IconHoverEffect>
                            <span className="flex items-center gap-4">
                                <VscSignOut className="w-8 h-8 fill-red-700"/>
                                <span className="hidden text-lg md:inline text-red-700">Log Out</span>
                            </span>  
                        </IconHoverEffect>
                    </button>
                </li>
                }
            </ul>
            {user !== null && <div className="flex flex-row self-end items-center">
                    <span className="hidden text-lg md:inline ">Notifications <p className="text-xs text-gray-500">You will receive them on your email</p></span>
                    
                    <button onClick={changeNotifications}>
                        <IconHoverEffect>
                            <span className="flex items-center justify-center gap-4">
                                {notifications ? <BsBell className="w-8 h-8"/> : <BsBellSlash className="w-8 h-8"/>}
                            </span>  
                        </IconHoverEffect>
                    </button>
                </div>}
        </nav>
    )
}
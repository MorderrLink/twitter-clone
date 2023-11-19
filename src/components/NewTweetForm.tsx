import { useSession } from "next-auth/react";
import Button from "./Button";
import ProfileImage from "./ProfileImage";
import { FormEvent, useCallback, useLayoutEffect, useRef, useState } from "react";
import { api } from "~/utils/api";
import { Doc } from "prettier";

function UpdateTextAreaSize(textArea?: HTMLTextAreaElement) {
    if (textArea === null) return;
    if (textArea === undefined) return;
    textArea.style.height = "0";
    textArea.style.height = `${textArea?.scrollHeight}px`;
}


export default function NewTweetForm() {
    const session = useSession()
    if (session.status !== "authenticated") return;

    return <Form/>
}

function Form () {
    const session = useSession()
    const [inputValue, setInputValue] = useState("")
    const textAreaRef = useRef<HTMLTextAreaElement>();
    const inputRef = useCallback((textArea: HTMLTextAreaElement) => {
        UpdateTextAreaSize(textArea);
        textAreaRef.current = textArea;
    }, [])
    const trpxUrils = api.useContext()

    useLayoutEffect(() => {
        UpdateTextAreaSize(textAreaRef.current);
    }, [inputValue])

    


    const createTweet = api.tweet.create.useMutation({ 
        onSuccess: (newTweet) => {
            setInputValue("");  

            if (session.status !== "authenticated") return 

            trpxUrils.tweet.infiniteFeed.setInfiniteData({}, (oldData) => {
                if (oldData == null || oldData.pages[0] == null) return

                const newCacheTweet = {
                    ...newTweet,
                    likeCount: 0,
                    likedByMe: false,
                    user: {
                        id: session.data.user.id,
                        name: session.data.user.name,
                        image: session.data.user.image,
                    }
                }
                setInputValue(""); 
                return {
                    ...oldData,
                    pages: [
                        { ...oldData.pages[0],
                            tweets: [newCacheTweet, ...oldData.pages[0].tweets] },
                           ...oldData.pages.slice(1)
                    ]
                }
                
            })
        }
    })

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        createTweet.mutate({content: inputValue });
        textAreaRef.current.value = "";
        
    }

    if (session.status !== "authenticated") return null;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-b px-4 py-2">
            <div className="flex gap-4">
                <ProfileImage src={session.data.user.image}/>
                <textarea
                 name="newTweet" 
                 ref={inputRef}
                 onChange={(e) => setInputValue(e.target.value)}
                 className="flex-grow resize-none overflow-hidden p-4 text-lg outline-none" 
                 placeholder="What's happening?"/>
            </div>
            <Button className="self-end">Send</Button>
        </form>
    )
}
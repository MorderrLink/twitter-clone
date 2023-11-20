import { useSession } from "next-auth/react";
import Button from "./Button";
import ProfileImage from "./ProfileImage";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { api } from "~/utils/api";

import { UploadButton } from "~/utils/uploadthing";
import FileSample from "./FileSample";


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
    const trpcUrils = api.useContext()

    const [file, setFile] = useState("")


    useLayoutEffect(() => {
        UpdateTextAreaSize(textAreaRef.current);
    }, [inputValue])



    const createTweet = api.tweet.create.useMutation({ 
        onSuccess: (newTweet) => {
            setInputValue("");  
            setFile("");
            if (session.status !== "authenticated") return 

            trpcUrils.tweet.infiniteFeed.setInfiniteData({}, (oldData) => {
                if (oldData?.pages?.[0] == null) return;

                const newCacheTweet = {
                    ...newTweet,
                    likeCount: 0,
                    likedByMe: false,
                    user: {
                        id: session.data.user.id,
                        name: session.data.user.name ?? null,
                        image: session.data.user.image ?? null,
                    },
                    image: file,
                }
                
                return {
                    ...oldData,
                    pages: [
                        { ...oldData.pages[0],
                            tweets: [newCacheTweet, ...oldData.pages[0].tweets] 
                        },
                        ...oldData.pages.slice(1)
                    ]
                }
                
            })
        }
    })

    function handleSubmit() {
        
        createTweet.mutate({content: inputValue, image: file });
        setInputValue("")
        setFile("")

        
    }

    if (session.status !== "authenticated") return null;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-b px-4 py-2">
            <div className="flex gap-4">
                <ProfileImage src={session.data.user.image}/>
                <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                        if (res == undefined) return null;
                        const imageUrl = [...res][0]?.url;
                        if (imageUrl == undefined) return
                        setFile(imageUrl)
                        // Do something with the response
                        console.log("File: ", res);
                        console.log("File in a State", file)

                    }}
                    onUploadError={(error: Error) => {
                        // Do something with the error.
                        alert(`ERROR! ${error.message}`);
                    }}
                />
                
                    
                <textarea
                 name="newTweet" 
                 ref={inputRef}
                 onChange={(e) => setInputValue(e.target.value)}
                 className="flex-grow resize-none overflow-hidden p-4 text-lg outline-none" 
                 placeholder="What's happening?"/>
                
            </div>
            {file != "" && <FileSample image={file}/>}
            <Button className="self-end">Send</Button>
        </form>
    )
}
import { useSession } from "next-auth/react";
import Button from "./Button";
import ProfileImage from "./ProfileImage";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { api } from "~/utils/api";
import  FileInput  from "./FileInput";
import FileSample from "./FileSample";
// import { URL } from "next/dist/compiled/@edge-runtime/primitives/url";
import { useEdgeStore } from '../lib/edgestore';
import { Toaster, toast } from 'sonner';



const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/tiff", "mage/bmp", "image/x-icon"]
const videoTypes = ["video/mp4", "video/webm", "video/mov"]


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




    const [file, setFile] = useState<File | undefined>(undefined)
    const [fileUrl, setFileUrl] = useState<string | undefined>(undefined)
    const [fileType, setFileType] = useState<string | undefined>(undefined)
    const { edgestore } = useEdgeStore();
    let followers: { id: string; email: string | null; }[] | undefined = undefined;


    
    
    if (session.data?.user !== undefined && followers === undefined) {
        const followersQuery = api.follows.getFollowers.useQuery({id: session.data.user.id}).data
        followers = followersQuery
    }


    useLayoutEffect(() => {
        UpdateTextAreaSize(textAreaRef.current);
    }, [inputValue])


    const createTweet = api.tweet.create.useMutation({ 
        onSuccess: (newTweet) => {
            setInputValue("");  
            setFile(undefined);
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
                    image: fileUrl,
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


    function removeSample() {
        setFile(undefined)
        setFileUrl(undefined)
        setFileType(undefined)
    }

    type sendProps = {
        content:string;
        author:string | null | undefined;
        authorId:string | null | undefined;
        userEmail: string | null;
    }
    async function sendEmail({content, author, authorId, userEmail}: sendProps) {
        const response = await fetch('/emails/send', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({content: content, author: author, authorId: authorId, userEmail: userEmail})
        })
        if (response.status == 200){
            console.log("Email sent")
        }
    }

    async function handleSubmit(e:React.FormEvent) {
        e.preventDefault()
        if ( inputValue === "" ) return
        if (file != undefined) {
            const res = await edgestore.publicFiles.upload({
                file,
                options: {
                    replaceTargetUrl: fileUrl,
                },
                });
            const EdgeStoreFileUrl = res.url

            createTweet.mutate({content: inputValue, fileUrl: EdgeStoreFileUrl, fileType: fileType });
            setInputValue("")
            setFile(undefined)
            setFileType(undefined)
            return
            }

        createTweet.mutate({content: inputValue, fileUrl: undefined, fileType: undefined });
        
        if (session.data?.user.name != undefined && followers !== undefined) {
            
            for (const follower of followers) {
                console.log(follower);
                await sendEmail({content: inputValue, author: session.data?.user.name, authorId: session.data?.user.id, userEmail: follower.email});
            }
         }
        
         

        setInputValue("")
        setFile(undefined)
        setFileType(undefined)
        toast.success("Tweet created", {
            duration: 3000,
        })



        
    }

    function handleChange(e:React.ChangeEvent<HTMLInputElement>) {      
        const tempFile = e.target.files?.[0]  
        setFile(tempFile)
        // console.log(tempFile, tempFile?.type)
        if ( tempFile === undefined || tempFile.type === undefined) {
            setFileType(undefined)
        } else if (imageTypes.includes(tempFile?.type)) { 
            setFileType("image")
        } else if (videoTypes.includes(tempFile?.type)) { 
            setFileType("video")
        } 
        


        if (fileUrl) {
            URL.revokeObjectURL(fileUrl)
        }

        if (tempFile) {
            const url = URL.createObjectURL(tempFile)
            setFileUrl(url)
        } else {
            setFileUrl(undefined)
            setFileType(undefined)
        }
    }


    if (session.status !== "authenticated") return null;

    return (
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-b px-4 py-2">
            <Toaster richColors />
            <div className="flex gap-4">
                <ProfileImage src={session.data.user.image}/>
                <FileInput onChange={handleChange}/>
                <textarea
                 name="newTweet" 
                 ref={inputRef}
                 onChange={(e) => setInputValue(e.target.value)}
                 className="flex-grow resize-none overflow-hidden p-4 text-lg outline-none" 
                 placeholder="What's happening?"/>
                
            </div>
            {fileUrl && (<FileSample file={fileUrl} fileType={fileType} onClick={removeSample}/>)}
            {inputValue=== "" ? <Button type="submit" disabled className="self-end bg-slate-400" >Send</Button> : <Button type="submit" className="self-end" >Send</Button>}
            
        </form>
    )
}
import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";
import ProfileImage from "./ProfileImage";
import { HeartButton } from "./HeartButton";
import { api } from "~/utils/api";
import LoadingSpinner from "./LoadingSpinner";
import VideoFrame from "./VideoFrame";
import ImageFrame from "./ImageFrame";
import DeleteButton from "./DeleteButton";
import { VscTrash } from "react-icons/vsc";
import { useState } from "react";
import { useEdgeStore } from "~/lib/edgestore";
import { Toaster, toast } from 'sonner';

type infiniteTweetListProps = {
    isLoading: boolean;
    isError: boolean;
    hasMore: boolean | undefined;
    fetchNewTweets: () => Promise<unknown>;
    tweets?: Tweet[];
}

type Tweet = {
    id: string;
    content: string;
    createdAt: Date;
    likeCount: number;
    likedByMe: boolean;
    user: {id: string; image: string | null; name: string | null };
    fileUrl?: string | null; 
    fileType?: string | null;
}




export function InfiniteTweetList({ tweets, isError, isLoading, hasMore, fetchNewTweets }: infiniteTweetListProps) {
    if (isLoading) {
        return <LoadingSpinner/>
    }
    if (isError) {
        return <h1>Error...</h1>
    }
    if (tweets == null) {
        return null
    }
    if (tweets == null || tweets?.length === 0) {
        return <h2 className="my-4 text-center text-2xl text-gray-500">No Tweets</h2>
    }





    return <ul>
        <InfiniteScroll
        dataLength={tweets.length}
        next={fetchNewTweets}
        hasMore={hasMore ? hasMore : false}
        loader={<LoadingSpinner/>}>

        {tweets.map( tweet => {
            return <TweetCard key={tweet.id} {...tweet}/>
        } )}

        </InfiniteScroll>
    </ul>
}

const dateTimeFormatter = Intl.DateTimeFormat(undefined, { dateStyle: "short", } )




function TweetCard({
    id,
    user,
    content,
    createdAt,
    likeCount,
    likedByMe,
    fileUrl,
    fileType
}: Tweet) {
    const trpcUtils = api.useContext()
    const toggleLike =  api.tweet.toggleLike.useMutation({
        onSuccess: ({addedLike}) => {
            const updateData: Parameters<typeof trpcUtils.tweet.infiniteFeed.setInfiniteData>[1] = (oldData) => {
                if (oldData == null) return

                const countModifier = addedLike ? 1 : -1
                return {
                    ...oldData,
                    pages: oldData.pages.map(page => {
                        return {
                            ...page,
                            tweets: page.tweets.map(tweet => {
                                if (tweet.id === id) {
                                    return {
                                        ...tweet,
                                        likeCount: tweet.likeCount + countModifier,
                                        likedByMe: addedLike
                                    }
                                }
                                return tweet;
                            })
                        }
                    })
                }
            }
             trpcUtils.tweet.infiniteFeed.setInfiniteData({}, updateData)
             trpcUtils.tweet.infiniteFeed.setInfiniteData({ onlyFollowing: true }, updateData)
             trpcUtils.tweet.infiniteProfileFeed.setInfiniteData({ userId: user.id }, updateData)
        } })

    function handleToggleLike() {
        toggleLike.mutate({ id })
    }

    const [deleted, setDeleted] = useState<boolean>(false)
    const deleteTweet = api.tweet.delete.useMutation()
    const { edgestore } = useEdgeStore();

    async function DeleteTweet(id:string, fileUrl:string | null | undefined) {
        setDeleted(true)
        deleteTweet.mutate({ tweetId: id })
        if (fileUrl != null && fileUrl != undefined) {
            await edgestore.publicFiles.delete({
                url: fileUrl,
              });
        }
    }

    const isAdmin = api.user.getIsAdmin.useQuery().data?.isAdmin

    return <li className="flex gap-4 border-b px-4 py-4">
        <Toaster richColors />
        <Link href={`/profiles/${user.id}`} className="outline-none z-0">
            <ProfileImage src={user.image} />
        </Link>
        <div className="flex flex-grow flex-col">
            <div className="flex gap-1">
                <Link href={`/profiles/${user.id}`} className="font-semibold hover:underline focus-visible:underline outline-none" > {user.name} </Link>
                <span className="text-gray-500">-</span>
                <span className="text-gray-500">{dateTimeFormatter.format(createdAt)}</span>
            </div>
             {deleted ? "" : <p className="whitespace-pre-wrap ">{content}</p> } 
            {fileUrl != undefined && !deleted && fileType === "image" && <ImageFrame file={fileUrl}/>}
            {fileUrl != undefined && !deleted && fileType === "video" && <VideoFrame file={fileUrl}/>}
            <HeartButton classNames={`${deleted ? "hidden" : ""} `} onClick={handleToggleLike} isLoading={toggleLike.isLoading} likedByMe={likedByMe} disabled={deleted} likeCount={likeCount}/> 
            { isAdmin && <DeleteButton onClick={async () => {await DeleteTweet(id, fileUrl); toast.info("Tweet deleted",{duration: 3000}) }} deleted={deleted} >  <VscTrash/>  </DeleteButton> }
        </div>
    </li>
}
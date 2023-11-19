import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";
import ProfileImage from "./ProfileImage";
import { HeartButton } from "./HeartButton";
import { api } from "~/utils/api";
import LoadingSpinner from "./LoadingSpinner";


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
}: Tweet) {
    const trpcUtils = api.useContext()
    const toggleLike =  api.tweet.toggleLike.useMutation({
        onSuccess: async ({addedLike}) => {
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
            await trpcUtils.tweet.infiniteFeed.setInfiniteData({}, updateData)
            await trpcUtils.tweet.infiniteFeed.setInfiniteData({ onlyFollowing: true }, updateData)
            await trpcUtils.tweet.infiniteProfileFeed.setInfiniteData({ userId: user.id }, updateData)
        } })

    function handleToggleLike() {
        toggleLike.mutate({ id })
    }

    return <li className="flex gap-4 border-b px-4 py-4">
        <Link href={`/profiles/${user.id}`} className="outline-none">
            <ProfileImage src={user.image} />
        </Link>
        <div className="flex flex-grow flex-col">
            <div className="flex gap-1">
                <Link href={`/profiles/${user.id}`} className="font-bold hover:underline focus-visible:underline outline-none" > {user.name} </Link>
                <span className="text-gray-500">-</span>
                <span className="text-gray-500">{dateTimeFormatter.format(createdAt)}</span>
            </div>
            <p className="whitespace-pre-wrap"> {content} </p>
            <HeartButton onClick={handleToggleLike} isLoading={toggleLike.isLoading} likedByMe={likedByMe} likeCount={likeCount}/> 
        </div>
    </li>
}
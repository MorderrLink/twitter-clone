import { useSession } from "next-auth/react";
import { useState } from "react";
import { InfiniteTweetList } from "~/components/InfiniteTweetList";
import NewTweetForm from "~/components/NewTweetForm";
import { api } from "~/utils/api";


const TABS = ["Recent", "Following"] as const

export default function Home() {
  const session = useSession()

  const [selectedTab, setSelectedTab] = useState<(typeof TABS)[number]>("Recent")
  
  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-white pt-2">
        <h1 className="mb-2 px-4 text-lg font-semibold">Home</h1>
        {session.status === "authenticated" && (
          <div className="flex">
            {TABS.map(tab => {
              return <button key={tab} className={`flex-grow p-2 hover:bg-gray-200 focus-visible:bg-gray-200 
              ${ tab === selectedTab 
                ? "border-b-4 border-b-blue-500 font-semibold" 
                : "" }`}
                onClick={() => setSelectedTab(tab)}
                >
                  {tab}
                </button>
            })}
          </div>
        )}
      </header>
      { session.status === "authenticated" ? (<div>
        <NewTweetForm/>
        {selectedTab === "Recent" ? <RecentTweets/> : <FollowingTweets /> }
      </div>) : <div className="w-full h-screen flex justify-center items-center font-mono">
        <p className="text-xl">You need to AUTH to see posts!</p>
      </div> }
      
    </>
  );
}

function RecentTweets() {
  const tweets = api.tweet.infiniteFeed.useInfiniteQuery(
    {}, 
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );
  return <InfiniteTweetList
    tweets={tweets.data?.pages.flatMap((page) => page.tweets)}
    isError={tweets.isError}
    isLoading={tweets.isLoading}
    hasMore={tweets.hasNextPage}
    fetchNewTweets={tweets.fetchNextPage}
/>
}


function FollowingTweets() {
  const tweets = api.tweet.infiniteFeed.useInfiniteQuery(
    { onlyFollowing: true }, 
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  return <InfiniteTweetList
    tweets={tweets.data?.pages.flatMap((page) => page.tweets)}
    isError={tweets.isError}
    isLoading={tweets.isLoading}
    hasMore={tweets.hasNextPage}
    fetchNewTweets={tweets.fetchNextPage}
/>
}



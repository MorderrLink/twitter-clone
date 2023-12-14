import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import Head from "next/head";
import SideNav from "~/components/SideNav";
import { api } from "~/utils/api";
import { EdgeStoreProvider } from '../lib/edgestore';
import "~/styles/globals.css";
import YouAreBanned from "~/components/YouAreBanned";



const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const isBanned = api.user.getIsBanned.useQuery().data?.isBanned



  return (
    <EdgeStoreProvider>
      <SessionProvider session={session}>
        <Head>
          <title>Gambitter</title>
          <meta name="description" content="It's a Tweeter clone" />
        </Head>

        {isBanned ? <YouAreBanned/>
        : <div className="container mx-auto flex items-start font-roboto">
        <SideNav/>
        <div className="min-h-screen flex-grow border-x">
          
          <Component {...pageProps} />  
        </div>
      </div>
      }
      </SessionProvider>
    </EdgeStoreProvider>
  );
};

export default api.withTRPC(MyApp);

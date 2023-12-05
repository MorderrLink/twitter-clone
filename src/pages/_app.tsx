import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import Head from "next/head";
import SideNav from "~/components/SideNav";
import { api } from "~/utils/api";
import { EdgeStoreProvider } from '../lib/edgestore';
import "~/styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <EdgeStoreProvider>
      <SessionProvider session={session}>
        <Head>
          <title>Twitter Clone</title>
          <meta name="description" content="It's a Tweeter clone" />
        </Head>

        <div className="container mx-auto flex items-start">
          <SideNav/>
          <div className="min-h-screen flex-grow border-x">
            <Component {...pageProps} />  
          </div>
        </div>
      </SessionProvider>
    </EdgeStoreProvider>
  );
};

export default api.withTRPC(MyApp);

import { type AppType } from "next/dist/shared/lib/utils";
import { RecoilRoot } from "recoil";
import "~/styles/globals.css";

import { Source_Sans_Pro } from "next/font/google";

const SourceSans = Source_Sans_Pro({
  weight: "400",
  subsets: ["latin"],
  variable: "--fontBody",
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <RecoilRoot>
      <main className={`${SourceSans.variable} font-sans, font-body`}>
        <Component {...pageProps} />
      </main>
    </RecoilRoot>
  );
};

export default MyApp;

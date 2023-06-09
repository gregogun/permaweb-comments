import Head from "next/head";
import { Flex, styled } from "@aura-ui/react";
import { ConnectWallet } from "arweave-wallet-ui-test";
import { Comments } from "../modules/comments/Comments";

const Main = styled("main", {
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  width: "100%",
  height: "100%",
});

export default function Home() {
  return (
    <>
      <Head>
        <title>Permaweb Comments</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="favicon.ico" />
      </Head>
      <Flex
        css={{
          p: "$5",
        }}
        justify="end"
      >
        <ConnectWallet
          permissions={["ACCESS_ADDRESS", "ACCESS_ALL_ADDRESSES", "DISPATCH"]}
          appName="Permaweb Comments"
          options={{
            connectButtonColorScheme: "indigo",
            connectButtonVariant: "solid",
          }}
        />
      </Flex>
      <Main>
        <Comments />
      </Main>
    </>
  );
}

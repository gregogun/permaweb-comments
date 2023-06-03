import type { AppProps } from "next/app";
import { darkTheme, globalCss, ToastProviderValues } from "@aura-ui/react";
import { ThemeProvider } from "next-themes";
import { ConnectProvider } from "arweave-wallet-ui-test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const globalStyles = globalCss({
  "*, *::before, *::after": {
    boxSizing: "inherit",
  },
  "*": {
    "*:focus:not(.focus-visible)": {
      outline: "none",
    },
  },
  "html, body, #root, #__next": {
    height: "100%",
    fontFamily: "$body",
    margin: 0,
    backgroundColor: "$slate1",
  },

  "#__next": {
    position: "relative",
    zIndex: 0,
  },
  a: {
    textDecoration: "none",
  },
});

globalStyles();

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProviderValues>
        <ConnectProvider>
          <ThemeProvider
            disableTransitionOnChange
            attribute="class"
            value={{ light: "light-theme", dark: darkTheme.toString() }}
          >
            <Component {...pageProps} />
          </ThemeProvider>
        </ConnectProvider>
      </ToastProviderValues>
    </QueryClientProvider>
  );
}

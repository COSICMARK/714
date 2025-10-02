"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  getDefaultConfig,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";

const queryClient = new QueryClient();

const config = getDefaultConfig({
  appName: "Zevru Landing",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!, // Get this from WalletConnect Cloud
  chains: [base, mainnet],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

import { Coin, GasPrice, SigningStargateClient } from '@cosmjs/stargate';
import type { StateCreator } from 'zustand';
import { create } from 'zustand';
import type { PersistOptions } from 'zustand/middleware';
import { createJSONStorage, persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

import type { BriefChainInfo } from '@/shared/types/chain';
import { getSideChainInfo } from '@/shared/types/chain';
//import { SideSigningStargateClient } from '@/utils/side_stargateclient';
import { defaultRegistryTypes, AminoTypes } from '@cosmjs/stargate';
import SigningKeplerEthermintClient from '@/utils/SigningKeplrEthermintClient';

import PromisePool from '@supercharge/promise-pool';
import { AppConfig } from '@/utils/AppConfig';
import { Registry } from '@cosmjs/proto-signing';
import {
  ethermintProtoRegistry,
  ethermintAminoConverters,
} from '@/codegen/ethermint/client';
import { ibcProtoRegistry, ibcAminoConverters } from '@/codegen/ibc/client';

import chargeCoins from '@/http/requests/post/chargeCoins';
import { OfflineDirectSigner } from '@keplr-wallet/types';
import fetchAccount from '@/http/requests/get/fetchAccount';
import fetchBalances from '@/http/requests/get/fetchBalance';

export const getSigningClientOptions = () => {
  const registry = new Registry([
    ...defaultRegistryTypes,
    ...ethermintProtoRegistry,
    ...ibcProtoRegistry,
  ]);
  const aminoTypes = new AminoTypes({
    ...ethermintAminoConverters,
    ...ibcAminoConverters,
  });

  return {
    registry,
    aminoTypes,
  };
};
export interface Wallet {
  address: string;
  chainInfo: BriefChainInfo;
}
export interface Balance {
  id: string;
  balances: Coin[];
}
interface WalletState {
  loading: boolean;
  isConnected: boolean;
  wallets: Wallet[];
  balanceList: Balance[];
  selectedChain: BriefChainInfo;
  setLoading: (isLoad: boolean) => void;
  connectWallet: () => Promise<void>;
  suggestChain: (chain: BriefChainInfo) => Promise<void>;
  getClient: (
    chain: BriefChainInfo
  ) => Promise<SigningKeplerEthermintClient | undefined>;
  disconnect: () => void;
  charge: () => Promise<void>;
  getBalance: () => Promise<
    {
      id: string;
      balances: Coin[];
    }[]
  >;
  setBalance: (balance: Balance[]) => void;
}

type WalletPersist = (
  config: StateCreator<WalletState>,
  options: PersistOptions<WalletState>
) => StateCreator<WalletState>;
console.log(AppConfig.chains, 'AppConfig.chains');
const useWalletStore = create<WalletState>(
  (persist as WalletPersist)(
    (set, get) => ({
      loading: false,
      isConnected: false,
      wallets: [],
      selectedChain: {},
      balanceList: [],
      setLoading: (isLoad: boolean) => {
        set((state) => ({
          ...state,
          loading: isLoad,
        }));
      },
      suggestChain: async (chain: BriefChainInfo) => {
        console.log('==== suggest chain', chain);
        const { keplr } = window;
        if (!keplr) {
          toast.error('You need to install Keplr');
          return;
        }
        const chainInfo = getSideChainInfo(chain);
        await keplr.experimentalSuggestChain(chainInfo);
        set((state) => ({
          ...state,
          selectedChain: chain,
        }));
      },
      connectWallet: async () => {
        const { setLoading, suggestChain, selectedChain } = get();
        setLoading(true);

        const { keplr } = window;
        if (!keplr) {
          toast.error('You need to install Keplr');
          return;
        }

        const newWallets: Wallet[] = [];
        const chain = selectedChain;
        try {
          await suggestChain(chain);
          // Poll until the chain is approved and the signer is available
          const offlineSigner = await keplr.getOfflineSigner(chain.chainID);
          const newCreator = (await offlineSigner.getAccounts())[0].address;
          const newWallet: Wallet = {
            address: newCreator,
            chainInfo: chain,
          };
          newWallets.push(newWallet);
        } catch (error) {
          console.log('Connection Error', error);
        }

        if (newWallets.length === AppConfig.chains.length) {
          set((state) => ({
            ...state,
            isConnected: true,
            wallets: newWallets,
          }));
        } else {
          console.log('Not all chains could be registered.');
        }

        setLoading(false);
      },

      getClient: async (chain: BriefChainInfo) => {
        try {
          const { setLoading } = get();

          setLoading(true);
          const { keplr } = window;
          if (!keplr) {
            toast.error('You need to install Keplr');
            return;
          }
          const chainInfo = getSideChainInfo(chain);
          await keplr.experimentalSuggestChain(chainInfo);
          const offlineSigner = await keplr.getOfflineSigner(chainInfo.chainId);

          const { aminoTypes, registry } = getSigningClientOptions();
          const newSigningClient =
            await SigningStargateClient.connectWithSigner(
              chain.rpcUrl,
              offlineSigner,
              {
                gasPrice: GasPrice.fromString(`0.01${chain.denom}`),
                registry,
                aminoTypes,
              }
            );
          const newClient = new SigningKeplerEthermintClient(
            newSigningClient,
            offlineSigner
          );
          console.log('New client', newClient);
          setLoading(false);
          return newClient;
        } catch (error) {
          return undefined;
        }
      },
      disconnect: () => {
        set((state) => ({ ...state, isConnected: false, wallets: [] }));
      },

      charge: async () => {
        const { wallets, setLoading, connectWallet, selectedChain } = get();
        await connectWallet();
        setLoading(true);
        const currentWallets = wallets.filter((item) => {
          return item.chainInfo?.chainID === selectedChain?.chainID;
        });
        const toastItem = toast.loading('Charging');
        const res = await PromisePool.withConcurrency(2)
          .for(currentWallets)
          .process(async (chain) => {
            const url = new URL(chain.chainInfo.rpcUrl);
            await chargeCoins(
              url.hostname,
              chain.chainInfo.denom,
              chain.address
            );
            toast.success('Charge Success', {
              id: toastItem,
            });
          });
        setLoading(false);
        if (res?.errors?.[0]?.message) {
          toast.error(res?.errors?.[0]?.message, {
            id: toastItem,
          });
        }
      },
      getBalance: async () => {
        const { wallets, setLoading, connectWallet, selectedChain } = get();
        await connectWallet();
        setLoading(true);
        const currentWallets = wallets.filter((item) => {
          return item.chainInfo?.chainID === selectedChain?.chainID;
        });
        const res = await PromisePool.withConcurrency(2)
          .for(currentWallets)
          .process(async (chain) => {
            const balances = await fetchBalances(
              chain.chainInfo.restUrl,
              chain.address
            );
            return { id: chain.chainInfo.chainID, balances: balances };
          });
        setLoading(false);

        return res.results.flat();
      },
      setBalance: (balances: Balance[]) => {
        const { selectedChain } = get();
        balances?.forEach((item) => {
          item.id = selectedChain.chainID;
        });
        set((state) => ({
          ...state,
          balanceList: balances,
        }));
      },
    }),
    { name: 'wallet-store', storage: createJSONStorage(() => sessionStorage) }
  )
);

export default useWalletStore;

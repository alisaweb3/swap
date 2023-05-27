import { proxy, useSnapshot } from 'valtio';

import { Coin } from '@cosmjs/stargate';
import fetchAtomicSwapList from '@/http/requests/get/fetchAtomicSwapList';
import chargeCoins from '@/http/requests/post/chargeCoins';
import { BriefChainInfo } from '../shared/types/chain';
import { AppConfig } from '../utils/AppConfig';
export interface Wallet {
  address: string;
  chainInfo: BriefChainInfo;
}
type Store = {
  chainList: BriefChainInfo[];
  chainCurrent: BriefChainInfo;
  chainCoinListNative: Coin[];
  chainCoinListRemote: Coin[];
  chainFaucetCoin: Coin;
  chainFaucetAmount: string;
  chainFaucetLoading: boolean;
};

export const chainStore = proxy<Store>({
  chainList: AppConfig.chains,
  chainCurrent: {} as BriefChainInfo,
  chainCoinListNative: [] as Coin[],
  chainCoinListRemote: [] as Coin[],
  chainFaucetCoin: {} as Coin,
  chainFaucetAmount: '',
  chainFaucetLoading: false,
});

export const useChainStore = () => {
  return useSnapshot(chainStore);
};

export const setChainCurrent = (val: BriefChainInfo) => {
  chainStore.chainCurrent = val;
};

export const getChainMap = () => {
  const chainList = chainStore.chainList;
  const map: Record<string, BriefChainInfo> = {};
  chainList.forEach((chain) => {
    map[chain.chainID] = chain;
  });
  return map;
};

export const fetchChainCoinList = async (
  restUrl: string,
  type: 'Native' | 'Remote'
) => {
  const res = await fetchAtomicSwapList(restUrl);
  chainStore[`chainCoinList${type}`] = res;
};

export const rechargeCoins = async (
  wallets: Wallet[],
  selectedChain: BriefChainInfo
) => {
  const currentWallets = wallets.find((item) => {
    return item.chainInfo?.chainID === selectedChain?.chainID;
  });
  chainStore.chainFaucetLoading = true
  const url = new URL(selectedChain.rpcUrl);
  await chargeCoins(
    url.hostname,
    chainStore.chainFaucetCoin?.denom,
    currentWallets?.address as string,
    chainStore.chainFaucetAmount
  );
  chainStore.chainFaucetLoading = false
  
};

import type { IAsset, ICoin } from './asset';

export interface ILiquidityPool {
  poolId: string;
  creator: string;
  assets: IAsset[];
  supply: ICoin;
  pool_price: string;
  status: 'POOL_STATUS_READY' | 'POOL_STATUS_INIT';
  encounterPartyPort: string;
  encounterPartyChannel: string;
}
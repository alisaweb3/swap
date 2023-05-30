// PoolDetailsList.tsx
import React, { useEffect, useState } from 'react';
import { ILiquidityPool } from '@/shared/types/liquidity';
import useWalletStore, { Wallet, Balance } from '@/store/wallet';
import { AppConfig } from '@/utils/AppConfig';
import PoolModal from './PoolModal';
import PoolDetails from './PoolDetails';
import toast from 'react-hot-toast';
import {
  MsgCreatePoolRequest,
  MsgSingleAssetDepositRequest,
} from '@/codegen/ibc/applications/interchain_swap/v1/tx';
import Long from 'long';
import { StdFee } from '@cosmjs/stargate';
import { usePoolStore, poolStore, getPoolList } from '@/store/pool';
import {
  MdList,
  MdSearch,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdAddToQueue,
} from 'react-icons/md';

interface PoolDetailsListProps {
}

const PoolDetailsList: React.FC<PoolDetailsListProps> = () => {
  const {
    setLoading,
    wallets,
    suggestChain,
    getClient,
    selectedChain,
    balanceList,
    getBalance,
    setBalance,
  } = useWalletStore();
  const { poolList } = usePoolStore();
  const [allBalances, setAllBalances] = useState<Balance[]>([]);
  const fetchBalances = async () => {
    const balance = await getBalance(true);
    setAllBalances(balance);
    setBalance(balance);

    const balanceItem = balance?.filter((item) => {
      if (item.id === selectedChain.chainID) {
        return item;
      }
    });
    const defalutFirst = balanceItem?.[0]?.balances?.filter((item) => {
      if (!item.denom.includes('pool')) {
        return item;
      }
    })?.[0]?.denom;
    selectCoin('first', defalutFirst);

    console.log(allBalances, 'allBalancesallBalancesallBalances', balanceList);
  };
  useEffect(() => {
    if (selectedChain.chainID) {
      setPoolPair({
        first: { denom: '', amount: '0', weight: '50', chain: '' },
        second: { denom: '', amount: '0', weight: '50', chain: '' },
      });
      fetchBalances();
      getRemoteChainList();
    }
  }, [selectedChain]);
  const [poolPair, setPoolPair] = useState({
    first: { denom: '', amount: '0', weight: '50', chain: '' },
    second: { denom: '', amount: '0', weight: '50', chain: '' },
  });
  const getRemoteChainList = () => {
    const remote = AppConfig.chains.find((chain) => {
      if (chain.chainID === selectedChain.chainID) {
        return chain;
      }
    })?.counterpartis;
  };
 
  const selectCoin = (side, value) => {
    setPoolPair({
      ...poolPair,
      [side]: {
        denom: value || '',
        amount: poolPair?.[side]?.amount,
        weight: poolPair?.[side]?.weight,
        chain: poolPair?.[side]?.chain,
      },
    });
  };



  // old createPool
  const onCreatePool = async () => {
    setLoading(true);
    const wallet = wallets.find(
      (wallet) => wallet.chainInfo.chainID === selectedChain.chainID
    );
    if (wallet === undefined) {
      toast.error("you don't have wallet about this chain");
    }
    const timeoutTimeStamp = Long.fromNumber(
      (Date.now() + 60 * 1000) * 1000000
    ); // 1 hour from now

    try {
      const client = await getClient(wallet!.chainInfo);

      const createPoolMsg: MsgCreatePoolRequest = {
        sourcePort: 'interchainswap',
        sourceChannel: 'channel-0',
        sender: wallet!.address,
        tokens: [
          { denom: poolPair.first.denom, amount: poolPair.first.amount },
          { denom: poolPair.second.denom, amount: poolPair.second.amount },
        ],
        decimals: [18, 18],
        weight: `${poolPair.first?.weight}:${poolPair.second?.weight}`,
        timeoutHeight: {
          revisionHeight: Long.fromInt(10),
          revisionNumber: Long.fromInt(10000000000),
        },
        timeoutTimeStamp: timeoutTimeStamp,
      };

      const msg = {
        typeUrl: '/ibc.applications.interchain_swap.v1.MsgCreatePoolRequest',
        value: createPoolMsg,
      };
      console.log(client);

      const fee: StdFee = {
        amount: [{ denom: wallet!.chainInfo.denom, amount: '0.01' }],
        gas: '200000',
      };
      console.log(createPoolMsg, 'createPoolMsg');
      console.log(fee, 'fee');
      console.log(wallet, 'wallet');
      const data = await client!.signWithEthermint(
        wallet!.address,
        [msg],
        wallet!.chainInfo,
        fee,
        'test'
      );
      console.log('Signed data', data);
      if (data !== undefined) {
        const txHash = await client!.broadCastTx(data);
        console.log('TxHash:', txHash);
      } else {
        console.log('there are problem in encoding');
      }
    } catch (error) {
      toast.error(error);

      console.log('error', error);
    }
    setLoading(false);
  };

  const onEnablePool = async (pool: ILiquidityPool) => {
    if (selectedChain.chainID === pool.creatorChainId) {
      toast.error('Please select counter party chain');
      return;
    }
    //setLoading(true)
    await suggestChain(selectedChain);

    const wallet = wallets.find(
      (wallet) => wallet.chainInfo.chainID === selectedChain.chainID
    );

    const timeoutTimeStamp = Long.fromNumber(
      (Date.now() + 60 * 1000) * 1000000
    ); // 1 hour from now
    try {
      const client = await getClient(wallet!.chainInfo);
      console.log(
        'here',
        pool.assets.find((item) => item.side == 'NATIVE')!.balance
      );

      const singleDepositMsg: MsgSingleAssetDepositRequest = {
        poolId: pool.poolId,
        sender: wallet!.address,
        token: pool.assets.find((item) => item.side == 'NATIVE')!.balance,
        timeoutHeight: {
          revisionHeight: Long.fromInt(10),
          revisionNumber: Long.fromInt(10000000000),
        },
        timeoutTimeStamp: timeoutTimeStamp,
      };

      const msg = {
        typeUrl:
          '/ibc.applications.interchain_swap.v1.MsgSingleAssetDepositRequest',
        value: singleDepositMsg,
      };

      const fee: StdFee = {
        amount: [{ denom: wallet!.chainInfo.denom, amount: '0.01' }],
        gas: '200000',
      };
      const data = await client!.signWithEthermint(
        wallet!.address,
        [msg],
        wallet!.chainInfo,
        fee,
        'test'
      );
      if (data !== undefined) {
        const txHash = await client!.broadCastTx(data);
        console.log('TxHash:', txHash);
      } else {
        console.log('there are problem in encoding');
      }
    } catch (error) {
      console.log('error', error);
    }
    setLoading(false);
  };
  return (
    <div>
      {/* image-header */}
      <div className="relative mt-10 h-[138px] flex items-center justify-center rounded-lg overflow-hidden bg-[url(/assets/images/maskbg.png)] bg-cover">
        <div className="text-5xl font-bold text-white">
          Scalable, Bridgeless
        </div>
      </div>

      <div className=" mt-5 overflow-x-auto bg-base-100 p-8 rounded-lg min-h-[400px] mb-10">
        {/* search filter */}
        <div className="flex w-full mb-5">
          <div className="relative flex-1 w-full">
            <MdSearch className="absolute top-1/2 -translate-y-[50%] left-2 text-2xl text-gray-300 dark:text-gray-400" />
            <input
              className="flex-1 w-full pl-10 input input-bordered"
              placeholder="Search token name"
              onChange={() => {}}
            />
          </div>

          <div className="ml-4">
            <button className="mr-2 text-2xl btn">
              <MdList />
            </button>

            <label
              htmlFor="modal-create-pool"
              className="text-2xl btn btn-primary"
            >
              <MdAddToQueue />
            </label>
          </div>
        </div>
        {/* list */}
        <div className="mb-5 overflow-x-auto border rounded-lg dark:border-none">
          <table className="table w-full">
            {/* head */}
            <thead>
              <tr>
                <th>Pair / Chain</th>
                <th>Liquidity</th>
                <th>Pool Price</th>
                <th>Amount</th>
                <th>Channel</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {poolList.map((pool: any, index) => (
                <PoolDetails
                  keyIndex={index}
                  key={index}
                  pool={pool}
                  onEnablePool={onEnablePool}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end !hidden">
          <div>
            <span className="mr-2">Rows per page: </span>
            <select
              value="10"
              className="max-w-xs select select-bordered select-sm"
              onChange={() => {}}
            >
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
          </div>
          <div className="mx-4">
            {'1-10'} of {'299'}
          </div>
          <div className="px-1 py-1 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
            <MdKeyboardArrowLeft className="text-2xl" />
          </div>
          <div className="px-1 py-1 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
            <MdKeyboardArrowRight className="text-2xl" />
          </div>
        </div>
      </div>

      <PoolModal />
    </div>
  );
};

export default PoolDetailsList;

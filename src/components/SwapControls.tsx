import React, { useState } from 'react';
import { CoinInput } from '@/components/CoinInput';
import { Coin, Coin } from '@cosmjs/stargate';
import {
  MdKeyboardArrowDown,
  MdOutlineSettings,
  MdOutlineClose,
} from 'react-icons/md';
import Image from 'next/image';
import SwapOrder from './SwapOrder';
import TabItem from './TabItem';
import { MsgSwapRequest } from '@/codegen/ibc/applications/interchain_swap/v1/tx';
import { MakeSwapMsg } from '@/codegen/ibc/applications/atomic_swap/v1/tx';
import { Height } from '@/codegen/ibc/core/client/v1/client';
import Long from 'long';
import { Coin } from '@/codegen/cosmos/base/v1beta1/coin';

interface SwapControlsProps {
  swapPair: { first: Coin; second: Coin };
  setSwapPair: (value: { first: Coin; second: Coin }) => void;
  updateFirstCoin: (value: string) => void;
  updateSecondCoin: (value: string) => void;
  onSwap: (direction: '->' | '<-') => Promise<void>;
}

const SwapControls: React.FC<SwapControlsProps> = ({
  swapPair,
  setSwapPair,
  updateFirstCoin,
  updateSecondCoin,
  onSwap,
}) => {
  const [tab, setTab] = useState('swap');

  const switchSwap = () => {};

  return (
    <div className="p-5 bg-base-100 w-[500px] rounded-lg mx-auto mt-10 shadow mb-20">
      <div className="flex items-center justify-between mb-5">
        <div className="inline-flex items-center bg-gray-100 rounded-full tabs dark:bg-gray-700">
          <TabItem tab={tab} setTab={setTab} title="Swap" value="swap" />
          <TabItem tab={tab} setTab={setTab} title="Limit" value="limit" />
          <TabItem tab={tab} setTab={setTab} title="Order" value="order" />
        </div>

        <label htmlFor="modal-swap-setting">
          <MdOutlineSettings className="text-xl cursor-pointer" />
        </label>
      </div>

      {tab === 'swap' || tab === 'limit' ? (
        <div>
          <div className="p-5 rounded-lg bg-base-200">
            <div className="flex items-center mb-2">
              <div className="flex-1">Sell</div>
              <div className="mr-2">Balance: 99999</div>
              <div className="font-semibold">Max</div>
            </div>

            <div className="flex items-center mb-2">
              <div className="bg-base-100  mr-4 px-2 rounded-full h-10 w-[160px] flex items-center justify-center">
                <Image
                  alt="logo"
                  src="/assets/images/Side.png"
                  width={20}
                  height={20}
                  className="w-7 h-7"
                />
                <div className="flex-1 font-semibold text-center capitalize">
                  {swapPair.first?.denom}
                </div>

                <MdKeyboardArrowDown className="text-base" />
              </div>
              <CoinInput
                coin={swapPair.first}
                placeholder="Amount"
                onChange={updateFirstCoin}
              />
            </div>

            <div className="flex items-center text-gray-500 dark:text-gray-400 hidden">
              <div className="flex-1">Side Hub</div>
              <div>~$9999</div>
            </div>
          </div>
          <div className="flex items-center justify-center -mt-5 -mb-5">
            <Image
              alt="switch"
              src="/assets/images/switch.png"
              width="20"
              height="20"
              className="bg-white rounded-full shadow w-14 h-14 "
              onClick={() => switchSwap()}
            />
          </div>
          <div className="p-5 rounded-lg bg-base-200">
            <div className="flex items-center mb-2">
              <div className="flex-1">Buy</div>
              <div className="mr-2">Balance: 99999</div>
              <div className="font-semibold">Max</div>
            </div>

            <div className="flex items-center mb-2">
              <div className="bg-base-100  mr-4 px-2 rounded-full h-10 w-[160px] flex items-center justify-center">
                <Image
                  alt="logo"
                  src="/assets/images/Side.png"
                  width={20}
                  height={20}
                  className="w-7 h-7"
                />
                <div className="flex-1 font-semibold text-center capitalize">
                  {swapPair.second?.denom}
                </div>

                <MdKeyboardArrowDown className="text-base" />
              </div>
              <CoinInput
                coin={swapPair.second}
                placeholder="Amount"
                onChange={updateSecondCoin}
              />
            </div>

            <div className="flex items-center text-gray-500 dark:text-gray-400 hidden">
              <div className="flex-1">Side Hub</div>
              <div>~$9999</div>
            </div>
          </div>

          {tab === 'swap' ? (
            <button
              className="w-full mt-6 text-lg capitalize btn btn-primary"
              onClick={() => onSwap('->')}
            >
              Swap
            </button>
          ) : null}

          {/* <button
        className="flex-grow mt-4 text-2xl font-semibold rounded-full md:mt-0 btn btn-primary btn-lg hover:text-base-100"
        onClick={() => onSwap('->')}
      >
        {'SWAP ->'}
      </button>

      <button
        className="flex-grow mt-4 text-2xl font-semibold rounded-full md:mt-0 btn btn-primary btn-lg hover:text-base-100"
        onClick={() => onSwap('<-')}
      >
        {'SWAP <-'}
      </button> */}

          {tab === 'limit' ? (
            <div>
              <div className="p-5 mt-4 rounded-lg bg-base-200">
                <div className="flex items-center justify-between mb-2 text-sm">
                  <div>Sell ATOM at rate</div>
                  <div className="font-semibold hidden">Set to maket</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-semibold">10.000</div>
                  <div className="bg-base-100 px-2 rounded-full h-10 w-[160px] flex items-center justify-center hidden">
                    <Image
                      alt="logo"
                      src="/assets/images/Side.png"
                      width={20}
                      height={20}
                      className="w-7 h-7"
                    />
                    <div className="flex-1 font-semibold text-center capitalize">
                      {swapPair.second?.denom}
                    </div>

                    <MdKeyboardArrowDown className="text-base" />
                  </div>
                </div>
              </div>

              <div className="flex items-center mt-4">
                <div className="px-5 pt-3 pb-2 mr-4 rounded-lg bg-base-200">
                  <div className="mb-1 text-sm">Taker Address (optional)</div>
                  <input
                    className="h-10 text-xl bg-transparent focus-within:outline-none placeholder:text-sm placeholder:font-normal"
                    placeholder="NONE"
                  />
                </div>
                <div className="px-5 pt-3 pb-2 rounded-lg bg-base-200">
                  <div className="mb-1 text-sm text-right">Expires in</div>
                  <div className="flex items-center">
                    <input
                      className="w-[80px] focus-within:outline-none bg-transparent h-10 text-xl placeholder:text-sm placeholder:font-normal"
                      placeholder="12"
                    />
                    <div className="flex-1 px-4 text-base rounded-full bg-base-100">
                      Hour
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 text-lg capitalize btn btn-primary">
                Make Order
              </button>
            </div>
          ) : null}

          <div className="pb-3 mt-5 border rounded-lg dark:border-gray-700">
            <div className="px-4 py-2 font-semibold border-b dark:border-gray-700">
              Details
            </div>
            <div className="flex items-center justify-between px-4 pt-3 pb-1 text-sm">
              <div>You will receive</div>
              <div>≈ 99.99 SIDE</div>
            </div>
            <div className="flex items-center justify-between px-4 pb-1 text-sm">
              <div>Minimum received after slippage (1%)</div>
              <div>≈ 99.89 SIDE</div>
            </div>
            <div className="flex items-center justify-between px-4 pb-1 text-sm">
              <div>Price impact</div>
              <div>{`< 0.0002%`}</div>
            </div>
            <div className="flex items-center justify-between px-4 pb-1 text-sm">
              <div>Swap fees</div>
              <div>≈ $ 0.1739</div>
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'order' ? <SwapOrder /> : null}

      <input type="checkbox" id="modal-swap-setting" className="modal-toggle" />
      <label htmlFor="modal-swap-setting" className="cursor-pointer modal">
        <label htmlFor="" className="relative p-4 rounded-lg modal-box">
          <div>
            <div className="flex items-center justify-between">
              <div className="font-semibold">Transaction settings</div>
              <label htmlFor="modal-swap-setting" className="cursor-pointer">
                <MdOutlineClose className="text-2xl text-gray-500 dark:text-gray-400" />
              </label>
            </div>
            <div className="mt-3 mb-3 text-sm text-gray-500 dark:text-gray-400">
              Slippage tolerance
            </div>
            <div className="grid grid-cols-4 gap-4 mb-2">
              <div className="py-1 text-center bg-gray-100 rounded dark:bg-gray-600">
                1%
              </div>
              <div className="py-1 text-center bg-gray-100 rounded dark:bg-gray-600">
                3%
              </div>
              <div className="py-1 text-center bg-gray-100 rounded dark:bg-gray-600">
                5%
              </div>
              <input
                className="py-1 text-center bg-gray-100 rounded dark:bg-gray-600"
                type="number"
                placeholder="2.5%"
              />
            </div>
          </div>
        </label>
      </label>
    </div>
  );
};

export default SwapControls;

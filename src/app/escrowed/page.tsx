'use client';

import { fetchAllChannels, useEscrowedStore } from '@/store/escrowed';
import useWalletStore from '@/store/wallet';
import { useEffect } from 'react';

export default function Escrowed() {
  const { escrowedAddressList } = useEscrowedStore();
  const { selectedChain } = useWalletStore();

  useEffect(() => {
    if (selectedChain?.chainID) {
      fetchAllChannels(selectedChain?.restUrl);
    }
  }, [selectedChain]);

  return (
    <div className="bg-base-100 container mx-auto mt-10 rounded-lg px-5 pt-5 pb-10">
      <div className="mb-5 flex items-center">
        <div className="text-xl font-semibold flex-1">Escrowed Accounts</div>
        <div></div>
      </div>
      <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
        <table className="table  w-full">
          <thead>
            <tr>
              <th>Address</th>
              <th>Channel_id/Port_id</th>
              <th>Token</th>
            </tr>
          </thead>
          <tbody>
            {escrowedAddressList?.map((item, index) => (
              <tr key={index}>
                <td width="40%">{item?.escrowedAddress}</td>
                <td width="30%">
                  {item?.channel?.channel_id} / {item?.channel?.port_id}
                </td>
                <td>{JSON.stringify(item?.balances)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

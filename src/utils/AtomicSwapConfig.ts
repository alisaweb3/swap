export const AtomicSwapConfig = [
  {
    chain: 'sidechain-1',
    chainID: 'sidehub_1818-1',
    endpoint: 'http://45.63.52.25:1317',

    counterparties: [
      {
        name: 'B chain',
        channel_id: 'channel-1',
        endpoint: 'http://66.42.41.25:1317',
      },
      {
        name: 'C chain',
        channel_id: 'channel-3',
        endpoint: 'https://b',
      },
    ],
  },
  {
    chain: 'sidechain-2',
    chainID: 'alice_1819-1',
    endpoint: 'http://66.42.41.25:1317',
    atomic_swap: {
      counterparties: [
        {
          name: 'A chain',
          channel_id: 'channel-1',
          endpoint: 'http://45.63.52.25:1317',
        },
        {
          name: 'D chain',
          channel_id: 'channel-2',
          endpoint: 'https://b',
        },
      ],
    },
  },
];

export const AppConfig = {
  site_name: 'Sidchain',
  title: 'IBCSWAP',
  description: 'Implement inter-chain swap functionality',
  locale: 'en',
  chains: [
    {
      chainID: 'sidehub_1818-1',
      name: 'sidechain-1',
      prefix: 'side',
      rpcUrl: 'http://45.63.52.25:26657',
      restUrl: 'http://45.63.52.25:1317',
      denom: 'aside',
      counterpartis: ["alice_1819-1", "others"]
    },
    {
      chainID: 'alice_1819-1',
      name: 'sidechain-2',
      prefix: 'side',
      rpcUrl: 'http://66.42.41.25:26657',
      restUrl: 'http://66.42.41.25:1317',
      denom: 'bside',
      counterpartis: [{
        chainId: "sidehub_1818-1",
        channelId: "channel-1"
      }, ]
    },
  ],
};

import axios from 'axios';
import type ResponseMessage from '@/http/types/ResponseMessage';

interface FetchChannelsResponse extends ResponseMessage {
  channels: [];
}

// there are method to check channel and port from blockchain directly
// you can find port and channel
const fetchChannels = async (restUrl: string) => {
  const { data } = await axios.get<FetchChannelsResponse>(
    `${restUrl}/ibc/core/channel/v1/channels`
  );

  return data.channels;
};
export default fetchChannels;

export const fetchEscrowAddress = async (
  restUrl: string,
  channelId: string,
  portId: string
) => {
  const { data } = await axios.get(
    `${restUrl}/ibc/apps/atomicswap/v1/channels/${channelId}/ports/${portId}/escrow_address`
  );

  return data;
};
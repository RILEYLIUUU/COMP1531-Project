import { getData, setData } from './dataStore';
import { tokenValidator } from './dm';
import HTTPError from 'http-errors';

/**
  * <Creates a new channel with the gvien name which can be either public or private and the user automatically joins it.>
  *
  * @param {String} token - parameter used to identify the user and whether their session is valid.
  * @param {string} name - name of the channel that is going to be created
  * @param {Boolean} isPublic - determines whether the channel will be public or private
  * ...
  *
  * @returns {integer} - unique channel Id created if the name lenght is between 1 and 20 characters and if token is valid.
*/

export function channelsCreateV1(token: string, name: string, isPublic: boolean) {
  const data = getData();
  // checks that userId is valid
  /* if (validauthUserId === false) {
    return {error: 'error'};
  } */
  // Checks that name is between 1 and 20 characters
  if (name.length < 1 || name.length > 20) {
    throw HTTPError(400, 'name is not between 1 & 20 characters');
  }
  // Checks if token is valid
  if (!tokenValidator(token)) { throw HTTPError(403, 'invalid token'); }

  const creator = data.users.find(user => user.sessions.includes(token));
  const channel = {
    name: name,
    channelId: data.channels.length + 1,
    isPublic: isPublic,
    ownerMembers: [creator.uId],
    allMembers: [creator.uId],
    messagesId: [],
    isActive: false,
    standupMessage: [],
    timeFinish: null,
  };

  data.channels.push(channel);

  setData(data);
  const channelId = channel.channelId;
  return { channelId };
}

/**
 *  < channelsListV1 provides an array of all channels (and their associated details)
 *  that the authorised user is part of.>
 *
 * @param {number} token
 * ...
 *
 * @returns {channels: [{ channelId, name }]}
 */

export function channelsListV1(token: string) {
  // Fetch data from dataStore
  const data = getData();
  // Check whether token is valid
  if (!tokenValidator(token)) {
    throw HTTPError(403, 'invalid token');
  }
  const user = data.users.find(user => user.sessions.includes(token));
  // Create an emplty array called channelList for later use
  const channelList = [];
  const authUserId = user.uId;
  // Check if the channel member include authUserId
  // If yes, put the channel details into the empty channelList arry
  for (const channel of data.channels) {
    if (channel.allMembers.includes(authUserId)) {
      channelList.push({
        channelId: channel.channelId,
        name: channel.name,
      });
    }
  }

  // Return the fulffiled channelList array
  return {
    channels: channelList
  };
}

/**
 * < Provides an array of all channels,
 * including private channels (and their associated details>
 *
 * @param {number} token
 * ...
  *
 * @returns {channels: [{ channelId, name }]}
 */
export function channelsListAllV1(token: string) {
  // Fetch data from data store
  const data = getData();

  // Check whether token is valid
  if (!tokenValidator(token)) { throw HTTPError(403, 'invalid token'); }
  // Output all details of of the channels stored in the data
  const newArray = Object.values(data.channels).map((channel) => {
    return {
      channelId: channel.channelId,
      name: channel.name,
    };
  }
  );

  return {
    channels: newArray
  };
}

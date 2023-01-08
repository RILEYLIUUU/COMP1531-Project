import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
//= ==================HELP FUNCTION ==================================================================

// Get current time in seconds
const getTimeStamp = () => Math.floor(Date.now() / 1000);

// From a token find users uId else return -1
function getUID(token: string): number {
  const data = getData();
  if (!data.users.find(x => x.sessions.includes(token))) {
    return -1;
  }
  return data.users.find(x => x.sessions.includes(token)).uId;
}

//= ==================================================================================================

/**
 *
 * < standupStart:Starts a standup period where all messages sent into the the standup will be buffered
  and sent together at the end of the standup period.
*
* @param {string} token - jwt token of user session creating the standup
* @param {number} channelId -  id of channel where standup is created in
* @param {number} length - length in seconds of standup period
*
* @returns {timeFinish} -when no exceptions occur
*/

export function standupStart(token: string, channelId: number, length: number) {
  const data = getData();
  const channelIndex = data.channels.findIndex(x => x.channelId === channelId);

  // Error 1: Invalid Message Id given
  if (channelIndex === -1) {
    throw HTTPError(400, 'Invalid Channel Id');
  }

  // Error2: length is a negative number
  if (length < 0) {
    throw HTTPError(400, 'length is a negative integer');
  }

  // Error 3: invalid token
  const userId = getUID(token);
  if (userId === -1) {
    throw HTTPError(403, 'Invalid session token');
  }

  // Error4: user do not have permission to send message
  if (!data.channels[channelIndex].allMembers.includes(userId)) {
    throw HTTPError(403, 'User Not In Channel');
  }

  // Error 5: an active standup is currently running in the channel
  if (data.channels[channelIndex].isActive === true) {
    throw HTTPError(400, 'an active standup is currently running in the channel');
  }

  const timeFinish = getTimeStamp() + length;

  // set up IsActive and time finshed in Channel
  data.channels[channelIndex].isActive = true;
  data.channels[channelIndex].timeFinish = timeFinish;
  const messageId = ++data.messageCreationCounter * 100;
  setData(data);

  setTimeout((channelId, channelIndex, userId, messageId) => {
    const data = getData();

    data.channels[channelIndex].isActive = false;
    data.channels[channelIndex].timeFinish = 0;
    
  
    const messageBlock = data.channels[channelIndex].standupMessage.join('\n');

    // Stores message data
    const newMessage = {
      messageId: messageId,
      uId: userId,
      channelId: channelId,
      message: messageBlock,
      timeSent: getTimeStamp(),
      reacts: [],
      isPinned: false,
    };
    if (messageBlock.length !== 0) {
      data.messages.push(newMessage)
      data.channels[channelIndex].messagesId.push(newMessage.messageId)
    };
    data.channels[channelIndex].standupMessage.splice(0);
    setData(data);
  }, length * 1000, channelId, channelIndex, userId, messageId);

  return {
    timeFinish: timeFinish
  };
}

/**
 *
 * < standupActive：For a given channel, return whether a standup is active in it, and what time the standup finishes.
  If no standup is active, then time_finish returns None

* @param {string} token - jwt token of user session creating the standup
* @param {number} channelId - a session for a user obtained after login/register

* @returns {isActive, timeFinish} - when no exceptions occur
*/

export function standupActive(token: string, channelId: number) {
  const data = getData();
  const channelIndex = data.channels.findIndex(x => x.channelId === channelId);
  // Error 1: Invalid channelId
  if (channelIndex === -1) {
    throw HTTPError(400, 'Invalid Channel Id');
  }

  // Error 2: invalid token
  const userId = getUID(token);
  if (userId === -1) {
    throw HTTPError(403, 'Invalid session token');
  }

  // Error 3: user do not have permission to send message
  if (!data.channels[channelIndex].allMembers.includes(userId)) {
    throw HTTPError(403, 'User Not In Channel');
  }

  // Find the target channel
  const targetChannel = data.channels[channelIndex];

  return {
    isActive: targetChannel.isActive,
    timeFinish: targetChannel.timeFinish
  };
}

/**
 *
 * < standupSend :Sending a message to get buffered in the standup queue, if a standup is currently active
 *
 * @param {string} token - jwt token of user session creating the standup
 * @param {number} channelId -  id of channel where standup is created in
 * @param {string0} message -  id of channel where standup is created in

*
* @returns {}when no exceptions occur
*/

export function standupSend(token: string, channelId: number, message: string) {
  const data = getData();
  const channelIndex = data.channels.findIndex(x => x.channelId === channelId);

  // Error 1: Invalid channnel Id given
  if (channelIndex === -1) {
    throw HTTPError(400, 'Invalid Channel Id');
  }

  // Error 2: length of message is over 1000 or less than 1 characters
  if (message.length > 1000) {
    throw HTTPError(400, 'length of message is over 1000 characters');
  }

  if (message.length < 1) {
    throw HTTPError(400, 'length of message is less 1 characters');
  }

  // Error 3: invalid token
  const userId = getUID(token);
  if (userId === -1) {
    throw HTTPError(403, 'Invalid session token');
  }

  // Error 4: user do not have permission to send message
  if (!data.channels[channelIndex].allMembers.includes(userId)) {
    throw HTTPError(403, 'User Not In Channel');
  }

  // Get the target channel
  const targetChannel = data.channels[channelIndex];

  // Error 5: an active standup is not currently running in the channel
  if (targetChannel.isActive !== true) {
    throw HTTPError(400, 'an active standup is not currently running in the channel');
  }

  // using Token to find the handstre in users
  const handleStr = data.users.find(user => user.sessions.includes(token)).handleStr;

  // map the structure of the packaged message is like this:
  const standupMessage = `${handleStr}: ${message}`;
  targetChannel.standupMessage.push(standupMessage);
  setData(data);
  return {};
}

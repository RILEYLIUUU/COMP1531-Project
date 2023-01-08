import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import { globalOwnerValidator } from './admin';

// =============================== HELPER FUNCTIONS ================================ //
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

// ================================================================================= //

/**
 *
 * < messageSendV1 is sends a message from authorised user to a channel specified
 * by channelId. >
 *
 * @param {string} token - a session for a user obtained after login/register
 * @param {number} channelId - an identifying number for channel
 * @param {string} message - the string which the user wants to send to channel
 *
 * @returns {number} - when successful returns the identifying number for message
 */
export function messageSendV1(token: string, channelId: number, message: string) {
  const data = getData();
  const channelIndex = data.channels.findIndex(x => x.channelId === channelId);

  if (channelIndex === -1) {
    throw HTTPError(400, 'Invalid Channel Id');
  }

  if (message.length < 1) {
    throw HTTPError(400, 'Message Too Short');
  }

  if (message.length > 1000) {
    throw HTTPError(400, 'Message Too Long');
  }

  const userId = getUID(token);
  if (userId === -1) {
    throw HTTPError(403, 'Invalid User Session');
  }
  const user = data.users.find(user => user.sessions.includes(token));
  if (!data.channels[channelIndex].allMembers.includes(userId)) {
    throw HTTPError(403, 'User Not In Channel');
  }

  const messageId = ++data.messageCreationCounter * 100;

  const newMessage = {
    messageId: messageId,
    uId: getUID(token),
    channelId: channelId,
    message: message,
    timeSent: getTimeStamp(),
    reacts: [],
    isPinned: false
  };

  data.messages.push(newMessage);
  let messageFirst20Chars = newMessage.message;
  if (messageFirst20Chars.length >= 20) {
    messageFirst20Chars = messageFirst20Chars.slice(0, 20);
  }
  const tagger = data.users.find(user => user.sessions.includes(token));
  for (const i in data.users) {
    if (newMessage.message.includes('@' + data.users[i].handleStr)) {
      const channel = data.channels.find(channel => newMessage.channelId === channel.channelId);
      const notification = {
        channelId: channel.channelId,
        dmId: -1,
        notificationMessage: tagger.handleStr + ' tagged you in ' + channel.name + ': ' + messageFirst20Chars,
      };
      data.users[i].notifications.push(notification);
    }
  }
  data.channels[channelIndex].messagesId.push(newMessage.messageId);
  setData(data);

  return {
    messageId: messageId
  };
}

/**
 *
 * < Given a message, update its text with new text.
 * If the new message is an empty string, the message is deleted. >
 *
 * @param {string} token - a session for a user obtained after login/register
 * @param {number} messageId - the numerical identifier for the targeted message
 * @param {string} message - the string which the user wants to update original with
 *
 * @returns {} - when successful returns the empty object
 */
export function messageEditV1(token: string, messageId: number, message: string) {
  const data = getData();

  if (message.length > 1000) {
    throw HTTPError(400, 'message too long');
  }

  const messageIndex = data.messages.findIndex(x => x.messageId === messageId);

  if (messageIndex === -1) {
    throw HTTPError(400, 'Invalid messageId given');
  }

  const userId = getUID(token);
  if (userId === -1) {
    throw HTTPError(403, 'Invalid session token');
  }

  // If message is in channel
  if (Object.prototype.hasOwnProperty.call(data.messages[messageIndex], 'channelId')) {
    const channelId = data.messages.find(x => x.messageId === messageId).channelId;
    const channelIndex = data.channels.findIndex(x => x.channelId === channelId);

    if (!data.channels[channelIndex].allMembers.includes(userId)) {
      throw HTTPError(400, 'User not in channel');
    }

    if (!data.channels[channelIndex].ownerMembers.includes(userId)) {
      if (data.messages[messageIndex].uId !== userId) {
        throw HTTPError(403, 'User does not have permission to edit this message');
      }
    }
  }

  // If message is in DM
  if (Object.prototype.hasOwnProperty.call(data.messages[messageIndex], 'dmId')) {
    const dmId = data.messages.find(x => x.messageId === messageId).dmId;
    const dmIndex = data.dms.findIndex(x => x.dmId === dmId);
    if (!data.dms[dmIndex].uIds.includes(userId) && data.dms[dmIndex].creator !== userId) {
      throw HTTPError(400, 'User not in dms');
    }
    if (data.messages[messageIndex].uId !== userId) {
      throw HTTPError(403, 'User does not have permission to edit this message');
    }
  }

  if (message.length < 1) {
    messageRemoveV1(token, messageId);
  } else {
    data.messages[messageIndex].message = message;
    const newMessage = data.messages[messageIndex];
    let messageFirst20Chars = newMessage.message;
    if (messageFirst20Chars.length >= 20) {
      messageFirst20Chars = messageFirst20Chars.slice(0, 20);
    }
    for (const i in data.users) {
      if (newMessage.message.includes('@' + data.users[i].handleStr)) {
        const tagger = data.users.find(user => user.sessions.includes(token));
        if (newMessage.dmId === Number) {
          const dm = data.dms.find(dm => newMessage.dmId === dm.dmId);
          const notification = {
            channelId: -1,
            dmId: dm.dmId,
            notifcationMessage: tagger.handleStr + ' tagged you in ' + dm.name + ': ' + messageFirst20Chars,
          };
          data.users[i].notifications.push(notification);
          setData(data);
        } else if (newMessage.channelId === Number) {
          const channel = data.channels.find(channel => newMessage.channelId === channel.channelId);
          const notification = {
            channelId: channel.channelId,
            dmId: -1,
            notificationMessage: tagger.handleStr + ' tagged you in ' + channel.name + ': ' + messageFirst20Chars,
          };
          data.users[i].notifications.push(notification);
          setData(data);
        }
      }
    }
    setData(data);
  }
  return {};
}

/**
 *
 * < Given the messageId for a message, this message is removed from channel/DM >
 *
 * @param {string} token - a session for a user obtained after login/register
 * @param {number} messageId - the numerical identifier for the targeted message
 *
 * @returns {} - when successful returns the empty object
 */
export function messageRemoveV1(token: string, messageId: number) {
  const data = getData();
  const messageIndex = data.messages.findIndex(x => x.messageId === messageId);

  if (messageIndex === -1) {
    throw HTTPError(400, 'Invalid messageId given');
  }

  const userId = getUID(token);
  if (userId === -1) {
    throw HTTPError(403, 'Invalid session token');
  }

  // If message is in a channel
  if (Object.prototype.hasOwnProperty.call(data.messages[messageIndex], 'channelId')) {
    const channelIndex = data.channels.findIndex(
      x => x.channelId === data.messages[messageIndex].channelId
    );

    if (!data.channels[channelIndex].allMembers.includes(userId)) {
      throw HTTPError(400, 'User not in channel');
    }

    if (!data.channels[channelIndex].ownerMembers.includes(userId)) {
      if (data.messages[messageIndex].uId !== userId && !globalOwnerValidator(userId)) {
        throw HTTPError(403, 'User does not have permission to edit this message');
      }
    }

    data.channels[channelIndex].messagesId = data.channels[channelIndex].messagesId
      .filter(x => x !== messageId);
  }

  // If message is in a DM
  if (Object.prototype.hasOwnProperty.call(data.messages[messageIndex], 'dmId')) {
    const dmIndex = data.dms.findIndex(x => x.dmId === data.messages[messageIndex].dmId);
    if (!data.dms[dmIndex].uIds.includes(userId) && data.dms[dmIndex].creator !== userId) {
      throw HTTPError(400, 'User not in dms');
    }
    if (data.messages[messageIndex].uId !== userId) {
      throw HTTPError(403, 'User does not have permission to edit this message');
    }
    data.dms[dmIndex].messagesId = data.dms[dmIndex].messagesId.filter(x => x !== messageId);
  }

  data.messages = data.messages.filter(
    function(x) {
      return x.messageId !== messageId;
    }
  );
  setData(data);
  return {};
}

/**
 *
 * < messageSendDmv1 sends a message from authorised user to a channel specified
 * by dmId. >
 *
 * @param {string} token - a session for a user obtained after login/register
 * @param {number} dmId - an identifying number for dm
 * @param {string} message - the string which the user wants to send to channel
 *
 * @returns {number} - when successful returns the identifying number for message
 */
export function messageSendDmv1(token: string, dmId: number, message: string) {
  const data = getData();
  const dmIndex = data.dms.findIndex(x => x.dmId === dmId);

  if (dmIndex === -1) {
    throw HTTPError(400, 'Invalid dmID given');
  }

  if (message.length < 1) {
    throw HTTPError(400, 'message too short');
  }

  if (message.length > 1000) {
    throw HTTPError(400, 'message too long');
  }

  const userId = getUID(token);
  if (userId === -1) {
    throw HTTPError(403, 'Invalid session token');
  }

  if (!data.dms[dmIndex].uIds.includes(userId) && data.dms[dmIndex].creator !== userId) {
    throw HTTPError(403, 'User is not a participant in dm');
  }

  const messageId = ++data.messageCreationCounter * 100;

  const newMessage = {
    messageId: messageId,
    uId: getUID(token),
    dmId: dmId,
    message: message,
    timeSent: getTimeStamp(),
    reacts: [],
    isPinned: false
  };

  data.messages.push(newMessage);

  let messageFirst20Chars = newMessage.message;
  if (messageFirst20Chars.length >= 20) {
    messageFirst20Chars = messageFirst20Chars.slice(0, 20);
  }
  const tagger = data.users.find(user => user.sessions.includes(token));
  for (const i in data.users) {
    if (newMessage.message.includes('@' + data.users[i].handleStr)) {
      const dm = data.dms.find(dm => newMessage.dmId === dm.dmId);
      const notification = {
        channelId: -1,
        dmId: dm.dmId,
        notificationMessage: tagger.handleStr + ' tagged you in ' + dm.name + ': ' + messageFirst20Chars,
      };
      data.users[i].notifications.push(notification);
    }
  }

  data.dms[dmIndex].messagesId.push(newMessage.messageId);
  setData(data);

  return {
    messageId: newMessage.messageId
  };
}

/**

 *
 * < messageSendLater :Send a message from the authorised user to the channel specified by
    channel_id automatically at a specified time in the future.
 *
 * @param {number} channelId - a session for a user obtained after login/register
 * @param {string } message - <the message that the user wants to send>
 * @param {number} timeSent -  <the time to send the message>l
 *
 * @returns {messageId}   - when successful returns the identifying number for message
 */

export function messageSendLater(token: string, channelId: number, message: string, timeSent: number) {
  const data = getData();
  const channelIndex = data.channels.findIndex(x => x.channelId === channelId);
  
  const userId = getUID(token);
  if (userId === -1) {
    throw HTTPError(403, 'Invalid session token');
  }

  if (channelIndex === -1) {
    throw HTTPError(400, 'Invalid Channel Id');
  }

  if (timeSent < getTimeStamp()) {
    throw HTTPError(400, 'timeSent is a time in the past');
  }

  if (!data.channels[channelIndex].allMembers.includes(userId)) {
    throw HTTPError(403, 'User Not In Channel');
  }

  if (message.length < 1) {
    throw HTTPError(400, 'message too short');
  }

  if (message.length > 1000) {
    throw HTTPError(400, 'message too long');
  }



  // Error5: user do not have permission to send message


  // use setTimout function to set time to call back messageSend function after 1000*Timesent
  const timeDiff = timeSent - getTimeStamp();

  const messageId = ++data.messageCreationCounter * 100;
  setData(data);
  // In case messages have been deleted

  setTimeout((channelId, messageId, userId, message, timeSent) => {
    const data = getData();
    const newMessage = {
      messageId: messageId,
      uId: userId,
      channelId: channelId,
      message: message,
      timeSent: timeSent,
      reacts: [],
      isPinned: false,
    };
    data.messages.push(newMessage);
    data.channels[channelIndex].messagesId.push(newMessage.messageId);
    let messageFirst20Chars = newMessage.message;
    if (messageFirst20Chars.length >= 20) {
      messageFirst20Chars = messageFirst20Chars.slice(0, 20);
    }
    for (const i in data.users) {
      if (newMessage.message.includes('@' + data.users[i].handleStr)) {
        const tagger = data.users.find(user => user.sessions.includes(token));
        if (newMessage.dmId === Number) {
          const dm = data.dms.find(dm => newMessage.dmId === dm.dmId);
          const notification = {
            channelId: -1,
            dmId: dm.dmId,
            notificationMessage: tagger.handleStr + ' tagged you in ' + dm.name + ': ' + messageFirst20Chars,
          };
          data.users[i].notifications.push(notification);
          setData(data);
        } else if (newMessage.channelId === Number) {
          const channel = data.channels.find(channel => newMessage.channelId === channel.channelId);
          const notification = {
            channelId: channel.channelId,
            dmId: -1,
            notificationMessage: tagger.handleStr + ' tagged you in ' + channel.name + ': ' + messageFirst20Chars,
          };
          data.users[i].notifications.push(notification);
          setData(data);
        }
      }
    }
    setData(data);
  }, timeDiff * 1000, channelId, messageId, userId, message, timeSent);

  return {
    messageId: messageId
  };
}

/**
 *
 * < messageSendLaterdm
 *
 * @param {number} dmId - a session for a user obtained after login/register
 * @param {string } message - an identifying number for dm
 * @param {number} timeSent - the string which the user wants to send to channel
 *
 * @returns {channelId} - when successful returns the identifying number for message
 */

export function messageSendLaterdm(token: string, dmId: number, message:string, timeSent:number) {
  const data = getData();
  const dmIndex = data.dms.findIndex(x => x.dmId === dmId);

  const userId = getUID(token);
  if (userId === -1) {
    throw HTTPError(403, 'Invalid session token');
  }

  if (dmIndex === -1) {
    throw HTTPError(400, 'Invalid dmID given');
  }

  if (timeSent < getTimeStamp()) {
    throw HTTPError(400, 'timeSent is a time in the past');
  }

  // Error5: user do not have permission to send message
  if (!data.dms[dmIndex].uIds.includes(userId)) {
    throw HTTPError(403, 'User is not a participant in dm');
  }

  if (message.length < 1) {
    throw HTTPError(400, 'message too short');
  }

  if (message.length > 1000) {
    throw HTTPError(400, 'message too long');
  }




  // In case messages have been deleted
  const timeDiff = timeSent - getTimeStamp();
  const messageId = ++data.messageCreationCounter * 100;
  setData(data);

  // In case messages have been deleted
  setTimeout((dmId, messageId, userId, message, timeSent) => {
    const data = getData();
    const newMessage = {
      messageId: messageId,
      uId: userId,
      dmId: dmId,
      message: message,
      timeSent: timeSent,
      reacts: [],
      isPinned: false
    };
    data.messages.push(newMessage);
    let messageFirst20Chars = newMessage.message;
    if (messageFirst20Chars.length >= 20) {
      messageFirst20Chars = messageFirst20Chars.slice(0, 20);
    }
    for (const i in data.users) {
      if (newMessage.message.includes('@' + data.users[i].handleStr)) {
        const tagger = data.users.find(user => user.sessions.includes(token));
        if (newMessage.dmId === Number) {
          const dm = data.dms.find(dm => newMessage.dmId === dm.dmId);
          const notification = {
            channelId: -1,
            dmId: dm.dmId,
            notificationMessage: tagger.handleStr + ' tagged you in ' + dm.name + ': ' + messageFirst20Chars,
          };
          data.users[i].notifications.push(notification);
          setData(data);
        } else if (newMessage.channelId === Number) {
          const channel = data.channels.find(channel => newMessage.channelId === channel.channelId);
          const notification = {
            channelId: channel.channelId,
            dmId: -1,
            notificationMessage: tagger.handleStr + ' tagged you in ' + channel.name + ': ' + messageFirst20Chars,
          };
          data.users[i].notifications.push(notification);
          setData(data);
        }
      }
    }
    data.dms[dmIndex].messagesId.push(newMessage.messageId);
    setData(data);
  }, timeDiff * 1000, dmId, messageId, userId, message, timeSent);

  return {
    messageId: messageId
  };
}

/**
 * < Sends a new message containing the original and an optional message to a specified dm/channel >
 *

 * < Sends a new message containing the original and an optional message to a specified dm/channel >
 *
 * @param token - a session for a user obtained after login/register
 * @param ogMessageId - the numerical identifier for the targeted message
 * @param message - the string which the user wants to be added on to ogMessage
 * @param channelId - the numerical identifier for the desired channel to share to else is -1
 * @param dmId - the numerical identifier for the desired dm to share to else is -1
 * @returns {number} - when successful returns the identifying number for message
 */

export function messageShareV1(token: string, ogMessageId: number, message: string,
  channelId: number, dmId: number) {
  const data = getData();
  const messageIndex = data.messages.findIndex(x => x.messageId === ogMessageId);
  const userId = getUID(token);

  if (messageIndex === -1) {
    throw HTTPError(400, 'Invalid messageId given');
  }
  if (userId === -1) {
    throw HTTPError(403, 'Invalid session token');
  }
  if (message.length > 1000) {
    throw HTTPError(400, 'Message too long');
  }
  if (channelId === -1 && dmId === -1) {
    throw HTTPError(400, 'Only one of dmId or channelId should be -1');
  }
  if (channelId !== -1 && dmId !== -1) {
    throw HTTPError(400, 'One of dmId or channelId must be -1');
  }

  if (Object.prototype.hasOwnProperty.call(data.messages[messageIndex], 'channelId')) {
    const channelIndex = data.channels.findIndex(
      x => x.channelId === data.messages[messageIndex].channelId
    );

    if (!data.channels[channelIndex].allMembers.includes(userId)) {
      throw HTTPError(400, 'User not in channel');
    }
  }

  if (Object.prototype.hasOwnProperty.call(data.messages[messageIndex], 'dmId')) {
    const dmIndex = data.dms.findIndex(x => x.dmId === data.messages[messageIndex].dmId);
    if (!data.dms[dmIndex].uIds.includes(userId) && data.dms[dmIndex].creator !== userId) {
      throw HTTPError(400, 'User not in dms');
    }
  }

  let oldMessage = data.messages[messageIndex].message;
  if (Object.prototype.hasOwnProperty.call(data.messages[messageIndex], 'ogMessage')) {
    oldMessage += '\n\t\n\t"""\n\t' + data.messages[messageIndex].ogMessage + '\n\t"""';
  }
  const newMessageId = ++data.messageCreationCounter * 100;
  let sharedMessage;

  if (channelId !== -1) {
    const channelSendIndex = data.channels.findIndex(x => x.channelId === channelId);
    if (channelSendIndex === -1) {
      throw HTTPError(400, 'channelId is invalid');
    }
    if (!data.channels[channelSendIndex].allMembers.includes(userId)) {
      throw HTTPError(403, 'User not in this channel');
    }
    sharedMessage = {
      messageId: newMessageId,
      uId: userId,
      channelId: channelId,
      message: message,
      ogMessage: oldMessage,
      timeSent: getTimeStamp(),
      reacts: [],
      isPinned: false,
    };
    data.channels[channelSendIndex].messagesId.push(newMessageId);
  }

  if (dmId !== -1) {
    const dmSendIndex = data.dms.findIndex(x => x.dmId === dmId);
    if (dmSendIndex === -1) {
      throw HTTPError(400, 'dmId is invalid');
    }
    if (!data.dms[dmSendIndex].uIds.includes(userId) && data.dms[dmIndex].creator !== userId) {
      throw HTTPError(403, 'User is not in this dm');
    }
    sharedMessage = {
      messageId: newMessageId,
      uId: userId,
      dmId: dmId,
      message: message,
      ogMessage: oldMessage,
      timeSent: getTimeStamp(),
      reacts: [],
      isPinned: false,
    };

    data.dms[dmSendIndex].messagesId.push(newMessageId);
  }
  data.messages.push(sharedMessage);
  const newMessage = sharedMessage;
  let messageFirst20Chars = newMessage.message;
  if (messageFirst20Chars.length >= 20) {
    messageFirst20Chars = messageFirst20Chars.slice(0, 20);
  }
  for (const i in data.users) {
    if (newMessage.message.includes('@' + data.users[i].handleStr)) {
      const tagger = data.users.find(user => user.sessions.includes(token));
      if (newMessage.dmId === Number) {
        const dm = data.dms.find(dm => newMessage.dmId === dm.dmId);
        const notification = {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: tagger.handleStr + ' tagged you in ' + dm.name + ': ' + messageFirst20Chars,
        };
        data.users[i].notifications.push(notification);
        setData(data);
      } else if (newMessage.channelId === Number) {
        const channel = data.channels.find(channel => newMessage.channelId === channel.channelId);
        const notification = {
          channelId: channel.channelId,
          dmId: -1,
          notificationMessage: tagger.handleStr + ' tagged you in ' + channel.name + ': ' + messageFirst20Chars,
        };
        data.users[i].notifications.push(notification);
        setData(data);
      }
    }
  }
  setData(data);
  return {
    sharedMessageId: newMessageId
  };
}

/**
 * < Given a message within a channel or DM the authorised user is part of, adds a
 * "react" to that particular message. >
 *
=======
  };
}

/**
 * < Given a message within a channel or DM the authorised user is part of, adds a
 * "react" to that particular message. >
 *
 * @param {string} token - a session for a user obtained after login/register
 * @param {number} messageId - the numerical identifier for the targeted message
 * @param {number} reactId - the numerical identifier for the desired react
 * @returns {}
 */
export function messageReactV1(token: string, messageId: number, reactId: number) {
  const data = getData();
  const messageIndex = data.messages.findIndex(x => x.messageId === messageId);

  if (messageIndex === -1) {
    throw HTTPError(400, 'Invalid messageId given');
  }

  const userId = getUID(token);
  if (userId === -1) {
    throw HTTPError(403, 'Invalid session token');
  }

  if (reactId > 10 || reactId < 0) {
    throw HTTPError(400, 'Invalid reactId');
  }

  if (Object.prototype.hasOwnProperty.call(data.messages[messageIndex], 'channelId')) {
    const channelIndex = data.channels.findIndex(
      x => x.channelId === data.messages[messageIndex].channelId
    );

    if (!data.channels[channelIndex].allMembers.includes(userId)) {
      throw HTTPError(400, 'User not in channel');
    }
  }

  if (Object.prototype.hasOwnProperty.call(data.messages[messageIndex], 'dmId')) {
    const dmIndex = data.dms.findIndex(x => x.dmId === data.messages[messageIndex].dmId);
    if (!data.dms[dmIndex].uIds.includes(userId)) {
      throw HTTPError(400, 'User not in dms');
    }
  }

  const reactIndex = data.messages[messageIndex].reacts.findIndex(x => x.reactId === reactId);
  if (reactIndex === -1) {
    const react = {
      reactId: reactId,
      uIds: [userId],
      isThisUserReacted: false
    };
    data.messages[messageIndex].reacts.push(react);
    // if (typeof data.messages[messageIndex].dmId >= 0 /*=== 'number'*/) {
    //   const reactor = data.users.find(user => user.sessions.includes(token));
    //   const DM = data.dms.find(DM => DM.dmId === data.messages[messageIndex].dmId);
    //   const notification = {
    //     channelId: -1,
    //     dmId: DM.dmId,
    //     notificationMessage: reactor.handleStr + ' reacted to your message in ' + DM.name,
    //   };
    //   const messageSender = data.users.find(user => user.uId === data.messages[messageIndex].uId);
    //   messageSender.notifications.push(notification);
    // } 
    // else /*if (typeof data.messages[messageIndex].channelId === 'number') */{
    //   const reactor = data.users.find(user => user.sessions.includes(token));
    //   const channel = data.channels.find(channel => channel.channelId === data.messages[messageIndex].channelId);
    //   const notification = {
    //     channelId: channel.channelId,
    //     dmId: -1,
    //     notificationMessage: reactor.handleStr + ' reacted to your message in ' + channel.name,
    //   };
    //   const messageSender = data.users.find(user => user.uId === data.messages[messageIndex].uId);
    //   messageSender.notifications.push(notification);
    // }
  } else {
    if (data.messages[messageIndex].reacts[reactIndex].uIds.includes(userId)) {
      throw HTTPError(400, 'User already reacted');
    }
    data.messages[messageIndex].reacts[reactIndex].uIds.push(userId);
  }
  
  setData(data);
  return {};
}

/**
 * < Given a message within a channel or DM the authorised user is part of, removes a
 * "react" to that particular message. >
 *

 * @param {string} token - a session for a user obtained after login/register
 * @param {number} messageId - the numerical identifier for the targeted message
 * @param {number} reactId - the numerical identifier for the desired react
 * @returns {}
 */
export function messageUnreactV1(token: string, messageId: number, reactId: number) {
  const data = getData();
  const messageIndex = data.messages.findIndex(x => x.messageId === messageId);

  if (messageIndex === -1) {
    throw HTTPError(400, 'Invalid messageId given');
  }

  const userId = getUID(token);
  if (userId === -1) {
    throw HTTPError(403, 'Invalid session token');
  }

  if (reactId > 10) {
    throw HTTPError(400, 'Invalid reactId');
  }

  if (Object.prototype.hasOwnProperty.call(data.messages[messageIndex], 'channelId')) {
    const channelIndex = data.channels.findIndex(
      x => x.channelId === data.messages[messageIndex].channelId
    );

    if (!data.channels[channelIndex].allMembers.includes(userId)) {
      throw HTTPError(400, 'User not in channel');
    }
  }

  if (Object.prototype.hasOwnProperty.call(data.messages[messageIndex], 'dmId')) {
    const dmIndex = data.dms.findIndex(x => x.dmId === data.messages[messageIndex].dmId);
    if (!data.dms[dmIndex].uIds.includes(userId)) {
      throw HTTPError(400, 'User not in dms');
    }
  }
  const reactIndex = data.messages[messageIndex].reacts.findIndex(x => x.reactId === reactId);
  if (reactIndex === -1 || !data.messages[messageIndex].reacts[reactIndex].uIds.includes(userId)) {
    throw HTTPError(400, 'React is not on message');
  } else {
    data.messages[messageIndex].reacts[reactIndex].uIds = data.messages[messageIndex].reacts[reactIndex].uIds.filter(x => x !== userId);
  }
  setData(data);
  return {};
}

/**
 * < Given a message within a channel or DM, marks it as "pinned". >
 * @param {string} token - a session for a user obtained after login/register
 * @param {number} messageId - the numerical identifier for the targeted message
 * @returns {}
 */
export function messagePinV1(token: string, messageId: number) {
  const data = getData();
  const messageIndex = data.messages.findIndex(x => x.messageId === messageId);

  if (messageIndex === -1) {
    throw HTTPError(400, 'Invalid messageId given');
  }

  const userId = getUID(token);
  if (userId === -1) {
    throw HTTPError(403, 'Invalid session token');
  }
  if (Object.prototype.hasOwnProperty.call(data.messages[messageIndex], 'channelId')) {
    const channelIndex = data.channels.findIndex(
      x => x.channelId === data.messages[messageIndex].channelId
    );

    if (!data.channels[channelIndex].allMembers.includes(userId)) {
      throw HTTPError(400, 'User not in channel');
    }

    if (!data.channels[channelIndex].ownerMembers.includes(userId)) {
      throw HTTPError(403, 'User is not owner of channel');
    }
  }

  if (Object.prototype.hasOwnProperty.call(data.messages[messageIndex], 'dmId')) {
    const dmIndex = data.dms.findIndex(x => x.dmId === data.messages[messageIndex].dmId);

    if (!data.dms[dmIndex].uIds.includes(userId)) {
      throw HTTPError(400, 'User not in dms');
    }

    if (!data.dms[dmIndex].creator === userId) {
      throw HTTPError(403, 'User is not owner of dm');
    }
  }

  if (data.messages[messageIndex].isPinned === true) {
    throw HTTPError(400, 'Already pinned');
  }

  data.messages[messageIndex].isPinned = true;

  setData(data);
  return {};
}

/**
 * < Given a message within a channel or DM, removes its mark as "pinned". >
 * @param {string} token - a session for a user obtained after login/register
 * @param {number} messageId - the numerical identifier for the targeted message
 * @returns {}
 */
export function messageUnpinV1(token: string, messageId: number) {
  const data = getData();
  const messageIndex = data.messages.findIndex(x => x.messageId === messageId);

  if (messageIndex === -1) {
    throw HTTPError(400, 'Invalid messageId given');
  }

  const userId = getUID(token);
  if (userId === -1) {
    throw HTTPError(403, 'Invalid session token');
  }

  if (Object.prototype.hasOwnProperty.call(data.messages[messageIndex], 'channelId')) {
    const channelIndex = data.channels.findIndex(
      x => x.channelId === data.messages[messageIndex].channelId
    );

    if (!data.channels[channelIndex].allMembers.includes(userId)) {
      throw HTTPError(400, 'User not in channel');
    }

    if (!data.channels[channelIndex].ownerMembers.includes(userId)) {
      throw HTTPError(403, 'User is not owner of channel');
    }
  }

  if (Object.prototype.hasOwnProperty.call(data.messages[messageIndex], 'dmId')) {
    const dmIndex = data.dms.findIndex(x => x.dmId === data.messages[messageIndex].dmId);

    if (!data.dms[dmIndex].uIds.includes(userId)) {
      throw HTTPError(400, 'User not in dms');
    }

    if (!data.dms[dmIndex].creator === userId) {
      throw HTTPError(403, 'User is not owner of dm');
    }
  }

  if (data.messages[messageIndex].isPinned === false) {
    throw HTTPError(400, 'Already unpinned');
  }

  data.messages[messageIndex].isPinned = false;

  setData(data);
  return {};
}

// export function tagFunction (token: string, newMessage: Message) {
//   const data = getData();
//   let messageFirst20Chars = newMessage.message;
//   if(messageFirst20Chars.length >= 20) {
//     messageFirst20Chars = messageFirst20Chars.slice(0, 20);
//   }
//   const tagger = data.users.find(user => user.sessions.includes(token));
//   for(const i in data.users) {
//     //if(newMessage.message.includes('@' + data.users[i].handleStr)) {
//       if (newMessage.dmId === Number) {
//         const dm = data.dms.find(dm => newMessage.dmId === dm.dmId);
//         const notification = {
//           channelId: -1,
//           dmId: dm.dmId,
//           notificationMessage: tagger.handleStr + ' tagged you in ' + dm.name + ': ' + messageFirst20Chars,
//         };
//         data.users[i].notifications.push(notification);
//         setData(data);
//       }
//       else if(newMessage.channelId === Number) {
//         const channel = data.channels.find(channel => newMessage.channelId === channel.channelId);
//         const notification = {
//           channelId: channel.channelId,
//           dmId: -1,
//           notificationMessage: tagger.handleStr + ' tagged you in ' + channel.name + ': ' + messageFirst20Chars,
//         };
//         data.users[i].notifications.push(notification);
//         setData(data);
//       }
//     //}
//   }
//   setData(data);
//   return {};
// }

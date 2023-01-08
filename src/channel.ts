import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import { tokenValidator } from './dm';
/**
  * <channelDetailsV1 returns an object containing name, isPublic, ownerMmebers, allMemebers details
  * with a given channelId that the authorised user is a member of.>
  *
  * @param {string} token - parameter used to identify the user and whether their session is valid
  * @param {number} channelId - the unique integer that represents a channel
  * ...
  *
  * @returns {object} - if the input authUserId and channelId is valid, the funciton will return an object for the specific channel.
*/

export function channelDetailsV1(token: string, channelId: number) {
  const data = getData();
  if (!data.users.find(x => x.sessions.includes(token))) {
    throw HTTPError(403, 'Invalid token');
  }

  const channelIndex = data.channels.findIndex(x => x.channelId === channelId);

  if (channelIndex === -1) {
    throw HTTPError(400, 'Invalid Channel Id');
  }
  const user = data.users.find(user => user.sessions.includes(token));
  const authUserId = data.users.find(x => x.sessions.includes(token)).uId;
  if (!data.channels[channelIndex].allMembers.includes(authUserId)) { throw HTTPError(403, 'User must be a member to view channel details'); }

  const ownerMembers = data.users.filter(
    x => data.channels[channelIndex].ownerMembers.includes(x.uId)
  );

  const ownerMembersArray = ownerMembers.map(function (item) {
    return {
      uId: item.uId,
      email: item.email,
      nameFirst: item.nameFirst,
      nameLast: item.nameLast,
      handleStr: item.handleStr,
      profileImgUrl: item.profileImgUrl
    };
  });

  const allMembers = data.users.filter(
    x => data.channels[channelIndex].allMembers.includes(x.uId)
  );

  const allMembersArray = allMembers.map(function (item) {
    return {
      uId: item.uId,
      email: item.email,
      nameFirst: item.nameFirst,
      nameLast: item.nameLast,
      handleStr: item.handleStr,
      profileImgUrl: item.profileImgUrl
    };
  });

  return {
    name: data.channels[channelIndex].name,
    isPublic: data.channels[channelIndex].isPublic,
    ownerMembers: ownerMembersArray,
    allMembers: allMembersArray,
  };
}

/**
  * <channelJoinV1 with a given channelId of a channel that the authorised user can join, adds them to that channel.>
  *
  * @param {String} token - the unique integer that represents a user
  * @param {number} channelId - the unique integer that represents a channel
  *  ...
  *
  * @returns {} - if the input authUserId and channelId is valid, the funciton will return {} and add the user to the channel
*/

export function channelJoinV1(token: string, channelId: number) {
  const data = getData();
  // check whether it is valid token -> Error 1

  if (!data.users.find(x => x.sessions.includes(token))) {
    throw HTTPError(403, 'invalid token');
  }
  const channelIndex = data.channels.findIndex(x => x.channelId === channelId);

  // check whether it is a valid Channelid -> Error 2
  if (channelIndex === -1) {
    throw HTTPError(400, 'invalid Channelid');
  }

  const authUserId = data.users.find(x => x.sessions.includes(token)).uId;

  // check whether user is already a member of the channel
  if (data.channels[channelIndex].allMembers.includes(authUserId)) {
    throw HTTPError(400, 'authorised user is already a member of the channel');
  }

  // check whether the channel was public

  if (!data.channels[channelIndex].isPublic) {
    // if it is private, check whether ther memeber was a global owner
    const checkPerms = data.users.findIndex(x => x.uId === authUserId);
    if (data.users[checkPerms].permissionId !== 1) {
      throw HTTPError(403, 'authorised user is not already a private channel member and not global owner');
    }
  }

  data.channels[channelIndex].allMembers.push(authUserId);
  setData(data);

  return {};
}

/**
  * <channelInviteV1 with a given channelId of a channel that the authorised user can join, adds them to that channel.>
  *
  * @param {string} token - parameter used to identify the user and whether their session is valid
  * @param {number} channelId - the unique integer that represents a channel
  * @param {number} uId - the unique integer that represents a user to be invited
  *  ...
  *
  * @returns {} - if the input authUserId and channelId is valid, the funciton will return {} and add the user to the channel
*/

export function channelInviteV1(token: string, channelId: number, uId: number) {
  const data = getData();
  const channelIndex = data.channels.findIndex(x => x.channelId === channelId);

  // check whether channelID valid -> error 1
  if (channelIndex === -1) {
    throw HTTPError(400, 'invalid channelId');
  }
  // check wehther token valid -> error 2
  if (!data.users.find(x => x.sessions.includes(token))) {
    throw HTTPError(403, 'invalid token');
  }
  const authUserId = data.users.find(x => x.sessions.includes(token)).uId;
  // check whether authUserId include in the allMembers[]
  // since that can get perssion for invite
  const user = data.users.find(user => user.sessions.includes(token));
  if (!data.channels[channelIndex].allMembers.includes(authUserId)) {
    throw HTTPError(403, 'authorised user is not a member of the channel');
  }
  // check whether uid valid -> error 3
  if (!data.users.find(x => x.uId === uId)) {
    throw HTTPError(400, 'invalid uId');
  }

  // check whether uid inlcudes in the channel -> error 3
  if (data.channels[channelIndex].allMembers.includes(uId)) {
    throw HTTPError(400, 'user with uId already is a member of the channel');
  }

  // add the uid it the channel
  data.channels[channelIndex].allMembers.push(uId);
  // notifies the invited user that they were added to the channel
  const inviter = data.users.find(user => user.sessions.includes(token));
  const notification = {
    channelId: channelId,
    dmId: -1,
    notificationMessage: inviter.handleStr + ' added you to ' + data.channels[channelIndex].name,
  };
  const invitedUser = data.users.find(user => user.uId === uId);
  invitedUser.notifications.push(notification);
  setData(data);
  return {};
}

/**
  * <Given a channel with ID channelId that the authorised user is a member of, returns up to 50 messages between index "start" and "start + 50".>
  *
  * @param {String } token - parameter used to identify the user and whether their session is valid
  * @param {Number} channelId - the unique integer that represents a channel
  * @param {Number} start - index represents the messages
  *  ...
  *
  * @returns {messages, start, end} - If there are more messages to return after this function call, "end" equals "start + 50".
  *                                 - If this function has returned the least recent messages in the channel,
  *                                 - "end" equals -1 to indicate that there are no more messages to load after this return.
*/

export function channelMessagesV1(token: string, channelId: number, start: number) {
  const data = getData();
  const channelIndex = data.channels.findIndex(x => x.channelId === channelId);

  const userId = getUID(token);
  // Error 1 -> invalid ChannelId
  if (channelIndex === -1) {
    throw HTTPError(400, 'invalid Channelid');
  }

  // Error 2 -> invalid token

  if (!data.users.find(x => x.uId === userId)) {
    throw HTTPError(403, 'invalid token');
  }

  // Error 3 -> authUserId is not member of the channel

  if (!data.users.find(x => x.sessions.includes(token))) {
    throw HTTPError(403, 'token is not inside the channel ');
  }

  if (!data.channels[channelIndex].allMembers.includes(userId)) {
    throw HTTPError(403, 'authorised user is not a member of the channel');
  }

  // Error 4 -> start number was greater than total number of message in that channel
  if (data.channels[channelIndex].messagesId.length < start) {
    throw HTTPError(400, 'start number greater than total number of message in the channel');
  }

  // Get copy of the messages arrray for this channel
  const messageCopy = data.messages.filter(
    x => data.channels[channelIndex].messagesId.includes(x.messageId)
  );
  let reverseMessage = messageCopy.reverse();

  reverseMessage = reverseMessage.map(function(x) {
    for (const index in x.reacts) {
      if (x.reacts[index].uIds.includes(userId)) {
        x.reacts[index].isThisUserReacted = true;
      } else {
        x.reacts[index].isThisUserReacted = false;
      }
    }
    let message = x.message;
    if (Object.prototype.hasOwnProperty.call(x, 'ogMessage')) {
      message += '\n"""\n' + x.ogMessage + '\n"""';
    }
    return {
      messageId: x.messageId,
      uId: x.uId,
      message: message,
      timeSent: x.timeSent,
      reacts: x.reacts,
      isPinned: x.isPinned
    };
  });

  // use .slice to intercept
  const messageArray = reverseMessage.slice(start, start + 50);

  return {
    messages: messageArray,
    start: start,
    end: (start + 50 > data.channels[channelIndex].messagesId.length) ? -1 : start + 50
  };
}

// Help Function to find the uId through Token
function getUID(token: string): number {
  const data = getData();
  if (!data.users.find(x => x.sessions.includes(token))) {
    return -1;
  }
  return data.users.find(x => x.sessions.includes(token)).uId;
}

/**
  * <ChannelLeaveV1 is a help function which remove authrise user who was a member of channnels s>
  *
  * @param {string} token -  parameter used to identify the user and whether their session is valid
  * @param {number} channelId - the unique integer that represents a channel
  * ...
  *
  * @returns {}
*/
export function channelLeaveV1(token: string, channelId: number) {
  const data = getData();
  const channelIndex = data.channels.findIndex(x => x.channelId === channelId);

  // Error1: ChannelId not a valid channel
  if (channelIndex === -1) {
    throw HTTPError(400, 'invalid channelId');
  }

  // defined which channel was founded
  const channelFind = data.channels[channelIndex];

  // Error2: token was not valid
  const userId = getUID(token);
  if (userId === -1) {
    throw HTTPError(403, 'invalid token');
  }

  // Error3; Authorised user was not a member of channel
  if (!channelFind.allMembers.includes(userId)) {
    throw HTTPError(403, 'authorised user is not a member of the channel');
  }

  // Error 4: the authorised user is the starter of an active standup in the channel

  channelFind.allMembers = channelFind.allMembers.filter(
    function(x) {
      return x !== userId;
    }
  );

  // Error4 ; Authurised user was the owner of the memebers
  if (channelFind.ownerMembers.includes(userId)) {
    channelFind.ownerMembers = channelFind.ownerMembers.filter(
      function(y) {
        return y !== userId;
      }
    );
  }

  setData(data);

  return {};
}

/**
  * <channelAddowner function is a help function to make user with user id uId an owner of the channel.
  *
  * @param {string} token - is generated upon each new login for a user and identifier of a user.
  * @param {number} channelId - the unique integer that represents a channel
  * @param {number} uId - the unique string  that represents a user to be invited
  * ...
  *
  * @returns {}
*/
export function channelAddowner(token: string, channelId: number, uId: number) {
  // Error 1: channlId was not valid
  const data = getData();
  const channelIndex = data.channels.findIndex(x => x.channelId === channelId);
 
  // defined which channel was founded
  const channelFind = data.channels[channelIndex];

 
  const userId = getUID(token);
  
  // Error2: token was not valid§
  if (userId === -1) { throw HTTPError(403, 'invalid token'); }

  // Error 5: authorised user doesn't have owner permissions in the channel
  if (!channelFind.ownerMembers.includes(userId)) {
    throw HTTPError(403, 'authorised user no owner Permissions in channel');
  }

  if (channelIndex === -1) {
    throw HTTPError(400, 'Invalid Channel Id');
  }
  // Error 2: uId does not refer a valid user
  if (!data.users.find(x => x.uId === uId)) {
    throw HTTPError(400, 'uId does not refer a valid user');
  }

  // Error 3: Uid who is not a member of the channel
  if (!channelFind.allMembers.includes(uId)) {
    throw HTTPError(400, 'uId is not a member of the channel');
  }

  // Error 4: Uid who is already an owner of the channel
  if (channelFind.ownerMembers.includes(uId)) {
    throw HTTPError(400, 'uId is already an owner of the channel');
  }

  channelFind.ownerMembers.push(uId);
  setData(data);
  return {};
}

/**
  * <channnelRemoveOwner function is a help function to remove user with user id uId as an owner of the channel.
  *
  * @param {string} token -  is generated upon each new login for a user and identifier of a user.
  * @param {number} channelId - the unique integer that represents a channel
  * @param {number} uId - the unique integer that represents a user to be invited
  * ...
  *
  * @returns {}
*/
export function channelRemove(token: string, channelId: number, uId: number) {
  // Error 1: channlId was not a valid id
  const data = getData();
  const channelIndex = data.channels.findIndex(x => x.channelId === channelId);
 
  // defined which channel was founded
  const channelFind = data.channels[channelIndex];

  // Error 1: token was not valid
  const userId = getUID(token);
  if (!tokenValidator(token)) { throw HTTPError(403, 'invalid token'); }

  // Error 2: authorised user doesn't have owner permissions in the channel
  if (!channelFind.ownerMembers.includes(userId)) {
    throw HTTPError(403, 'authorised user no owner Permissions in channel');
  }

  // Error3: channeld is not a valid channel 
  if (channelIndex === -1) {
    throw HTTPError(400, 'channelId is not a valid channel');
  }

  // Error 4: uId does not refer a valid user
  if (!data.users.find(x => x.uId === uId)) {
    throw HTTPError(400, 'uId does not refer to a valid user ');
  }

  // Error 5: uId who is not an owner of the channel
  if (!channelFind.ownerMembers.includes(uId)) {
    throw HTTPError(400, 'uId is not  an owner of the channel');
  }

  // Error 6: uId users who is currently the only owner of the channel
  if (channelFind.ownerMembers.length === 1) {
    if (channelFind.ownerMembers.includes(uId)) {
      throw HTTPError(400, 'uId is the only owner of the channel');
    }
  }
  channelFind.ownerMembers = channelFind.ownerMembers.filter(
    function(y) {
      return y !== uId;
    }
  );
  setData(data);
  return {};
}

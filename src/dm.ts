import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';

/**
  * dmCreateV1 is a function that generates a new DM containing the users that contain the uId
  * that the authorised user inputted.
  *
  * @param {String} token - parameter used to identify the user and whether their session is valid
  * @param {Number Array} uIds - parameter used to identify members who will be in the generated DM.
  * ...
  *
  * @returns {Number} dmId- Will return a valid dmId if all token is valid, all uIds are valid and are not duplicated.
*/

export function dmCreateV1 (token: string, uIds: number[]) {
  const data = getData();
  // checks if all uIds inputted are valid
  for (const uId of uIds) {
    if (!uIdValidator(uId)) {
      throw HTTPError(400, 'a uId inputted is invalid');
    }
  }
  // checks if all uIds inputted are unique
  for (let i = 0; i < uIds.length; i++) {
    if (uIds[i] === uIds[i + 1]) {
      throw HTTPError(400, 'there is a uId that is duplicated');
    }
  }
  // checks if the token inputted is valid
  if (!tokenValidator(token)) { throw HTTPError(403, 'invalid token'); }
  // Creates an array containing the handleStr of every user
  const creator = data.users.find(user => user.sessions.includes(token));

  const handleStrArray = [creator.handleStr]
  for(const user of data.users) {
    for(const uId of uIds) {
      if (user.uId === uId) {handleStrArray.push(user.handleStr); }
    }
  }
  const alphabeticallyOrderedHandleStrArray = handleStrArray.sort(function (a, b) {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  });
  let nameStr = '';
  for (const handleStr in alphabeticallyOrderedHandleStrArray) {
    nameStr = nameStr + alphabeticallyOrderedHandleStrArray[handleStr];
    if (handleStr < alphabeticallyOrderedHandleStrArray.length) {
      nameStr = nameStr + ', ';
    }
  }

  const members = [];
  members.push(creator);
  for (const uId of uIds) {
    for (const user in data.users) {
      if (data.users[user].uId === uId) {
        members.push(data.users[user]);
      }
    }
  }
  // uIds.push(creator.uId);
  nameStr = nameStr.substring(0, nameStr.length - 2);
  const DM = {
    dmId: (data.dms.length + 1),
    name: nameStr,
    uIds: uIds,
    creator: creator.uId,
    messagesId: [],
    members: members,
  };
  data.dms.push(DM);
  // pushes a notification to all users in the DM
  const notification = {
    channelId: -1,
    dmId: DM.dmId,
    notificationMessage: creator.handleStr + ' added you to ' + DM.name
  };
  for (const uId of uIds) {
    for (const user in data.users) {
      if (data.users[user].uId === uId && uId !== creator.uId) {
        data.users[user].notifications.push(notification);
      }
    }
  }
  setData(data);
  return { dmId: DM.dmId };
}

/**
  * dmListV1 returns a list of all the DMs that the authorised user is a member of.
  *
  * @param {String} token - parameter used to identify the user and whether their session is valid
  * ...
  *
  * @returns {Arrry of objects containing dmId and name} - Will only return if a valid token is inputted.
*/
export function dmListV1 (token: string) {
  // checks if the token inputted is valid
  const data = getData();
  if (!tokenValidator(token)) { throw HTTPError(403, 'invalid token'); }
  // gets all properties of the user
  const user = data.users.find(user => user.sessions.includes(token));
  let dms = [];
  for (const dm of data.dms) {
    if(dm.uIds.includes(user.uId) || user.uId === dm.creator) {
      const userDm = {
        dmId: dm.dmId,
        name: dm.name,
      }
      dms.push(userDm);
    }
  }

  return { dms: dms };
}

/**
  * dmRemoveV1 removes an existing DM so all members are no longer in the DM and can only be done by the original creator.
  *
  * @param {String} token - parameter used to identify the user and whether their session is valid.
  * @param {Number} dmId - parameter used to identify which DM the authorised user wants to remove.
  * ...
  *
  * @returns {} - returns nothing if token & dmId are valid, and the authorised user is the original creator.
*/
export function dmRemoveV1 (token: string, dmId: number) {
  const data = getData();
  // checks if token is valid
  if (!tokenValidator(token)) { throw HTTPError(403, 'invalid token'); }
  // Checks whether inputted dmId is valid
  if (!dmIdvalidator(dmId)) { throw HTTPError(400, 'invalid dmId'); }
  const inputdm = data.dms.find(dm => dm.dmId === dmId);
  // gets all properties of the user
  const user = data.users.find(user => user.sessions.includes(token));
  const dm = inputdm;
  // checks if the authorised user is a the original DM creator
  if (user.uId !== inputdm.creator) {
    throw HTTPError(403, 'authorised user is not the original DM Creator');
  } else {
  // checks if user is a part of the original DM
    let userInDm = false;
    for (const uId of inputdm.uIds) {
      if (user.uId === uId || user.uId === dm.creator) {
        userInDm = true;
      }
    }
    if (!userInDm) { throw HTTPError(403, 'authorised user is no longer in the DM'); }
  }
  const dmIndex = data.dms.indexOf(inputdm);
  data.dms.splice(dmIndex, 1);
  setData(data);
  return {};
}
/**
  * dmDetailsV1 returns the basic details of a DM that the authorised user is a part of.
  *
  * @param {String} token - parameter used to identify the user and whether their session is valid
  * @param {Number} dmId - parameter used to identify the DM to get details from.
  * ...
  *
  * @returns {String} - will return a string containing a name if dmId and token are valid and the authorised user is a member of system.
  * @returns {members} - will return an array of users if dmId and token are valid, and authorised user is a member of the DM.
*/

export function dmDetailsV1(token: string, dmId: number) {
  const data = getData();
  // checks that dmId is valid
  if (!dmIdvalidator(dmId)) { throw HTTPError(400, 'invalid dmId'); }
  const inputdm = data.dms.find(dm => dm.dmId === dmId);
  // checks that the token is valid
  if (!tokenValidator(token)) { throw HTTPError(403, 'invalid token'); }
  // Checks that the authorised user is a member of the the DM
  const user = data.users.find(user => user.sessions.includes(token));
  let userInDm = false;
  for (const uId of inputdm.uIds) {
    if (user.uId === uId) {
      userInDm = true;
    }
  }
  if (!userInDm && user.uId !== inputdm.creator) {
    throw HTTPError(403, 'authorised user is not a member of the DM');
  }
  return { name: inputdm.name, members: inputdm.members };
}

/**
  * dmLeaveV1 removes the authorised user as a member of the DM which has the inputted dmId.
  *
  * @param {String} token - parameter used to identify the user and whether their session is valid
  * @param {Number} dmId - used to identify the DM to remove the authorised user as a member of.
  * ...
  *
  * @returns {} - returns nothing if dmId and token are valid and the user is a member of the DM.
*/
export function dmLeaveV1(token: string, dmId: number) {
  const data = getData();
  // checks that the dmId is valid
  let validdmId = false;
  let inputdm;
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      inputdm = dm;
      validdmId = true;
    }
  }
  if (!validdmId) { throw HTTPError(400, 'invalid dmId'); }
  // checks that the token is valid
  if (!tokenValidator(token)) { throw HTTPError(403, 'invalid token'); }
  // Checks that the authorised user is a member of the the DM
  const user = data.users.find(user => user.sessions.includes(token));
  let userInDm = false;
  for (const uId of inputdm.uIds) {
    if (user.uId === uId) {
      userInDm = true;
    }
  }
  if (!userInDm && user.uId !== inputdm.creator) {
    throw HTTPError(403, 'user is not a member of the DM');
  }

  for (const uId in inputdm.uIds) {
    if (user.uId === inputdm.uIds[uId]) {
      inputdm.uIds.splice(uId, 1);
    }
  }
  for (const member in inputdm.members) {
    if (inputdm.members[member].uId === user.uId) {
      (inputdm.members.splice(member, 1));
    }
  }
  if (user.uId === inputdm.creator) {
    inputdm.creator = -1;
  }
  for (let i = 0; i < data.dms.length; i++) {
    if (data.dms[i].dmId === dmId) {
      data.dms.splice(i, 1, inputdm);
    }
  }
  setData(data);
  return {};
}

/**
  * dmMessagesV1 returns up to 50 messages from between the  index start and start + 50 from a DM that the authorised user is a part of.
  *
  * @param {String} token - parameter used to identify the user and whether their session is valid.
  * @param {Number} dmId - used to identify the DM to return messages from.
  * @param {start} start - index used to establish starting point of where to return messages from.
  * ...
  *
  * @returns {messages} - if dmId and token are valid, the authorised user is a member of the DM and start is not greater than the total number of messages.
  * @returns {start} - if dmId and token are valid, the authorised user is a member of the DM and start is not greater than the total number of messages.
  * @returns {end} - if dmId and token are valid, the authorised user is a member of the DM and start is not greater than the total number of messages.
*/
export function dmMessagesV1 (token: string, dmId: number, start: number) {
  const data = getData();
  // checks that the token is valid
  if (!tokenValidator(token)) { throw HTTPError(403, 'invalid token'); }
  // checks that the dmId is valid
  if (!dmIdvalidator(dmId)) { throw HTTPError(400, 'invalid dmId'); }
  const inputdm = data.dms.find(dm => dm.dmId === dmId);
  // Checks that the authorised user is a member of the the DM
  const user = data.users.find(user => user.sessions.includes(token));
  let userInDm = false;
  for (const uId of inputdm.uIds) {
    if (user.uId === uId) {
      userInDm = true;
    }
  }
  if (!userInDm && user.uId !== inputdm.creator) {
    throw HTTPError(403, 'user is not a member of the DM');
  }
  // checks that start is not greater than total number of messages in the channel
  if (start > inputdm.messagesId.length) {
    throw HTTPError(400, 'start is greater than the total number of messages in the channel');
  }
  const dmIndex = data.dms.indexOf(inputdm);
  let messages = data.messages.filter(message => data.dms[dmIndex].messagesId.includes(message.messageId)).reverse();
  messages = messages.map(function(x, index) {
    for (const index in x.reacts) {
      if (x.reacts[index].uIds.includes(user.uId)) {
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
  const recentMessages = messages.slice(start, start + 50);
  return {
    messages: recentMessages,
    start: start,
    end: (start + 50 > data.dms[dmIndex].messagesId.length) ? -1 : start + 50
  };
}

// if the token inputted is valid returns true else returns false
export function tokenValidator (token: string): boolean {
  const data = getData();
  for (const user in data.users) {
    if (data.users[user].sessions.includes(token)) {
      return true;
    }
  }
  return false;
}

export function uIdValidator (uId: number):boolean {
  const data = getData();
  let validuId = false;
  for (const i in data.users) {
    if (uId === data.users[i].uId) {
      validuId = true;
      return validuId;
    }
  }
  return validuId;
}

export function dmIdvalidator(dmId: number):boolean {
  const data = getData();
  let validdmId = false;
  for (const i in data.dms) {
    if (dmId === data.dms[i].dmId) {
      validdmId = true;
      return validdmId;
    }
  }
  return validdmId;
}

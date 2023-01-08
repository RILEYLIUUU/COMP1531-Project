import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import { tokenValidator, uIdValidator } from './dm';

/**
  * adminUserRemoveV1 removes a given user from Beans
  *
  * @param {String} token - Verifies that the authorccised user has a valid session
  * @param {Number} uId - Number used to identify the user to be removed from Beans
  * ...
  *
*/
export function adminUserRemoveV1 (token: string, uId: number) {
  const data = getData();
  // checks that the token is valid
  if (!tokenValidator(token)) { throw HTTPError(403, 'invalid token'); }
  // checks that the uId is valid
  if (!uIdValidator(uId)) { throw HTTPError(400, 'Invalid uId'); }
  // checks that the authorised user is a global owner
  const authorisedUser = data.users.find(user => user.sessions.includes(token));
  if (!globalOwnerValidator(authorisedUser.uId)) { throw HTTPError(403, 'the authorised user is not a global owner'); }
  // checks that the authorised user is not the only global owner
  if (onlyGlobalOwnerValidator(authorisedUser.uId, uId)) { throw HTTPError(400, 'the user is the only global owner'); }
  // removes user from dataStore
  const user = data.users.find(x => x.uId === uId);
  const usersIndex = data.users.findIndex(x => x.uId === uId);
  data.users.splice(usersIndex, 1);
  const allUsersIndex = data.allUsers.findIndex(x => x.uId === uId);
  // Changes user's name to Removed User in allUsers array
  data.allUsers[allUsersIndex].nameFirst = 'Removed';
  data.allUsers[allUsersIndex].nameLast = 'User';
  // Removes user from all Dms
  for(const dm of data.dms) {
    if(dm.members.includes(user) ) {
      const dmUserIndex = dm.members.indexOf(user);
      dm.members.splice(dmUserIndex, 1);
    }
  }
  // Changes all messages previously sent to 'Removed user'
  for (const message of data.messages) {
    if(message.uId === user.uId) {
      message.message = 'Removed user';
    }
  }
  setData(data);
  return {};
}

/**
  * adminUserPermissionChangeV1 changes the permissionId of a user to the permissionId inputted
  *
  * @param {String} token - Verifies that the authorccised user has a valid session
  * @param {Number} uId - the uId is used to identify the user who's permission is being changed
  * @param {Number} permissionId - the permissionId inputted is what the user's permission is being changed
  * ...
  *
  * @returns {} - if the token, permissionId inputted are valid and the authorised user is one of the global owners nothing will be returned
*/
export function adminUserPermissionChangeV1 (token: string, uId: number, permissionId: number) {
  const data = getData();
  // checks that the token is valid
  if (!tokenValidator(token)) { throw HTTPError(403, 'invalid token'); }
  // checks that the authorised user is a global owner
  const authorisedUser = data.users.find(user => user.sessions.includes(token));
  if (!globalOwnerValidator(authorisedUser.uId)) { throw HTTPError(403, 'the authorised user is not a global owner'); }
  // checks that the uId is valid
  if (!uIdValidator(uId)) { throw HTTPError(400, 'Invalid uId'); }
  // checks that the authorised user is not the only global owner
  if (onlyGlobalOwnerValidator(authorisedUser.uId, uId)) { throw HTTPError(400, 'the user is the only global owner'); }
  // Checks that the permissionId is valid
  if (permissionId === 1 || permissionId === 2) {
  // Checks that the user does not already have the permissions level of permissionId
    const user = data.users.find(user => user.uId === uId);
    if (user.permissionId === permissionId) { throw HTTPError(400, 'user already has the permissions level of permissionId'); }
    for (const user of data.users) {
      if (user.uId === uId) {
        user.permissionId = permissionId;
        const allUsersUser = data.allUsers.find(user => user.uId === uId);
        allUsersUser.permissionId = permissionId;
        setData(data);
        return {};
      }
    }
  }
  throw HTTPError(400, 'invalid permissionId');
}

/**
  * searchV1 finds messages that contain the queryStr inputted
  *
  * @param {String} token - Verifies that the authorised user has a valid session
  * @param {String} queryStr - the substring that is to be searched through channel and dm messages
  * ...
  *
  * @returns {Messages} - if queryStr is between 1 and 1000 characters and the token is valid messages will be returned
*/
export function searchV1 (token: string, queryStr: string) {
  const data = getData();
  // checks that the querStr is between 1 and 1000 characters
  if (queryStr.length < 1 || queryStr.length > 1000) {
    throw HTTPError(400, 'length of queryStr is less than 1 or over 1000 characters');
  }
  // checks that the token is valid
  if (!tokenValidator(token)) { throw HTTPError(403, 'invalid token'); }
  const user = data.users.find(user => user.sessions.includes(token));
  // changes queryStr & all messages to be case insensitive
  const LowerCaseQueryStr = queryStr.toLowerCase();
  const lowerCaseMessages = data.messages;
  const messages = [];
  for(const message of lowerCaseMessages) {
    message.message.toLowerCase();
    if(typeof message.channelId === 'number') {
      const channel = data.channels.find(x => x.channeId === message.channelId);
      // if(channel.allMembers.includes(user.uId)) {
        messages.push(message);
     // }
    }
    if(typeof message.dmId === 'number') {
      const dm = data.dms.find(x => x.dmId === message.dmId);
      if(dm.uIds.includes(user.uId) || dm.creator === user.uId) {
        messages.push(message);
      }
    }
  }

  return { messages };
}

/**
  * notificationsGetV1 returns the notifications of the the authorised user
  *
  * @param {String} token - Verifies that the authorised user has a valid session
  * ...
  *
  * @returns {Notifications} - An array of objects containing channelId, dmId and notificationMessage will be returned if the token is valid
*/
export function notificationsGetV1 (token: string) {
  const data = getData();
  // checks that the token is valid
  if (!tokenValidator(token)) { throw HTTPError(403, 'invalid token'); }
  const user = data.users.find(user => user.sessions.includes(token));
  let notifications = user.notifications;
  // Gets the 20 most recent notifications for the authorised user
  notifications = notifications.reverse();
  notifications = notifications.splice(0, 19);
  return { notifications };
}

export function globalOwnerValidator(uId: number) {
  const data = getData();
  const user = data.users.find(user => user.uId === uId);
  if (user.permissionId === 1) {
    return true;
  } else {
    return false;
  }
}

function onlyGlobalOwnerValidator(authorisedUseruId: number, uId: number) {
  const data = getData();
  const globalOwners = data.users.filter(user => user.permissionId === 1);
  if (globalOwners.length === 1 && authorisedUseruId === uId) {
    return true;
  }
  return false;
}

import { getData, setData } from './dataStore';
import validator from 'validator';
import HTTPError from 'http-errors';
import getImageSize from 'image-size-from-url';

// ===============================================================================================================//

// Helper function to check if alphanumeric
function isAlphaNumeric(str: string) {
  let code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123)) { // lower alpha (a-z)
      return false;
    }
  }
  return true;
}

// Get current time in seconds
const getTimeStamp = () => Math.floor(Date.now() / 1000);

// ===============================================================================================================//

/**
 * Function called by a user with a valid uId that
 * returns information about user with specified uId.
 *
 * @param {number} authUserId
 * @param {number} uId
 * @returns {{user: { uId: number
 *                    email: string
 *                    nameFirst: string
 *                    nameLast: string
 *                    handleStr: string }}}
 *
 */
export function userProfileV1(token: string, uId: number) {
  const data = getData();
  // Invalid authUserId
  if (!data.users.find(x => x.sessions.includes(token))) {
    throw HTTPError(403, 'Invalid user calling function');
  }
  // Invalid uId
  if (data.users.find(x => x.uId === uId) === undefined && data.allUsers.find(x => x.uId === uId) === undefined) {
    throw HTTPError(400, 'Invalid uId entered');
  }
  return {
    user: {
      uId: uId,
      email: data.allUsers.find(x => x.uId === uId).email,
      nameFirst: data.allUsers.find(x => x.uId === uId).nameFirst,
      nameLast: data.allUsers.find(x => x.uId === uId).nameLast,
      handleStr: data.allUsers.find(x => x.uId === uId).handleStr,
      profileImgUrl: data.allUsers.find(x => x.uId === uId).profileImgUrl,
    }
  };
}

/**
  * <userAllV1 - Returns a list of all users and their associated details.>
  *
  * @param {string} token - represents the user who's calling the function
  * ...
  *
  * @returns {users[]}
*/
export function userAllV1(token: string) {
  const data = getData();

  for (const user of data.users) {
    if (user.sessions.find(t => t === token)) {
      return { users: data.users };
    }
  }
  // Invalid token
  throw HTTPError(403, 'Invalid token');
}

/**
 * <userProfileSetnameV1 - Update the authorised user's first and last name>
 *
 * @param {string} token
 * @param {string} nameFirst
 * @param {string} nameLast
 *
 * @returns {}
 */
export function userProfileSetnameV1(token: string, nameFirst: string, nameLast: string) {
  const data = getData();
  if (nameFirst.length < 1 || nameFirst.length > 50) {
    throw HTTPError(400, 'User first name is invalid');
  }
  if (nameLast.length < 1 || nameLast.length > 50) {
    throw HTTPError(400, 'User last name is invalid');
  }

  for (const user of data.users) {
    if (user.sessions.find(t => t === token)) {
      user.nameFirst = nameFirst;
      user.nameLast = nameLast;
    }
  }
  for (const user of data.allUsers) {
    if (user.sessions.find(t => t === token)) {
      user.nameFirst = nameFirst;
      user.nameLast = nameLast;
      setData(data);
      return {};
    }
  }
  // Invalid token
  throw HTTPError(403, 'Invalid token');
}

/**
 * <userProfileSetemailV1 - Update the authorised user's first and last name>
 *
 * @param {string} token
 * @param {string} email
 *
 * @returns {}
 */
export function userProfileSetemailV1(token: string, email: string) {
  const data = getData();
  email = email.toLowerCase();
  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'Invalid email address');
  }
  for (const i in data.users) {
    if (data.users[i].email === email) {
      throw HTTPError(400, 'Email address already in use');
    }
  }

  for (const user of data.users) {
    if (user.sessions.find(t => t === token)) {
      user.email = email;
      const allUsersUser = data.allUsers.find(user => user.sessions.includes(token));
      allUsersUser.email = email;
      setData(data);
      return {};
    }
  }

  // Invalid token
  throw HTTPError(403, 'Invalid token');
}

/**
 * <userProfileSethandleV1 - Update the authorised user's handle (i.e. display name)>
 *
 * @param {string} token
 * @param {string} handleStr
 *
 * @returns {}
 */
export function userProfileSethandleV1(token: string, handleStr: string) {
  const data = getData();
  if (handleStr.length < 3 || handleStr.length > 20) {
    throw HTTPError(400, 'Handle string is invlaid');
  }
  for (const i in data.users) {
    if (data.users[i].handleStr === handleStr) {
      throw HTTPError(400, 'Handle string is already in use');
    }
  }
  if (!isAlphaNumeric(handleStr)) {
    throw HTTPError(400, 'Handle string contains characters that are not alphanumeric');
  }
  for (const user of data.users) {
    if (user.sessions.find(t => t === token)) {
      user.handleStr = handleStr;
      const allUsersUser = data.allUsers.find(user => user.sessions.includes(token));
      allUsersUser.handleStr = handleStr;
      setData(data);
      return {};
    }
  }

  // Invalid token

  throw HTTPError(403, 'Invalid token');
}

/**
 * <userProfileUploadphotoV1 - Given a URL of an image on the internet,
 * crops the image within bounds (xStart, yStart) and (xEnd, yEnd).
 * Position (0,0) is the top left.
 * Please note: the URL needs to be a non-https URL (it should just have "http://" in the URL).
 * We will only test with non-https URLs.
 * >
 * @param {string} token
 * @param {string} imgUrl
 * @param {string} xStart
 * @param {string} yStart
 * @param {string} xEnd
 * @param {string} yEnd
 *
 * @returns {}
 */

export function userProfileUploadphotoV1(token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number) {
  const data = getData();
  if (!data.users.find(x => x.sessions.includes(token))) {
    throw HTTPError(403, 'invalid token');
  }
  // Test error cases
  const isImageURL = require('valid-image-url');

  if (!isImageURL(imgUrl)) {
    throw HTTPError(400, 'invalid imageURL');
  }

  if (!/\.(jpg|jpeg)$/.test(imgUrl)) {
    throw HTTPError(400, 'The image is not in jpg format');
  }

  if (xEnd <= xStart | yEnd <= yStart) {
    throw HTTPError(400, 'xEnd is less than or equal to xStart or yEnd is less than or equal to yStart');
  }

  const { width, height } = getImageSize(imgUrl);
  if (xEnd > width | yEnd > height | xStart > width | yEnd > height) {
    throw HTTPError(400, 'any of xStart, yStart, xEnd, yEnd are not within the dimensions of the image at the URL');
  }

  // Crop image
  const Jimp = require('jimp');
  const image = Jimp.read(imgUrl);
  image.crop(xStart, yStart, xEnd - xStart, yEnd - yStart);
  for (const user of data.users) {
    if (user.sessions.find(t => t === token)) {
      user.profileImgUrl = imgUrl;
      setData(data);
      return {};
    }
  }
}

/**
 * <userStatsV1 - Fetches the required statistics about this user's use of UNSW Beans.>
 *
 *
 * @param {string} token
 *
 * @returns {userStats}
 *
*/
export function userStatsV1(token: string) {
  const data = getData();
  // Find the corresponding user
  let numChannelsJoined = 0;
  let numDmsJoined = 0;
  let numMessagesSent = 0;
  let numChannels = 0;
  let numDms = 0;
  let numMsgs = 0;
  const timeStamp = getTimeStamp();
  let i = 0;
  while (i < data.channels.length) {
    numChannels += 1;
    i++;
  }
  i = 0;
  while (i < data.dms.length) {
    numDms += 1;
    console.log(`${numDms} numDms`);
    i++;
  }
  i = 0;
  while (i < data.messages.length) {
    numMsgs += 1;
    console.log(`${numMsgs} numMsgs`);
    i++;
  }

  for (const user of data.users) {
    if (user.sessions.includes(token)) {
      const uIdNumber = user.uId;
      console.log(`${uIdNumber} is here, check it`);
      for (const channel of data.channels) {
        if (channel.allMembers.includes(uIdNumber)) {
          numChannelsJoined += 1;
        }
      }
      for (const dm of data.dms) {
        if (dm.uIds.includes(uIdNumber)) {
          numDmsJoined += 1;
        }
      }
      for (const message of data.messages) {
        if (message.uId === uIdNumber) {
          numMessagesSent += 1;
        }
      }
      const denominator = numChannels + numDms + numMsgs;
      if (denominator === 0) {
        const involvementRate = 0;
        return {
          userStats: {
            channelsJoined: [{ numChannelsJoined, timeStamp }],
            dmsJoined: [{ numDmsJoined, timeStamp }],
            messagesSent: [{ numMessagesSent, timeStamp }],
            involvementRate
          }
        };
      }

      let involvementRate = (numChannelsJoined + numDmsJoined + numMessagesSent) / denominator;
      if (involvementRate > 1) {
        involvementRate = 1;
      }
      return {
        userStats: {
          channelsJoined: [{ numChannelsJoined, timeStamp }],
          dmsJoined: [{ numDmsJoined, timeStamp }],
          messagesSent: [{ numMessagesSent, timeStamp }],
          involvementRate
        }
      };
    }
  }
  // Invalid token
  throw HTTPError(403, 'Invalid token');
}

/**
 * <usersStatsV1 - Fetches the required statistics about the workspace's use of UNSW Beans.>
 *
 *
 * @param {string} token
 *
 * @returns {workspaceStats}
 *
*/
export function usersStatsV1(token: string) {
  const data = getData();
  // Find the corresponding user
  let numChannels = 0;
  let numDms = 0;
  let numMsgs = 0;
  let numUserAtLeastOneChannelOrDm = 0;
  let numUsers = 0;
  const timeStamp = getTimeStamp();
  // Check if the token is valid
  let checkTokenValid = 0;
  for (const user of data.users) {
    if (user.sessions.find(t => t === token)) {
      checkTokenValid += 1;
    }
  }
  if (checkTokenValid < 1) {
    // Invalid token
    throw HTTPError(403, 'Invalid token');
  }
  let i = 0;
  while (i < data.channels.length) {
    numChannels += 1;
    i++;
  }
  i = 0;
  while (i < data.dms.length) {
    numDms += 1;
    i++;
  }
  i = 0;
  while (i < data.messages.length) {
    numMsgs += 1;
    i++;
  }
  for (const user of data.users) {
    const uId = user.uId;
    for (const channel of data.channels) {
      if (channel.allMembers.includes(uId)) {
        numUserAtLeastOneChannelOrDm += 1;
      }
    }
    for (const dm of data.dms) {
      if (dm.uIds.includes(uId)) {
        numUserAtLeastOneChannelOrDm += 1;
      }
    }
    numUsers += 1;
  }
  const utilizationRate = numUserAtLeastOneChannelOrDm / numUsers;
  return {
    workspaceStats: {
      channelsExist: [{ numChannels, timeStamp }],
      dmsExist: [{ numDms, timeStamp }],
      messagesExist: [{ numMsgs, timeStamp }],
      utilizationRate
    }
  };
}

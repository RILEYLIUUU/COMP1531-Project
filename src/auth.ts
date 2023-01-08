import validator from 'validator';
import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
const nodemailer = require('nodemailer'); // To send email using node.js: npm i nodemailer
import crypto from 'crypto';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

/**
  * <authLoginV1 returns a unique authUserId value
  * with a given registered user's email and password.>
  *
  * @param {string} email - the email address the user is registering with
  * @param {string} password - the password that they will use to login with once registered
  * ...
  *
  * @returns {integer} - if the input email and password is valid, the funciton will return a unique integer as the user Id.
*/

function authLoginV1(email: string, password: string) {
  const data = getData();
  email = email.toLowerCase();
  for (const user of data.allUsers) {
    if (user.email === email && user.password === hash(password)) {
      const token = tokenGenerator();
      user.sessions.push(token);
      user.hashSessions.push(tokenHasher(token));
      setData(data);
    }
  }
  for (const user of data.users) {
    if (user.email === email && user.password === hash(password)) {
      const token = tokenGenerator();
      user.sessions.push(token);
      user.hashSessions.push(tokenHasher(token));
      setData(data);
      return { token: token, authUserId: user.uId };
    }
  }

  throw HTTPError(400, 'invlaid email or password');
}

/**
  * <authRegisterV1 creates a new account for a user given their email, password,
  * first name and last name. It also creates a unique handlestring for them.>
  *
  * @param {string} email - the email address the user is registering with
  * @param {string} password - the password that they will use to login with once registered
  * @param {string} nameFirst - the user's first name
  * @param {string} nameLast - the user's last name
  * ...
  *
  * @returns {integer} - if the email address is valid, the password has a length greater than 6, and nameFirst and nameLast are
  *  between 1 and 50 characters inclusive it will return the users new uId.
*/
function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string) {
  const data = getData();
  email = email.toLowerCase();
  if (!validator.isEmail(email)) { throw HTTPError(400, 'invalid email'); }
  for (const i in data.users) {
    if (data.users[i].email === email) {
      throw HTTPError(400, 'email already being used by another user');
    }
  }
  if (password.length < 6) { throw HTTPError(400, 'password is less than 6 characters'); }
  if (nameFirst.length < 1 || nameFirst.length > 50) { throw HTTPError(400, 'nameFirst not between 1 and 50 characters inclusive'); }
  if (nameLast.length < 1 || nameLast.length > 50) {
    throw HTTPError(400, 'nameFirst not between 1 and 50 characters inclusive');
  }
  // Generates a handle string for the authorised user
  let handleStr = nameFirst + nameLast;
  handleStr = handleStr.toLowerCase();
  handleStr = handleStr.replace(/\W/g, '');
  if (handleStr.length > 20) { handleStr = handleStr.slice(0, 19); }
  let handleStrCounter = data.users.filter(x => x.handleStr.includes(handleStr));
  if(handleStrCounter.length !== 0) {
    handleStr += String(handleStrCounter.length - 1)
  }
  const profileImgUrl = SERVER_URL + 'src/imgurl/test.jpg';
  const authUserId = data.allUsers.length;
  let globalPermissions = 0;
  // Gives the first user the owner permissionId
  if (data.allUsers.length === 0 && data.users.length === 0) {
    globalPermissions = 1;
  } else {
    globalPermissions = 2;
  }
  const token = tokenGenerator();
  // Creates the user object then pushes it into the data.users and allUsers arrays
  const user = {
    uId: authUserId,
    email: email,
    password: hash(password),
    nameFirst: nameFirst,
    nameLast: nameLast,
    handleStr: handleStr,
    permissionId: globalPermissions,
    sessions: [token],
    hashSessions: [tokenHasher(token)],
    notifications: [],
    profileImgUrl: profileImgUrl
  };
  data.users.push(user);
  data.allUsers.push(user);
  setData(data);
  return { authUserId: authUserId, token: token };
}

function randomNumber () {
  return Math.random().toString(36).substr(2); // removes the '0.'
}

function tokenGenerator (): string {
  return (randomNumber() + randomNumber());
}

/**
  * <authLogoutV1 - Given an active token, invalidates the token to log the user out.>
  *
  * @param {string} token - the token to be removed from sessions array
  * ...
  *
  * @returns {}
*/
function authLogoutV1(token: string) {
  const data = getData();

  if (data.users.find(x => x.sessions.includes(token))) {
    const index = data.users.find(x => x.sessions.includes(token)).sessions.indexOf(token);
    const allUsersIndex = data.allUsers.find(x => x.sessions.includes(token)).sessions.indexOf(token);
    if (index > -1) { // only splice array when item is found
      data.users.find(x => x.sessions.includes(token)).sessions.splice(index, 1); // 2nd parameter means remove one item only
      data.users.find(x => x.hashSessions.includes(tokenHasher(token))).hashSessions.splice(index, 1);
      data.allUsers.find(x => x.sessions.includes(token)).sessions.splice(allUsersIndex, 1);
      data.allUsers.find(x => x.hashSessions.includes(tokenHasher(token))).hashSessions.splice(allUsersIndex, 1);
      setData(data);
      return {};
    }
  }
  throw HTTPError(403, 'invalid token');
}

/**
  * <authPasswordresetRequestV1 -
  * Given an email address, if the email address belongs to a registered user,
  * sends them an email containing a secret password reset code.
  * This code, when supplied to auth/passwordreset/reset,
  * shows that the user trying to reset the password is the same user who got sent the email contaning the code.
  * No error should be raised when given an invalid email,
  * as that would pose a security/privacy concern.
  * When a user requests a password reset, they should be logged out of all current sessions.>
  *
  * @param {string} email - send the secret code to the email provided
  *
  * @returns {}
*/

function authPasswordresetRequestV1(email: string) {
  const data = getData();

  for (const user of data.users) {
    if (user.email === email) {
      // generate the secret code & store it in dataStore
      const secretCodeGenerated = tokenGenerator();
      // send email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'rebeccastenta.2000@gmail.com',
          pass: 'nqflmsxisdplpqvw' // real passowrd: rebeccastenta0112
        },
      });

      const mailOption = {
        from: 'rebeccastenta.2000@gmail.com',
        to: email,
        subject: 'Send secret code',
        text: secretCodeGenerated,
      };

      /* transporter.sendMail(mailOption, function(err, success) {
        if (err) {
          console.log(err);
        }
      }); */


      transporter.sendMail(mailOption, function(err, success) {
        if (err) {
          console.log(err);
        }
      });
      user.secretCode = secretCodeGenerated;
      // Reset token for the user to empty list [] to log out all sessions
      user.sessions = [];
      setData(data);
    }
  }

  return {};
}

/**
  * <authPasswordresetResetV1 -
  * Given a reset code for a user,
  * sets that user's new password to the password provided.
  * Once a reset code has been used, it is then invalidated.
  *
  * @param {string} resetCode - the secret code sent to the user
  * @param {string} newPassword - the new password user want to set
  * @param {string} token - check if the session is valid
  *
  * @returns {}
*/

function authPasswordresetResetV1(resetCode: string, newPassword: string) {
  const data = getData();
  // Check if the token is valid
  if (newPassword.length < 6) {
    throw HTTPError(400, 'The new password is too short');
  }
  // Reset password

  for (const user of data.users) {
    if (user.secretCode === resetCode) {
      const allUsersUser = data.allUsers.find(x => x.password === user.password);
      allUsersUser.password = hash(newPassword);
      user.password = hash(newPassword);
      setData(data);
      return {};
    }
  }
  throw HTTPError(400, 'ResetCode is not a valid reset code');
}

export {
  authLoginV1,
  authRegisterV1,
  authLogoutV1,
  authPasswordresetRequestV1,
  authPasswordresetResetV1,
};

export function hash(plaintext: string) {
  return crypto.createHash('sha256').update(plaintext).digest('hex');
}
export function tokenHasher(token: string) {
  const SECRET = 'sdfgojndnnivoe23034232huroh32irneiwi';
  return hash(token + SECRET);
}

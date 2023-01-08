import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import { channelInviteV1 } from './channel';
import { channelJoinV1 } from './channel';
import { channelLeaveV1 } from './channel';
import { channelAddowner } from './channel';
import { channelRemove } from './channel';
import { authLoginV1, authRegisterV1, authLogoutV1, authPasswordresetRequestV1, authPasswordresetResetV1 } from './auth';
import { dmCreateV1, dmListV1, dmRemoveV1, dmDetailsV1, dmLeaveV1, dmMessagesV1 } from './dm';
import { channelsCreateV1, channelsListV1, channelsListAllV1 } from './channels';
import { userAllV1, userProfileSetnameV1, userProfileSetemailV1, userProfileSethandleV1, userProfileV1, userStatsV1, usersStatsV1, userProfileUploadphotoV1 } from './users';
import { clearV1 } from './other';
import { channelDetailsV1, channelMessagesV1 } from './channel';
import { adminUserRemoveV1, searchV1, notificationsGetV1, adminUserPermissionChangeV1 } from './admin';
import { messageSendV1, messageEditV1, messageRemoveV1, messageSendDmv1, messageReactV1, messageUnreactV1, messagePinV1, messageUnpinV1, messageShareV1 } from './message';
import { messageSendLater } from './message';
import { messageSendLaterdm } from './message';
import { standupStart } from './standUp';
import { standupActive } from './standUp';
import { standupSend } from './standUp';
import request from 'sync-request';
import { getData } from './dataStore';
import fs from 'fs';

import { port, url } from './config.json';
import getImageSize from 'image-size-from-url';
const SERVER_URL = `${url}:${port}`;


// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());

// for logging errors (print to terminal)
app.use(morgan('dev'));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Example get request
app.get('/echo', (req: Request, res: Response, next) => {
  try {
    const data = req.query.echo as string;
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});

// for authLoginV1
app.post('/auth/login/v3', (req: Request, res: Response) => {
  const { email, password } = req.body;
  res.json(authLoginV1(email, password));
});

// for authRegisterV1
app.post('/auth/register/v3', (req: Request, res: Response) => {
  console.log('Registering User');
  const { email, password, nameFirst, nameLast } = req.body;
  const getDefaultImage = request(
    'GET',
    'http://www.traveller.com.au/content/dam/images/h/1/p/q/1/k/image.related.articleLeadwide.620x349.h1pq27.png/1596176460724.jpg'
  );
  const body = getDefaultImage.getBody();
  fs.writeFileSync('src/imgurl/test.jpg', body, { flag: 'w' });
  res.json(authRegisterV1(email, password, nameFirst, nameLast));
});

// for dmCreateV1
app.post('/dm/create/v2', (req: Request, res: Response, next) => {
  console.log('Creating DM');
  const { uIds } = req.body;
  const token = req.header('token');
  res.json(dmCreateV1(token, uIds));
});
// for channelsCreateV1
app.post('/channels/create/v3', (req: Request, res: Response, next) => {
  console.log('Creating Channel');
  const token = req.header('token');
  const { name, isPublic } = req.body;
  res.json(channelsCreateV1(token, name, isPublic));
});
// for channelMessagesV2
app.get('/channel/messages/v3', (req: Request, res: Response, next) => {
  console.log('Showing Messages');
  const token = req.header('token');
  const channelId = parseInt(req.query.channelId as string);
  const start = parseInt(req.query.start as string);
  res.json(channelMessagesV1(token, channelId, start));
});
// for channelDetailsV2
app.get('/channel/details/v3', (req: Request, res: Response, next) => {
  console.log('Showing Channel Details');
  const token = req.header('token');
  const channelId = parseInt(req.query.channelId as string);
  res.json(channelDetailsV1(token, channelId));
});
// for userProfileV1
app.get('/user/profile/v3', (req: Request, res: Response, next) => {
  console.log('Showing User Details');
  const token = req.header('token');
  const uId = parseInt(req.query.uId as string);
  res.json(userProfileV1(token, uId));
});
// for messageSendV1
app.post('/message/send/v2', (req: Request, res: Response, next) => {
  console.log('Sending Message');
  const token = req.header('token');
  const { channelId, message } = req.body;
  res.json(messageSendV1(token, channelId, message));
});
// for messageEditV1
app.put('/message/edit/v2', (req: Request, res: Response, next) => {
  console.log('Editing Message');
  const token = req.header('token');
  const { messageId, message } = req.body;
  res.json(messageEditV1(token, messageId, message));
});
// for messageRemoveV1
app.delete('/message/remove/v2', (req: Request, res: Response, next) => {
  console.log('Removing Message');
  const token = req.header('token');
  const messageId = parseInt(req.query.messageId as string);
  res.json(messageRemoveV1(token, messageId));
});
// for messageSendDmv1
app.post('/message/senddm/v2', (req: Request, res: Response, next) => {
  console.log('Sending DM');
  const token = req.header('token');
  const { dmId, message } = req.body;
  res.json(messageSendDmv1(token, dmId, message));
});
// for messageShareV1
app.post('/message/share/v1', (req: Request, res: Response, next) => {
  console.log('Sharing Message');
  const token = req.header('token');
  const { ogMessageId, message, channelId, dmId } = req.body;
  res.json(messageShareV1(token, ogMessageId, message, channelId, dmId));
});
// for messageReactV1
app.post('/message/react/v1', (req: Request, res: Response, next) => {
  console.log('Reacting to Message');
  const token = req.header('token');
  const { messageId, reactId } = req.body;
  res.json(messageReactV1(token, messageId, reactId));
});
// for messageUnreactV1
app.post('/message/unreact/v1', (req: Request, res: Response, next) => {
  console.log('Unreacting to Message');
  const token = req.header('token');
  const { messageId, reactId } = req.body;
  res.json(messageUnreactV1(token, messageId, reactId));
});

app.post('/message/unreact/v1', (req: Request, res: Response, next) => {
  console.log('Unreacting to Message');
  const token = req.header('token');
  const { messageId, reactId } = req.body;
  res.json(messageUnreactV1(token, messageId, reactId));
});

// for messagePinV1
app.post('/message/pin/v1', (req: Request, res: Response, next) => {
  console.log('Pinning Message');
  const token = req.header('token');
  const { messageId } = req.body;
  res.json(messagePinV1(token, messageId));
});
// for messageUnpin/v1
app.post('/message/unpin/v1', (req: Request, res: Response, next) => {
  console.log('Pinning Messag1e');
  const token = req.header('token');
  const { messageId } = req.body;
  res.json(messageUnpinV1(token, messageId));
});
// for clearV1
app.delete('/clear/v1', (req: Request, res: Response, next) => {
  console.log('Clearing Data');
  res.json(clearV1());
});
// for dmListV1
app.get('/dm/list/v2', (req: Request, res: Response) => {
  console.log('Listing DMs');
  const token = req.header('token');
  res.json(dmListV1(token));
});
// for dmRemoveV1
app.delete('/dm/remove/v2', (req: Request, res: Response) => {
  console.log('Removing from DM');
  const token = req.header('token');
  const { dmId } = req.query;
  res.json(dmRemoveV1(token, parseInt(dmId)));
});
// for dmDetailsV1
app.get('/dm/details/v2', (req: Request, res: Response) => {
  console.log('Details of DM');
  const token = req.header('token');
  const { dmId } = req.query;
  res.json(dmDetailsV1(token, parseInt(dmId)));
});
// for dmLeaveV1
app.post('/dm/leave/v2', (req: Request, res: Response) => {
  console.log('Leaving DM');
  const token = req.header('token');
  const { dmId } = req.body;
  res.json(dmLeaveV1(token, dmId));
});
// for dmMessagesV1
app.get('/dm/messages/v2', (req: Request, res: Response) => {
  console.log('dm messages');
  const token = req.header('token');
  const { dmId, start } = req.query;
  res.json(dmMessagesV1(token, parseInt(dmId), parseInt(start)));
});
// auth/logout/v1 post request

app.post('/auth/logout/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  console.log('Log user out');
  res.json(authLogoutV1(token));
});
// users/all/v1 get request
app.get('/users/all/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  console.log('Get all users information');
  res.json(userAllV1(token));
}
);

// user/stats/v1 get request
app.get('/user/stats/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  res.json(userStatsV1(token));
}
);

// users/stats/v1 get request
app.get('/users/stats/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  res.json(usersStatsV1(token));
}
);

// user/profile/setname/v1 put request
app.put('/user/profile/setname/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { nameFirst, nameLast } = req.body;
  // console.log('Reset user name');
  res.json(userProfileSetnameV1(token, nameFirst, nameLast));
});

// user/profile/setemail/v1 put request
app.put('/user/profile/setemail/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { email } = req.body;
  // console.log('Reset user email');
  res.json(userProfileSetemailV1(token, email));
});

// user/profile/sethandle/v1 put request
app.put('/user/profile/sethandle/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { handleStr } = req.body;
  console.log('Reset user handle string');
  res.json(userProfileSethandleV1(token, handleStr));
});

// for channelLeaveV1 functions
app.post('/channel/leave/v2', (req: Request, res: Response, next) => {
  console.log('Leaving Channel');
  const token = req.header('token');
  const { channelId } = req.body;
  res.json(channelLeaveV1(token, channelId));
});

// for channeladdownerV1 funcion
app.post('/channel/addowner/v2', (req: Request, res: Response, next) => {
  console.log('Adding Owner');
  const token = req.header('token');
  const { channelId, uId } = req.body;
  res.json(channelAddowner(token, channelId, uId));
});

// for channelLeaveV1 functions
app.post('/channel/removeowner/v2', (req: Request, res: Response, next) => {
  console.log('Removing Owner');
  const token = req.header('token');
  const { channelId, uId } = req.body;
  res.json(channelRemove(token, channelId, uId));
});

// for /channel/join/v2 functions
app.post('/channel/join/v3', (req: Request, res: Response, next) => {
  console.log('Join Channel');
  const token = req.header('token');
  const { channelId } = req.body;
  res.json(channelJoinV1(token, channelId));
});

// for /channel/invite/v2 functions
app.post('/channel/invite/v3', (req: Request, res: Response, next) => {
  console.log('Invite Channel');
  const token = req.header('token');
  const { channelId, uId } = req.body;
  res.json(channelInviteV1(token, channelId, uId));
});

// for channels/list/v2 functions
app.get('/channels/list/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  res.json(channelsListV1(token));
});

// for channels/list/v2 functions
app.get('/channels/listall/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  res.json(channelsListAllV1(token));
});

// for messageSendlater
app.post('/message/sendlater/v1', (req: Request, res: Response, next) => {
  console.log('Sending Message later');
  const token = req.header('token');
  const { channelId, message, timeSent } = req.body;
  res.json(messageSendLater(token, channelId, message, timeSent));
});

// for messageSendDmv1
app.post('/message/sendlaterdm/v1', (req: Request, res: Response, next) => {
  console.log('Sending DM later');
  const token = req.header('token');
  const { dmId, message, timeSent } = req.body;
  res.json(messageSendLaterdm(token, dmId, message, timeSent));
});

// standup/start/v1
app.post('/standup/start/v1', (req: Request, res: Response, next) => {
  console.log('standup start');
  const token = req.header('token');
  const { channelId, length } = req.body;
  res.json(standupStart(token, channelId, length));
});

// standup/active/v1
app.get('/standup/active/v1', (req: Request, res: Response, next) => {
  console.log('get status during standup period');
  const token = req.header('token');
  const channelId = parseInt(req.query.channelId as string);
  res.json(standupActive(token, channelId));
});

// standup/send/v1
app.post('/standup/send/v1', (req: Request, res: Response, next) => {
  console.log('send message during the standup period ');
  const token = req.header('token');
  const { channelId, message } = req.body;
  res.json(standupSend(token, channelId, message));
});

// for admin/user/remove/v1 functions
app.delete('/admin/user/remove/v1', (req: Request, res: Response) => {
  console.log('Removing user');
  const token = req.header('token');
  const { uId } = req.query;
  res.json(adminUserRemoveV1(token, parseInt(uId)));
});

// for search/v1 functions
app.get('/search/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { queryStr } = req.query;
  res.json(searchV1(token, queryStr));
});

// for notifications/get/v1 functions
app.get('/notifications/get/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  res.json(notificationsGetV1(token));
});

// for admin/userpermission/change/v1 functions
app.post('/admin/userpermission/change/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { uId, permissionId } = req.body;
  res.json(adminUserPermissionChangeV1(token, parseInt(uId), parseInt(permissionId)));
});
// for user/profile/uploadphoto/v1
app.post('/user/profile/uploadphoto/v1', (req: Request, res: Response) => {
  const { imgUrl, xStart, yStart, xEnd, yEnd } = req.body;
  const data = getData();
  const token = req.header('token');
  res.json(userProfileUploadphotoV1(token, imgUrl, parseInt(xStart), parseInt(yStart), parseInt(xEnd), parseInt(yEnd)));
  let newImageUrl;
  for (const user of data.users) {
    if (user.sessions.find(t => t === token)) {
      newImageUrl = user.profileImgUrl;
    }
  }
  const getDefaultImage = request(
    'GET',
    newImageUrl
  );
  const body = getDefaultImage.getBody();
  fs.writeFileSync('src/imgurl/test.jpg', body, { flag: 'w' });
});


// auth/passwordreset/request/v1
app.post('/auth/passwordreset/request/v1', (req: Request, res: Response, next) => {
  const email = req.body;
  res.json(authPasswordresetRequestV1(email));
});

// auth/passwordreset/reset/v1
app.post('auth/passwordreset/reset/v1', (req: Request, res: Response, next) => {
  const { resetCode, newPassword } = req.body;
  res.json(authPasswordresetResetV1(resetCode, newPassword));
});

// handles errors nicely
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});

import request from 'sync-request';
import { port, url } from './config.json';
import { hash, tokenHasher } from './auth';

const OK = 200;
const INPUT_ERROR = 400;
const FORBIDDEN = 403;
const SERVER_URL = `${url}:${port}`;

describe('testing /user/profile/v3', () => {
  let user1, user2;
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/clear/v1',
      { qs: {} }
    );

    const createUser = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'validemail@gmail.com',
          password: '1ewwefw43#$#',
          nameFirst: 'John',
          nameLast: 'Smith'
        }
      }
    );
    user1 = JSON.parse(createUser.getBody() as string);

    const createUser2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'validemail1@gmail.com',
          password: 'abcdeFgaje1234',
          nameFirst: 'Billy',
          nameLast: 'Jones'
        }
      }
    );
    user2 = JSON.parse(createUser2.getBody() as string);
  });

  test('test for successful userProfileV1 on self', () => {
    const res = request(
      'GET',
      SERVER_URL + '/user/profile/v3',
      {
        headers: {
          token: user1.token
        },
        qs: {
          uId: user1.authUserId
        }
      }
    );
    const result = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(result.user).toEqual({ uId: user1.authUserId, email: 'validemail@gmail.com', nameFirst: 'John', nameLast: 'Smith', handleStr: 'johnsmith', profileImgUrl: SERVER_URL + 'src/imgurl/test.jpg' });
  });

  test('test for successful userProfileV1 on another', () => {
    const res = request(
      'GET',
      SERVER_URL + '/user/profile/v3',
      {
        headers: {
          token: user2.token
        },
        qs: {
          uId: user1.authUserId
        }
      }
    );
    const result = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(result.user).toEqual({ uId: user1.authUserId, email: 'validemail@gmail.com', nameFirst: 'John', nameLast: 'Smith', handleStr: 'johnsmith', profileImgUrl: SERVER_URL + 'src/imgurl/test.jpg' });
  });

  test('test for invalid uId', () => {
    const res = request(
      'GET',
      SERVER_URL + '/user/profile/v3',
      {
        headers: {
          token: user1.token
        },
        qs: {
          uId: -999
        }
      }
    );
    expect(res.statusCode).toBe(INPUT_ERROR);
  });

  test('test for invalid token', () => {
    const res = request(
      'GET',
      SERVER_URL + '/user/profile/v3',
      {
        headers: {
          token: '-9999'
        },
        qs: {
          uId: user1.authUserId
        }
      }
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });
  test('test for both invalid', () => {
    const res = request(
      'GET',
      SERVER_URL + '/user/profile/v3',
      {
        headers: {
          token: '-9999'
        },
        qs: {
          uId: -999
        }
      }
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });
});

describe('testing /users/all/v2', () => {
  let user1, user2, user3;
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/clear/v1',
      { qs: {} }
    );

    const createUser1 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'valid1@gmail.com',
          password: '123abc!@#',
          nameFirst: 'User',
          nameLast: 'One'
        }
      }
    );
    user1 = JSON.parse(createUser1.getBody() as string);

    const createUser2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'valid2@gmail.com',
          password: '456efg!@#',
          nameFirst: 'User',
          nameLast: 'Two'
        }
      }
    );
    user2 = JSON.parse(createUser2.getBody() as string);

    const createUser3 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'valid3@gmail.com',
          password: '789hij!@#',
          nameFirst: 'User',
          nameLast: 'Three'
        }
      }
    );
    user3 = JSON.parse(createUser3.getBody() as string);
  });

  test('test for invalid token', () => {
    const res = request(
      'GET',
      SERVER_URL + '/users/all/v2',
      {
        headers: {
          token: '-9999999999',
        },
        qs: {
        }
      }
    );
    expect(res.statusCode).toBe(403);
  });

  test('test for successful case', () => {
    const details = request(
      'GET',
      SERVER_URL + '/users/all/v2',
      {
        headers: {
          token: user1.token,
        },
        qs: {
        }
      }
    );
    const detailResult = JSON.parse(details.getBody() as string);

    const expectedAllUsersDetails = [{
      uId: user1.authUserId,
      email: 'valid1@gmail.com',
      password: hash('123abc!@#'),
      nameFirst: 'User',
      nameLast: 'One',
      handleStr: 'userone',
      permissionId: 1,
      sessions: [user1.token],
      hashSessions: [tokenHasher(user1.token)],
      profileImgUrl: SERVER_URL + 'src/imgurl/test.jpg',
      notifications: []
    }, {
      uId: user2.authUserId,
      email: 'valid2@gmail.com',
      password: hash('456efg!@#'),
      nameFirst: 'User',
      nameLast: 'Two',
      handleStr: 'usertwo',
      permissionId: 2,
      sessions: [user2.token],
      hashSessions: [tokenHasher(user2.token)],
      profileImgUrl: SERVER_URL + 'src/imgurl/test.jpg',
      notifications: []
    }, {
      uId: user3.authUserId,
      email: 'valid3@gmail.com',
      password: hash('789hij!@#'),
      nameFirst: 'User',
      nameLast: 'Three',
      handleStr: 'userthree',
      permissionId: 2,
      sessions: [user3.token],
      hashSessions: [tokenHasher(user3.token)],
      profileImgUrl: SERVER_URL + 'src/imgurl/test.jpg',
      notifications: []
    }];
    const expectedAllMembersSet = new Set(expectedAllUsersDetails);
    const resultAllMemberSet = new Set(detailResult.users);
    expect(resultAllMemberSet).toStrictEqual(expectedAllMembersSet);
  });
});

describe('testing /user/profile/setname/v1', () => {
  let user;
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/clear/v1',
      { qs: {} }
    );

    const createUser = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'valid@gmail.com',
          password: '123abc!@#',
          nameFirst: 'Tom',
          nameLast: 'Holland',
          profileImgUrl: SERVER_URL + 'src/imgurl/test.jpg',
        }
      }
    );
    user = JSON.parse(createUser.getBody() as string);
  });

  test('test for invalid token', () => {
    const res = request(
      'PUT',
      SERVER_URL + '/user/profile/setname/v2',
      {
        headers: {
          token: '-99999999'
        },
        json: {
          nameFirst: 'In',
          nameLast: 'Valid'
        }
      });
    expect(res.statusCode).toBe(403);
  });

  test('test for invalid Last name', () => {
    const res = request(
      'PUT',
      SERVER_URL + '/user/profile/setname/v2',
      {
        headers: {
          token: user.token
        },
        json: {
          nameFirst: 'In',
          nameLast: ''
        }
      });
    expect(res.statusCode).toBe(400);
  });

  test('test for invalid first name', () => {
    const res = request(
      'PUT',
      SERVER_URL + '/user/profile/setname/v2',
      {
        headers: {
          token: user.token
        },
        json: {
          nameFirst: '',
          nameLast: 'Valid'
        }
      });
    expect(res.statusCode).toBe(400);
  });

  test('test for successful change name', () => {
    request(
      'PUT',
      SERVER_URL + '/user/profile/setname/v2',
      {
        headers: {
          token: user.token
        },
        json: {
          nameFirst: 'Zen',
          nameLast: 'Daya'
        }
      });

    const details = request(
      'GET',
      SERVER_URL + '/user/profile/v3',
      {
        headers: {
          token: user.token
        },
        qs: {
          uId: user.authUserId
        }
      }
    );

    const detailResult = JSON.parse(details.getBody() as string);
    const expectedAllUsersDetails = [{
      user: {
        uId: user.authUserId,
        email: 'valid@gmail.com',
        nameFirst: 'Zen',
        nameLast: 'Daya',
        handleStr: 'tomholland',
        profileImgUrl: SERVER_URL + 'src/imgurl/test.jpg',
      }
    }];
    const expectedAllMembersSet = new Set(expectedAllUsersDetails);
    const resultAllMemberSet = new Set([detailResult]);
    expect(resultAllMemberSet).toStrictEqual(expectedAllMembersSet);
  });
});

describe('testing /user/profile/setemail/v2', () => {
  let user;
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/clear/v1',
      { qs: {} }
    );

    const createUser = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'valid@gmail.com',
          password: '123abc!@#',
          nameFirst: 'Tom',
          nameLast: 'Holland'
        }
      }
    );
    user = JSON.parse(createUser.getBody() as string);
  });

  test('test for invalid token', () => {
    const res = request(
      'PUT',
      SERVER_URL + '/user/profile/setemail/v2',
      {
        headers: {
          token: '-99999999'
        },
        json: {
          email: 'invalid@gmail.com'
        }
      });
    expect(res.statusCode).toBe(403);
  });

  test('test for invalid email', () => {
    const res = request(
      'PUT',
      SERVER_URL + '/user/profile/setemail/v2',
      {
        headers: {
          token: user.token
        },
        json: {
          email: 'invalidgmailcom'
        }
      });

    expect(res.statusCode).toBe(400);
  });

  test('test for email that is in use', () => {
    const res = request(
      'PUT',
      SERVER_URL + '/user/profile/setemail/v2',
      {
        headers: {
          token: user.token
        },
        json: {
          email: 'valid@gmail.com'
        }
      });
      // expect(res.statusCode).toStrictEqual(400);
    expect(res.statusCode).toBe(400);
  });

  test('test for successful change email', () => {
    request(
      'PUT',
      SERVER_URL + '/user/profile/setemail/v2',
      {
        headers: {
          token: user.token
        },
        json: {
          email: 'newaddress@gmail.com'
        }
      });

    const details = request(
      'GET',
      SERVER_URL + '/user/profile/v3',
      {
        headers: {
          token: user.token
        },
        qs: {
          uId: user.authUserId
        }
      }
    );

    const detailResult = JSON.parse(details.getBody() as string);
    const expectedAllUsersDetails =
    [{
      user: {
        uId: user.authUserId,
        email: 'newaddress@gmail.com',
        nameFirst: 'Tom',
        nameLast: 'Holland',
        handleStr: 'tomholland',
        profileImgUrl: SERVER_URL + 'src/imgurl/test.jpg',
      }
    }];
    const expectedAllMembersSet = new Set(expectedAllUsersDetails);
    const resultAllMemberSet = new Set([detailResult]);
    expect(resultAllMemberSet).toStrictEqual(expectedAllMembersSet);
  });
});

describe('testing /user/profile/sethandle/v2', () => {
  let user;
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/clear/v1',
      { qs: {} }
    );

    const createUser = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'valid@gmail.com',
          password: '123abc!@#',
          nameFirst: 'Tom',
          nameLast: 'Holland'
        }
      }
    );
    user = JSON.parse(createUser.getBody() as string);
  });

  test('test for invalid token', () => {
    const res = request(
      'PUT',
      SERVER_URL + '/user/profile/sethandle/v2',
      {
        headers: {
          token: '-999'
        },
        json: {
          handleStr: 'tomhollandzenda'
        }
      });
    expect(res.statusCode).toBe(403);
  });

  test('test for invalid handleStr', () => {
    const res = request(
      'PUT',
      SERVER_URL + '/user/profile/sethandle/v2',
      {
        headers: {
          token: user.token
        },
        json: {
          handleStr: '*&^%$'
        }
      });
    expect(res.statusCode).toBe(400);
  });

  test('test for handleStr that is in use', () => {
    const res = request(
      'PUT',
      SERVER_URL + '/user/profile/sethandle/v2',
      {
        headers: {
          token: user.token
        },
        json: {
          handleStr: 'tomholland'
        }
      });
    expect(res.statusCode).toBe(400);
  });

  test('test for successful change handleStr', () => {
    request(
      'PUT',
      SERVER_URL + '/user/profile/sethandle/v2',
      {
        headers: {
          token: user.token
        },
        json: {
          handleStr: 'zendaya'
        }
      });

    const details = request(
      'GET',
      SERVER_URL + '/user/profile/v3',
      {
        headers: {
          token: user.token
        },
        qs: {
          uId: user.authUserId
        }
      }
    );

    const detailResult = JSON.parse(details.getBody() as string);
    const expectedAllUsersDetails =
    [{
      user: {
        uId: user.authUserId,
        email: 'valid@gmail.com',
        nameFirst: 'Tom',
        nameLast: 'Holland',
        handleStr: 'zendaya',
        profileImgUrl: SERVER_URL + 'src/imgurl/test.jpg',
      }
    }];
    const expectedAllMembersSet = new Set(expectedAllUsersDetails);
    const resultAllMemberSet = new Set([detailResult]);
    expect(resultAllMemberSet).toStrictEqual(expectedAllMembersSet);
  });
});

describe('testing /user/stats/v1', () => {
  let user1;
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/clear/v1',
      { qs: {} }
    );

    const createUser1 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'valid1@gmail.com',
          password: '123abc!@#',
          nameFirst: 'User',
          nameLast: 'One'
        }
      }
    );
    user1 = JSON.parse(createUser1.getBody() as string);

    const createUser2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'valid2@gmail.com',
          password: '456efg!@#',
          nameFirst: 'User',
          nameLast: 'Two'
        }
      }
    );
    JSON.parse(createUser2.getBody() as string);

    const createUser3 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'valid3@gmail.com',
          password: '789hij!@#',
          nameFirst: 'User',
          nameLast: 'Three'
        }
      }
    );
    JSON.parse(createUser3.getBody() as string);
    const createChannel = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user1.token,
        },
        json: {
          name: 'My Channel',
          isPublic: true
        }
      }
    );
    const channel1 = JSON.parse(createChannel.getBody() as string).channelId;

    /* const dmCreate = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        headers: {
          token: user1.token,
        },
        json: {
          uIds: [user2.authUserId, user3.authUserId],
        }
      }
    );
    const dm1 = JSON.parse(dmCreate.getBody() as string);
    */

    const res = request(
      'POST',
      SERVER_URL + '/message/send/v2',
      {
        headers: {
          token: user1.token
        },
        json: {
          channelId: channel1,
          message: 'Hello'
        }
      }
    );
    JSON.parse(res.getBody() as string);
  });

  test('test for invalid token', () => {
    const res = request(
      'GET',
      SERVER_URL + '/user/stats/v1',
      {
        headers: {
          token: '-9999999999',
        },
        qs: {
        }
      }
    );
    expect(res.statusCode).toBe(403);
  });

  test('test for successful case', () => {
    const details = request(
      'GET',
      SERVER_URL + '/user/stats/v1',
      {
        headers: {
          token: user1.token,
        },
        qs: {
        }
      }
    );
    const detailResult = JSON.parse(details.getBody() as string);
    const numChannelsJoined = 1;
    const numDmsJoined = 0;
    const numMessagesSent = 1;
    const involvementRate = 1;
    // Get current time in seconds
    const getTimeStamp = () => Math.floor(Date.now() / 1000);
    const timeStamp = getTimeStamp();
    expect(details.statusCode).toBe(OK);
    expect(detailResult).toStrictEqual(

      {
        userStats: {
          channelsJoined: [{ numChannelsJoined, timeStamp }],
          dmsJoined: [{ numDmsJoined, timeStamp }],
          messagesSent: [{ numMessagesSent, timeStamp }],
          involvementRate
        }
      });
  });
});

describe('testing users/stats/v1', () => {
  let user1;
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/clear/v1',
      { qs: {} }
    );

    const createUser1 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'valid1@gmail.com',
          password: '123abc!@#',
          nameFirst: 'User',
          nameLast: 'One'
        }
      }
    );
    user1 = JSON.parse(createUser1.getBody() as string);

    const createUser2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'valid2@gmail.com',
          password: '456efg!@#',
          nameFirst: 'User',
          nameLast: 'Two'
        }
      }
    );
    JSON.parse(createUser2.getBody() as string);

    const createUser3 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'valid3@gmail.com',
          password: '789hij!@#',
          nameFirst: 'User',
          nameLast: 'Three'
        }
      }
    );
    JSON.parse(createUser3.getBody() as string);
    const createChannel = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user1.token,
        },
        json: {
          name: 'My Channel',
          isPublic: true
        }
      }
    );
    const channel1 = JSON.parse(createChannel.getBody() as string).channelId;

    /* const dmCreate = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        headers: {
          token: user1.token,
        },
        json: {
          uIds: [user2.authUserId, user3.authUserId],
        }
      }
    );
    const dm1 = JSON.parse(dmCreate.getBody() as string);
    */

    const res = request(
      'POST',
      SERVER_URL + '/message/send/v2',
      {
        headers: {
          token: user1.token
        },
        json: {
          channelId: channel1,
          message: 'Hello'
        }
      }
    );
    JSON.parse(res.getBody() as string);
  });

  test('test for invalid token', () => {
    const res = request(
      'GET',
      SERVER_URL + '/users/stats/v1',
      {
        headers: {
          token: '-9999999999',
        },
        qs: {
        }
      }
    );
    expect(res.statusCode).toBe(403);
  });

  test('test for successful case', () => {
    const details = request(
      'GET',
      SERVER_URL + '/users/stats/v1',
      {
        headers: {
          token: user1.token,
        },
        qs: {
        }
      }
    );
    const detailResult = JSON.parse(details.getBody() as string);
    const numChannels = 1;
    const numDms = 0;
    const numMsgs = 1;
    const utilizationRate = 1 / 3;
    // Get current time in seconds
    const getTimeStamp = () => Math.floor(Date.now() / 1000);
    const timeStamp = getTimeStamp();
    expect(details.statusCode).toBe(OK);
    expect(detailResult).toEqual(
      {
        workspaceStats: {
<<<<<<< HEAD
          channelsExist: [{ numChannels, timeStamp }],
          dmsExist: [{ numDms, timeStamp }],
          messagesExist: [{ numMsgs, timeStamp }],
=======
          channelsExist: [{ numChannels, timeStamp: expect.any(Number) }],
          dmsExist: [{ numDms, timeStamp: expect.any(Number) }],
          messagesExist: [{ numMsgs, timeStamp: expect.any(Number) }],
>>>>>>> 51d4ff4afd758011343ad8680b8d282100b33c75
          utilizationRate
        }
      });
  });
});

describe('testing /user/profile/uploadphoto/v1', () => {
  let user;
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/clear/v1',
      { qs: {} }
    );

    const createUser = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'valid@gmail.com',
          password: '123abc!@#',
          nameFirst: 'Tom',
          nameLast: 'Holland'
        }
      }
    );
    user = JSON.parse(createUser.getBody() as string);
  });

  // test('test for invalid url', () => {
  //   const res = request(
  //     'POST',
  //     SERVER_URL + '/user/profile/uploadphoto/v1',
  //     {
  //       headers: {
  //         token: user.token,
  //       },
  //       json: {
  //         imgUrl: 'http://www.traveller.com.au/content/dam/images/h/1/p/q/1/k/image.related.articleLeadwide.620x3460724.jpg',
  //         xStart: 10,
  //         yStart: 10,
  //         xEnd: 20,
  //         yEnd: 20
  //       }
  //     });
  //   expect(res.statusCode).toBe(400);
  // });

  test('test for the image is not in jpg format', () => {
    const res = request(
      'POST',
      SERVER_URL + '/user/profile/uploadphoto/v1',
      {
        headers: {
          token: user.token,
        },
        json: {
          imgUrl: 'http://fileinfo.com/img/ss/xl/png_79.png',
          xStart: 10,
          yStart: 10,
          xEnd: 20,
          yEnd: 20
        }
      });
    expect(res.statusCode).toBe(400);
  });

  test('test for invalid token', () => {
    const res = request(
      'POST',
      SERVER_URL + '/user/profile/uploadphoto/v1',
      {
        headers: {
          token: '-888888',
        },
        json: {
          imgUrl: 'http://www.traveller.com.au/content/dam/images/h/1/p/q/1/k/image.related.articleLeadwide.620x349.h1pq27.png/1596176460724.jpg',
          xStart: 10,
          yStart: 10,
          xEnd: 20,
          yEnd: 20
        }
      });
    expect(res.statusCode).toBe(403);
  });

  test('test for xEnd is less than or equal to xStart or yEnd is less than or equal to yStart', () => {
    const res = request(
      'POST',
      SERVER_URL + '/user/profile/uploadphoto/v1',
      {
        headers: {
          token: user.token,
        },
        json: {
          imgUrl: 'http://www.traveller.com.au/content/dam/images/h/1/p/q/1/k/image.related.articleLeadwide.620x349.h1pq27.png/1596176460724.jpg',
          xStart: 10,
          yStart: 10,
          xEnd: 5,
          yEnd: 5
        }
      });
    expect(res.statusCode).toBe(400);
  });

  // test('test for any of xStart, yStart, xEnd, yEnd are not within the dimensions of the image at the URL', () => {
  //   const res = request(
  //     'POST',
  //     SERVER_URL + '/user/profile/uploadphoto/v1',
  //     {
  //       headers: {
  //         token: user.token,
  //       },
  //       json: {
  //         imgUrl: 'http://www.traveller.com.au/content/dam/images/h/1/p/q/1/k/image.related.articleLeadwide.620x349.h1pq27.png/1596176460724.jpg',
  //         xStart: 10,
  //         yStart: 10,
  //         xEnd: 20,
  //         yEnd: 200000000000
  //       }
  //     });
  //   expect(res.statusCode).toBe(400);
  // });
})
;

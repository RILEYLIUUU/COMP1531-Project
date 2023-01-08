import request from 'sync-request';
import config from './config.json';

const OK = 200;
const INPUT_ERROR = 400;
const FORBIDDEN = 403;
const port = config.port;
const url = config.url;
const SERVER_URL = `${url}:${port}`;

// test for channnel join v2 functions
describe('test for /channel/join/V2 ', () => {
  let user1, user2, user3, channel1, channel2, channel3;

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
          email: 'rileyliu@gmail.com',
          password: '73bgdu#$#',
          nameFirst: 'Riley',
          nameLast: 'Liu'
        }
      }
    );
    user1 = JSON.parse(createUser.getBody() as string);

    const createUser2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'millizhao@gmail.com',
          password: '8kkk373',
          nameFirst: 'Milli',
          nameLast: 'zhao'
        }
      }
    );
    user2 = JSON.parse(createUser2.getBody() as string);

    const createUser3 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'rebeccazhao@gmail.com',
          password: '3738947',
          nameFirst: 'Rebecca',
          nameLast: 'zhao'
        }
      }
    );
    user3 = JSON.parse(createUser3.getBody() as string);

    const createChannel = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user1.token,
        },
        json: {
          name: 'Channel1',
          isPublic: false
        }
      }
    );
    channel1 = JSON.parse(createChannel.getBody() as string).channelId;

    const createChannel2 = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user2.token,
        },
        json: {
          name: 'Channel2',
          isPublic: true
        }
      }
    );
    channel2 = JSON.parse(createChannel2.getBody() as string).channelId;

    const createChannel3 = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user3.token,
        },
        json: {
          name: 'Channel3',
          isPublic: false
        }
      }
    );
    channel3 = JSON.parse(createChannel3.getBody() as string).channelId;
  });

  test('Test for channelId is not valid', () => {
    const res = request(
      'POST',
      SERVER_URL + '/channel/join/v3',
      {
        headers: {
          token: user1.token,
        },
        json: {
          channelId: -99999,
        }
      }
    );
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Test for token is not valid', () => {
    const res = request(
      'POST',
      SERVER_URL + '/channel/join/v3',
      {
        headers: {
          token: '-938838383737',
        },
        json: {
          channelId: channel1,
        }
      }
    );
    expect(res.statusCode).toStrictEqual(403);
  });

  test('Test for authorised user is already a member of the channel', () => {
    const res = request(
      'POST',
      SERVER_URL + '/channel/join/v3',
      {
        headers: {
          token: user2.token,
        },
        json: {
          channelId: channel2,
        }
      }
    );
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Test for private channnel and token was not a member of the channel and not global owner', () => {
    const res = request(
      'POST',
      SERVER_URL + '/channel/join/v3',
      {
        headers: {
          token: user2.token,
        },
        json: {
          channelId: channel3,
        }
      }
    );
    expect(res.statusCode).toStrictEqual(403);
  });

  test('Test for sucessful channel/joint/v2 functions', () => {
    request(
      'POST',
      SERVER_URL + '/channel/join/v3',
      {
        headers: {
          token: user3.token,
        },
        json: {
          channelId: channel2,
        }
      }
    );

    const details = request(
      'GET',
      SERVER_URL + '/channel/details/v3',
      {
        headers: {
          token: user2.token
        },
        qs: {
          channelId: channel2,
        }
      }
    );

    const detailResult = JSON.parse(details.getBody() as string);

    expect(detailResult.name).toStrictEqual('Channel2');
    expect(detailResult.isPublic).toStrictEqual(true);

    const expectedOwners = [
      {
        uId: user2.authUserId,
        email: 'millizhao@gmail.com',
        nameFirst: 'Milli',
        nameLast: 'zhao',
        handleStr: 'millizhao',
        profileImgUrl: 'http://127.0.0.1:1336src/imgurl/test.jpg',

      },
    ];
    const expectedOwnersSet = new Set(expectedOwners);
    const resultOwnersSet = new Set(detailResult.ownerMembers);
    expect(resultOwnersSet).toStrictEqual(expectedOwnersSet);

    const expectedAllMembers = [
      {
        uId: user2.authUserId,
        email: 'millizhao@gmail.com',
        nameFirst: 'Milli',
        nameLast: 'zhao',
        handleStr: 'millizhao',
        profileImgUrl: 'http://127.0.0.1:1336src/imgurl/test.jpg',

      },
      {
        uId: user3.authUserId,
        email: 'rebeccazhao@gmail.com',
        nameFirst: 'Rebecca',
        nameLast: 'zhao',
        handleStr: 'rebeccazhao',
        profileImgUrl: 'http://127.0.0.1:1336src/imgurl/test.jpg',
      },
    ];
    const expectedAllMembersSet = new Set(expectedAllMembers);
    const resultAllMemberSet = new Set(detailResult.allMembers);
    expect(resultAllMemberSet).toStrictEqual(expectedAllMembersSet);
  });
});

describe('test for /channel/invite/V2 ', () => {
  let user1, user2, user3, channel1, channel2;

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
          email: 'rileyliu@gmail.com',
          password: '73bgdu#$#',
          nameFirst: 'Riley',
          nameLast: 'Liu'
        }
      }
    );
    user1 = JSON.parse(createUser.getBody() as string);

    const createUser2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'millizhao@gmail.com',
          password: '8kkk373',
          nameFirst: 'Milli',
          nameLast: 'zhao'
        }
      }
    );
    user2 = JSON.parse(createUser2.getBody() as string);

    const createUser3 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'rebeccazhao@gmail.com',
          password: '12637362828jkjk',
          nameFirst: 'Rebecca',
          nameLast: 'zhao'
        }
      }
    );
    user3 = JSON.parse(createUser3.getBody() as string);

    const createChannel = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user1.token,
        },
        json: {
          token: user1.token,
          name: 'Channel1',
          isPublic: true
        }
      }
    );
    channel1 = JSON.parse(createChannel.getBody() as string).channelId;

    const createChannel2 = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user2.token,
        },
        json: {
          name: 'Channel2',
          isPublic: true
        }
      }
    );
    channel2 = JSON.parse(createChannel2.getBody() as string).channelId;
  });

  test('Test for channelId is not valid', () => {
    const res = request(
      'POST',
      SERVER_URL + '/channel/invite/v3',
      {
        headers: {
          token: user1.token,
        },
        json: {
          channelId: -99999,
          uId: user2.authUserId
        }
      }
    );
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Test for token is not valid', () => {
    const res = request(
      'POST',
      SERVER_URL + '/channel/invite/v3',
      {
        headers: {
          token: '12ele12112313',
        },
        json: {
          channelId: channel1,
          uId: user2.authUserId
        }
      }
    );
    expect(res.statusCode).toStrictEqual(403);
  });

  test('Test for authorised user is not a member of the channel', () => {
    const res = request(
      'POST',
      SERVER_URL + '/channel/invite/v3',
      {
        headers: {
          token: user2.token,
        },
        json: {
          channelId: channel1,
          uId: user1.authUserId
        }
      }
    );
    expect(res.statusCode).toStrictEqual(403);
  });

  test('Test for uId is not valid', () => {
    const res = request(
      'POST',
      SERVER_URL + '/channel/invite/v3',
      {
        headers: {
          token: user1.token,
        },
        json: {
          channelId: channel1,
          uId: -9999999
        }
      }
    );
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Test for uId is already a memeber of channel ', () => {
    request(
      'POST',
      SERVER_URL + '/channel/join/v3',
      {
        headers: {
          token: user2.token,
        },
        json: {
          channelId: channel1,
        }
      }
    );

    const res = request(
      'POST',
      SERVER_URL + '/channel/invite/v3',
      {
        headers: {
          token: user1.token,
        },
        json: {
          channelId: channel1,
          uId: user2.authUserId
        }
      }
    );
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Test for sucessful channel/invite/v2 functions', () => {
    request(
      'POST',
      SERVER_URL + '/channel/invite/v3',
      {
        headers: {
          token: user2.token,
        },
        json: {
          channelId: channel2,
          uId: user1.authUserId
        }
      }
    );

    request(
      'POST',
      SERVER_URL + '/channel/invite/v3',
      {
        headers: {
          token: user2.token,
        },
        json: {
          channelId: channel2,
          uId: user3.authUserId
        }
      }
    );

    const details = request(
      'GET',
      SERVER_URL + '/channel/details/v3',
      {
        headers: {
          token: user2.token
        },
        qs: {
          channelId: channel2,
        }
      }
    );

    const detailResult = JSON.parse(details.getBody() as string);

    expect(detailResult.name).toStrictEqual('Channel2');
    expect(detailResult.isPublic).toStrictEqual(true);

    const expectedOwners = [
      {
        uId: user2.authUserId,
        email: 'millizhao@gmail.com',
        nameFirst: 'Milli',
        nameLast: 'zhao',
        handleStr: 'millizhao',
        profileImgUrl: 'http://127.0.0.1:1336src/imgurl/test.jpg',
      },
    ];
    const expectedOwnersSet = new Set(expectedOwners);
    const resultOwnersSet = new Set(detailResult.ownerMembers);
    expect(resultOwnersSet).toStrictEqual(expectedOwnersSet);

    const expectedAllMembers = [
      {
        uId: user2.authUserId,
        email: 'millizhao@gmail.com',
        nameFirst: 'Milli',
        nameLast: 'zhao',
        handleStr: 'millizhao',
        profileImgUrl: 'http://127.0.0.1:1336src/imgurl/test.jpg',
      },
      {
        uId: user1.authUserId,
        email: 'rileyliu@gmail.com',
        nameFirst: 'Riley',
        nameLast: 'Liu',
        handleStr: 'rileyliu',
        profileImgUrl: 'http://127.0.0.1:1336src/imgurl/test.jpg',

      },
      {
        uId: user3.authUserId,
        email: 'rebeccazhao@gmail.com',
        nameFirst: 'Rebecca',
        nameLast: 'zhao',
        handleStr: 'rebeccazhao',
        profileImgUrl: 'http://127.0.0.1:1336src/imgurl/test.jpg',

      },
    ];
    const expectedAllMembersSet = new Set(expectedAllMembers);
    const resultAllMemberSet = new Set(detailResult.allMembers);
    expect(resultAllMemberSet).toStrictEqual(expectedAllMembersSet);
  });
});

describe('testing /channel/details/v3', () => {
  let user1, user2, channel1;
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
    user2 = JSON.parse(createUser2.getBody() as string).token;

    const createChannel = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user1.token,
        },
        json: {
          name: 'Channel1',
          isPublic: true
        }
      }
    );
    channel1 = JSON.parse(createChannel.getBody() as string).channelId;
  });

  test('test for invalid token', () => {
    const res = request(
      'GET',
      SERVER_URL + '/channel/details/v3',
      {
        headers: {
          token: '-999'
        },
        qs: {
          channelId: channel1
        }
      }
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('test for invalid channelId', () => {
    const res = request(
      'GET',
      SERVER_URL + '/channel/details/v3',
      {
        headers: {
          token: user1.token
        },
        qs: {
          channelId: -999
        }
      }
    );
    expect(res.statusCode).toBe(INPUT_ERROR);
  });

  test('test for user not member of channel', () => {
    const res = request(
      'GET',
      SERVER_URL + '/channel/details/v3',
      {
        headers: {
          token: user2.token,
        },
        qs: {
          channelId: channel1
        }
      }
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('test for correct output for channel/details/v2', () => {
    const res = request(
      'GET',
      SERVER_URL + '/channel/details/v3',
      {
        headers: {
          token: user1.token
        },
        qs: {
          channelId: channel1
        }
      }
    );
    const result = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(result.name).toStrictEqual('Channel1');
    expect(result.isPublic).toStrictEqual(true);
    const expectedOwners = [
      {
        uId: user1.authUserId,
        email: 'validemail@gmail.com',
        nameFirst: 'John',
        nameLast: 'Smith',
        handleStr: 'johnsmith',
        profileImgUrl: 'http://127.0.0.1:1336src/imgurl/test.jpg',
      },
    ];
    const expectedOwnersSet = new Set(expectedOwners);
    const resultOwnersSet = new Set(result.ownerMembers);
    expect(resultOwnersSet).toStrictEqual(expectedOwnersSet);

    const expectedAllMembers = [
      {
        uId: user1.authUserId,
        email: 'validemail@gmail.com',
        nameFirst: 'John',
        nameLast: 'Smith',
        handleStr: 'johnsmith',
        profileImgUrl: 'http://127.0.0.1:1336src/imgurl/test.jpg',
      },
    ];
    const expectedAllMembersSet = new Set(expectedAllMembers);
    const resultAllMemberSet = new Set(result.allMembers);
    expect(resultAllMemberSet).toStrictEqual(expectedAllMembersSet);
  });
});

// =============================================================/channel/messages/v3
describe('test for /channel/messages/v3 ', () => {
  let user1, user2, user3, channel1, channel2;

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

    const createUser3 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'isjfiujeijfow@gmail.com',
          password: '12637362828jkjk',
          nameFirst: 'Rebecca',
          nameLast: 'zhao'
        }
      }
    );
    user3 = JSON.parse(createUser3.getBody() as string);

    const createChannel = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user1.token,
        },
        json: {
          name: 'Channel1',
          isPublic: true
        }
      }
    );
    channel1 = JSON.parse(createChannel.getBody() as string).channelId;

    const createChannel2 = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user2.token,
        },
        json: {
          name: 'Channel2',
          isPublic: true
        }
      }
    );
    channel2 = JSON.parse(createChannel2.getBody() as string).channelId;
  });

  test('Test for channelId is not valid', () => {
    const res = request(
      'GET',
      SERVER_URL + '/channel/messages/v3',
      {
        headers: {
          token: user1.token,
        },
        qs: {
          channelId: -99999,
          start: 0
        }
      }
    );
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Test for token is not valid', () => {
    const res = request(
      'GET',
      SERVER_URL + '/channel/messages/v3',
      {
        headers: {
          token: '-9999',
        },
        qs: {
          channelId: channel1,
          start: 0
        }
      }
    );
    expect(res.statusCode).toStrictEqual(403);
  });

  test('Test for authorised member is not a member of channel ', () => {
    const Member = request(
      'GET',
      SERVER_URL + '/channel/messages/v3',
      {
        headers: {
          token: user2.token,
        },
        qs: {
          channelId: channel1,
          start: 0
        }
      }
    );
    expect(Member.statusCode).toStrictEqual(403);
  });

  test('Test for start greater than the 50 ', () => {
    const res = request(
      'GET',
      SERVER_URL + '/channel/messages/v3',
      {
        headers: {
          token: user1.token,
        },
        qs: {
          channelId: channel1,
          start: 99999999
        }
      }
    );
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Test for message sucssful case', () => {
    request(
      'POST',
      SERVER_URL + '/channel/join/v3',
      {
        headers: {
          token: user3.token,
        },
        json: {
          channelId: channel2,
        }
      }
    );
    const res = request(
      'GET',
      SERVER_URL + '/channel/messages/v3',
      {
        headers: {
          token: user3.token,
        },
        qs: {
          channelId: channel2,
          start: 0
        }
      }
    );
    const result = JSON.parse(res.getBody() as string);
    expect(result).toStrictEqual({
      messages: [],
      start: 0,
      end: -1

    });
  });
});

// =============================================================test for channel/leave/v2
describe('test for /channel/leave/v2 ', () => {
  let user1, user2, user3, channel1, channel2;

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

    const createUser3 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'isjfiujeijfow@gmail.com',
          password: '12637362828jkjk',
          nameFirst: 'Rebecca',
          nameLast: 'zhao'
        }
      }
    );
    user3 = JSON.parse(createUser3.getBody() as string);

    const createChannel = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user1.token,
        },
        json: {
          name: 'Channel1',
          isPublic: true
        }
      }
    );
    channel1 = JSON.parse(createChannel.getBody() as string).channelId;

    const createChannel2 = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user2.token,
        },
        json: {
          name: 'Channel2',
          isPublic: true
        }
      }
    );
    channel2 = JSON.parse(createChannel2.getBody() as string).channelId;
  });

  test('Test for channelId is not valid', () => {
    const res = request(
      'POST',
      SERVER_URL + '/channel/leave/v2',
      {
        headers: {
          token: user1.token,
        },
        json: {
          channelId: -99999,
        }
      }
    );
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Test for token is not valid', () => {
    const res = request(
      'POST',
      SERVER_URL + '/channel/leave/v2',
      {
        headers: {
          token: '-90102121',
        },
        json: {
          channelId: channel1,
        }
      }
    );
    expect(res.statusCode).toStrictEqual(403);
  });

  test('Test for authorised user is not  a member of the channel', () => {
    const res = request(
      'POST',
      SERVER_URL + '/channel/leave/v2',
      {
        headers: {
          token: user3.token,
        },
        json: {
          channelId: channel2,
        }
      }
    );
    expect(res.statusCode).toStrictEqual(403);
  });

  test('Test for sucessful channel/leave/v2 functions', () => {
    request(
      'POST',
      SERVER_URL + '/channel/join/v3',
      {
        headers: {
          token: user3.token,
        },
        json: {
          channelId: channel2,
        }
      }
    );

    request(
      'POST',
      SERVER_URL + '/channel/leave/v2',
      {
        headers: {
          token: user3.token,
        },
        json: {
          channelId: channel2,
        }
      }
    );

    const details = request(
      'GET',
      SERVER_URL + '/channel/details/v3',
      {
        headers: {
          token: user2.token
        },
        qs: {
          channelId: channel2,
        }
      }
    );

    const detailResult = JSON.parse(details.getBody() as string);

    expect(detailResult.name).toStrictEqual('Channel2');
    expect(detailResult.isPublic).toStrictEqual(true);

    const expectedOwners = [
      {
        uId: user2.authUserId,
        email: 'validemail1@gmail.com',
        nameFirst: 'Billy',
        nameLast: 'Jones',
        handleStr: 'billyjones',
        profileImgUrl: 'http://127.0.0.1:1336src/imgurl/test.jpg',

      },
    ];
    const expectedOwnersSet = new Set(expectedOwners);
    const resultOwnersSet = new Set(detailResult.ownerMembers);
    expect(resultOwnersSet).toStrictEqual(expectedOwnersSet);

    const expectedAllMembers = [
      {
        uId: user2.authUserId,
        email: 'validemail1@gmail.com',
        nameFirst: 'Billy',
        nameLast: 'Jones',
        handleStr: 'billyjones',
        profileImgUrl: 'http://127.0.0.1:1336src/imgurl/test.jpg',

      },
    ];
    const expectedAllMembersSet = new Set(expectedAllMembers);
    const resultAllMemberSet = new Set(detailResult.allMembers);
    expect(resultAllMemberSet).toStrictEqual(expectedAllMembersSet);
  });
});

// ======================test for channel/addowner/v2 function
describe('test for /channel/addowner/v2 ', () => {
  let user1, user2, user3, channel1, channel2;

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
          email: 'rileyliu@gmail.com',
          password: '73bgdu#$#',
          nameFirst: 'Riley',
          nameLast: 'Liu'
        }
      }
    );
    user1 = JSON.parse(createUser.getBody() as string);

    const createUser2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'millizhao@gmail.com',
          password: '8kkk373',
          nameFirst: 'Milli',
          nameLast: 'zhao'
        }
      }
    );
    user2 = JSON.parse(createUser2.getBody() as string);

    const createUser3 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'rebeccazhao@gmail.com',
          password: '3738947',
          nameFirst: 'Rebecca',
          nameLast: 'zhao'
        }
      }
    );
    user3 = JSON.parse(createUser3.getBody() as string);

    const createChannel = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user1.token,
        },
        json: {
          name: 'Channel1',
          isPublic: false
        }
      }
    );
    channel1 = JSON.parse(createChannel.getBody() as string).channelId;

    const createChannel2 = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user2.token,
        },
        json: {
          name: 'Channel2',
          isPublic: true
        }
      }
    );
    channel2 = JSON.parse(createChannel2.getBody() as string).channelId;
  });

  test('Test for channelId is not valid', () => {
    const res = request(
      'POST',
      SERVER_URL + '/channel/addowner/v2',
      {
        headers: {
          token: user1.token,
        },
        json: {
          channelId: -99999,
          uId: user2.authUserId
        }
      }
    );
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Test for token is not valid', () => {
    const res = request(
      'POST',
      SERVER_URL + '/channel/addowner/v2',
      {
        headers: {
          token: '-0',
        },
        json: {
          channelId: channel1,
          uId: user2.authUserId
        }
      }
    );
    expect(res.statusCode).toStrictEqual(403);
  });

  test('Test for uId is not valid', () => {
    const res = request(
      'POST',
      SERVER_URL + '/channel/addowner/v2',
      {
        headers: {
          token: user1.token,
        },
        json: {
          channelId: channel1,
          uId: -9999999
        }
      }
    );
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Test for uId is not a memeber of channel ', () => {
    const res = request(
      'POST',
      SERVER_URL + '/channel/addowner/v2',
      {
        headers: {
          token: user1.token,
        },
        json: {
          channelId: channel1,
          uId: user2.authUserId
        }
      }
    );
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Test for uId is already a owner of channel ', () => {
    const res = request(
      'POST',
      SERVER_URL + '/channel/addowner/v2',
      {
        headers: {
          token: user1.token,
        },
        json: {
          channelId: channel1,
          uId: user1.authUserId
        }
      }
    );
    expect(res.statusCode).toStrictEqual(400);
  });

  test('test for authorised user no owner permission in channel', () => {
    request(
      'POST',
      SERVER_URL + '/channel/join/v3',
      {
        headers: {
          token: user2.token,
        },
        json: {
          channelId: channel1,
        }
      }
    );

    const res = request(
      'POST',
      SERVER_URL + '/channel/addowner/v2',
      {
        headers: {
          token: user2.token,
        },
        json: {
          channelId: channel1,
          uId: user3.authUserId
        }
      }
    );
    expect(res.statusCode).toStrictEqual(403);
  });

  test('Test for sucessful /channel/addowner/v2 functions', () => {
    request(
      'POST',
      SERVER_URL + '/channel/invite/v3',
      {
        headers: {
          token: user2.token,
        },
        json: {
          channelId: channel2,
          uId: user1.authUserId
        }
      }
    );

    request(
      'POST',
      SERVER_URL + '/channel/addowner/v2',
      {
        headers: {
          token: user2.token,
        },
        json: {
          channelId: channel2,
          uId: user1.authUserId
        }
      }
    );

    const details = request(
      'GET',
      SERVER_URL + '/channel/details/v3',
      {
        headers: {
          token: user2.token
        },
        qs: {
          channelId: channel2,
        }
      }
    );

    const detailResult = JSON.parse(details.getBody() as string);

    expect(detailResult.name).toStrictEqual('Channel2');
    expect(detailResult.isPublic).toStrictEqual(true);

    const expectedOwners = [
      {
        uId: user2.authUserId,
        email: 'millizhao@gmail.com',
        nameFirst: 'Milli',
        nameLast: 'zhao',
        handleStr: 'millizhao',
        profileImgUrl: 'http://127.0.0.1:1336src/imgurl/test.jpg',

      },
      {
        uId: user1.authUserId,
        email: 'rileyliu@gmail.com',
        nameFirst: 'Riley',
        nameLast: 'Liu',
        handleStr: 'rileyliu',
        profileImgUrl: 'http://127.0.0.1:1336src/imgurl/test.jpg',
      },
    ];
    const expectedOwnersSet = new Set(expectedOwners);
    const resultOwnersSet = new Set(detailResult.ownerMembers);
    expect(resultOwnersSet).toStrictEqual(expectedOwnersSet);

    const expectedAllMembers = [

      {
        uId: user2.authUserId,
        email: 'millizhao@gmail.com',
        nameFirst: 'Milli',
        nameLast: 'zhao',
        handleStr: 'millizhao',
        profileImgUrl: 'http://127.0.0.1:1336src/imgurl/test.jpg',

      },
      {
        uId: user1.authUserId,
        email: 'rileyliu@gmail.com',
        nameFirst: 'Riley',
        nameLast: 'Liu',
        handleStr: 'rileyliu',
        profileImgUrl: 'http://127.0.0.1:1336src/imgurl/test.jpg',
      },

    ];
    const expectedAllMembersSet = new Set(expectedAllMembers);
    const resultAllMemberSet = new Set(detailResult.allMembers);
    expect(resultAllMemberSet).toStrictEqual(expectedAllMembersSet);
  });
});

// =========================test for channel/removeowner/v2 function
describe('test for channel/removeowner/v2', () => {
  let user1, user2, user3, channel1, channel2;

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

    const createUser3 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'isjfiujeijfow@gmail.com',
          password: '12637362828jkjk',
          nameFirst: 'Rebecca',
          nameLast: 'zhao'
        }
      }
    );
    user3 = JSON.parse(createUser3.getBody() as string);

    const createChannel = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user1.token,
        },
        json: {
          name: 'Channel1',
          isPublic: true
        }
      }
    );
    channel1 = JSON.parse(createChannel.getBody() as string).channelId;

    const createChannel2 = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user2.token,
        },
        json: {
          name: 'Channel2',
          isPublic: true
        }
      }
    );
    channel2 = JSON.parse(createChannel2.getBody() as string).channelId;
  });

  test('Test for channelId is not valid', () => {
    const res = request(
      'POST',
      SERVER_URL + '/channel/removeowner/v2',
      {
        headers: {
          token: user1.token,
        },
        json: {
          channelId: -9999,
          uId: user2.authUserId
        }
      }
    );
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Test for token is not valid', () => {
    const res = request(
      'POST',
      SERVER_URL + '/channel/removeowner/v2',
      {
        headers: {
          token: '-121212111',
        },
        json: {
          channelId: channel1,
          uId: user2.authUserId
        }
      }
    );
    expect(res.statusCode).toStrictEqual(403);
  });

  test('Test for uId is not valid', () => {
    const res = request(
      'POST',
      SERVER_URL + '/channel/removeowner/v2',
      {
        headers: {
          token: user1.token,
        },
        json: {
          channelId: channel1,
          uId: -9999999
        }
      }
    );
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Test for uId is not owner memeber of channel ', () => {
    request(
      'POST',
      SERVER_URL + '/channel/join/v3',
      {
        headers: {
          token: user2.token,
        },
        json: {
          channelId: channel1,
        }
      }
    );
    request(
      'POST',
      SERVER_URL + '/channel/join/v3',
      {
        headers: {
          token: user3.token,
        },
        json: {
          channelId: channel1,
        }
      }
    );
    request(
      'POST',
      SERVER_URL + '/channel/addowner/v2',
      {
        headers: {
          token: user1.token,
        },
        json: {
          channelId: channel1,
          uId: user2.authUserId
        }
      }
    );

    const res = request(
      'POST',
      SERVER_URL + '/channel/removeowner/v2',
      {
        headers: {
          token: user1.token,
        },
        json: {
          channelId: channel1,
          uId: user3.authUserId
        }
      }
    );
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Test for uId is only owner of the channel ', () => {
    const res = request(
      'POST',
      SERVER_URL + '/channel/removeowner/v2',
      {
        headers: {
          token: user1.token,
        },
        json: {
          channelId: channel1,
          uId: user1.authUserId
        }
      }
    );
    expect(res.statusCode).toStrictEqual(400);
  });

  test('test for authorised user no owner permission in channel', () => {
    request(
      'POST',
      SERVER_URL + '/channel/join/v3',
      {
        headers: {
          token: user3.token,
        },
        json: {
          channelId: channel1,
        }
      }
    );

    const res = request(
      'POST',
      SERVER_URL + '/channel/removeowner/v2',
      {
        headers: {
          token: user3.token,
        },
        json: {
          channelId: channel1,
          uId: user1.authUserId
        }
      }
    );
    expect(res.statusCode).toStrictEqual(expect.any(Number));
  });

  test('Test for sucessful /channel/removeowner/v2 functions', () => {
    request(
      'POST',
      SERVER_URL + '/channel/invite/v3',
      {
        headers: {
          token: user2.token,
        },
        json: {
          channelId: channel2,
          uId: user1.authUserId
        }
      }
    );

    request(
      'POST',
      SERVER_URL + '/channel/addowner/v2',
      {
        headers: {
          token: user1.token,
        },
        json: {
          channelId: channel2,
          uId: user2.authUserId
        }
      }
    );
    request(
      'POST',
      SERVER_URL + '/channel/removeowner/v2',
      {
        headers: {
          token: user2.token,
        },
        json: {
          channelId: channel1,
          uId: user1.authUserId
        }
      }
    );

    const details = request(
      'GET',
      SERVER_URL + '/channel/details/v3',
      {
        headers: {
          token: user2.token
        },
        qs: {
          channelId: channel2,
        }
      }
    );

    const detailResult = JSON.parse(details.getBody() as string);

    expect(detailResult.name).toStrictEqual('Channel2');
    expect(detailResult.isPublic).toStrictEqual(true);

    const expectedOwners = [
      {
        uId: user2.authUserId,
        email: 'validemail1@gmail.com',
        nameFirst: 'Billy',
        nameLast: 'Jones',
        handleStr: 'billyjones',
        profileImgUrl: 'http://127.0.0.1:1336src/imgurl/test.jpg',
      },
    ];
    const expectedOwnersSet = new Set(expectedOwners);
    const resultOwnersSet = new Set(detailResult.ownerMembers);
    expect(resultOwnersSet).toStrictEqual(expectedOwnersSet);

    const expectedAllMembers = [
      {
        uId: user2.authUserId,
        email: 'validemail1@gmail.com',
        nameFirst: 'Billy',
        nameLast: 'Jones',
        handleStr: 'billyjones',
        profileImgUrl: 'http://127.0.0.1:1336src/imgurl/test.jpg',

      },
      {
        uId: user1.authUserId,
        email: 'validemail@gmail.com',
        nameFirst: 'John',
        nameLast: 'Smith',
        handleStr: 'johnsmith',
        profileImgUrl: 'http://127.0.0.1:1336src/imgurl/test.jpg',
      },

    ];
    const expectedAllMembersSet = new Set(expectedAllMembers);
    const resultAllMemberSet = new Set(detailResult.allMembers);
    expect(resultAllMemberSet).toStrictEqual(expectedAllMembersSet);
  });
});

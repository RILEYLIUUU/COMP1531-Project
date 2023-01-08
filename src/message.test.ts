import request from 'sync-request';
import config from './config.json';
const getTimeStamp = () => Math.floor(Date.now() / 1000);
const OK = 200;
const INPUT_ERROR = 400;
const FORBIDDEN = 403;
const port = config.port;
const url = config.url;
const SERVER_URL = `${url}:${port}`;

describe('test for /message/send/v2', () => {
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
    user1 = JSON.parse(createUser.getBody() as string).token;

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
          token: user1
        },
        json: {
          name: 'Channel1',
          isPublic: true
        }
      }
    );
    channel1 = JSON.parse(createChannel.getBody() as string).channelId;
  });

  test('when channelId is not valid', () => {
    const res = request(
      'POST',
      SERVER_URL + '/message/send/v2',
      {
        headers: {
          token: user1
        },
        json: {
          channelId: -999,
          message: 'Hello world'
        }
      }
    );
    expect(res.statusCode).toBe(INPUT_ERROR);
  });

  test('when message is empty', () => {
    const res = request(
      'POST',
      SERVER_URL + '/message/send/v2',
      {
        headers: {
          token: user1
        },
        json: {
          channelId: channel1,
          message: ''
        }
      }
    );
    expect(res.statusCode).toBe(INPUT_ERROR);
  });

  test('when message is too long', () => {
    const res = request(
      'POST',
      SERVER_URL + '/message/send/v2',
      {
        headers: {
          token: user1
        },
        json: {
          channelId: channel1,
          message: 'A'.repeat(1001)
        }
      }
    );
    expect(res.statusCode).toBe(INPUT_ERROR);
  });

  test('when token is invalid', () => {
    const res = request(
      'POST',
      SERVER_URL + '/message/send/v2',
      {
        headers: {
          token: '-999'
        },
        json: {
          token: '-99999999',
          channelId: channel1,
          message: 'Hello'
        }
      }
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('when user is not in channel', () => {
    const res = request(
      'POST',
      SERVER_URL + '/message/send/v2',
      {
        headers: {
          token: user2
        },
        json: {
          channelId: channel1,
          message: 'Hello'
        }
      }
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('test for successful message/send/v1', () => {
    const res = request(
      'POST',
      SERVER_URL + '/message/send/v2',
      {
        headers: {
          token: user1
        },
        json: {
          channelId: channel1,
          message: 'Hello'
        }
      }
    );
    const result = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(result).toStrictEqual({ messageId: expect.any(Number) });
  });
});

describe('test for /message/edit/v2', () => {
  let user1, message1, channel1;

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
    user1 = JSON.parse(createUser.getBody() as string).token;

    const createChannel = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user1
        },
        json: {
          name: 'Channel1',
          isPublic: true
        }
      }
    );
    channel1 = JSON.parse(createChannel.getBody() as string).channelId;

    const createMessage = request(
      'POST',
      SERVER_URL + '/message/send/v2',
      {
        headers: {
          token: user1
        },
        json: {
          channelId: channel1,
          message: 'Hello'
        }
      }
    );
    message1 = JSON.parse(createMessage.getBody() as string).messageId;
  });

  test('test for error when message is too long', () => {
    const res = request(
      'PUT',
      SERVER_URL + '/message/edit/v2',
      {
        headers: {
          token: user1
        },
        json: {
          messageId: message1,
          message: 'A'.repeat(1001)
        }
      }
    );
    expect(res.statusCode).toBe(INPUT_ERROR);
  });

  test('test for invalid messageId', () => {
    const res = request(
      'PUT',
      SERVER_URL + '/message/edit/v2',
      {
        headers: {
          token: user1
        },
        json: {
          messageId: -999,
          message: 'Goodbye'
        }
      }
    );
    expect(res.statusCode).toBe(INPUT_ERROR);
  });

  test('test for invalid user not in channel', () => {
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
    const user2 = JSON.parse(createUser2.getBody() as string).token;

    const res = request(
      'PUT',
      SERVER_URL + '/message/edit/v2',
      {
        headers: {
          token: user2
        },
        json: {
          messageId: message1,
          message: 'Goodbye'
        }
      }
    );
    expect(res.statusCode).toBe(INPUT_ERROR);
  });

  test('test for invalid user calling function', () => {
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
    const user2 = JSON.parse(createUser2.getBody() as string).token;

    request(
      'POST',
      SERVER_URL + '/channel/join/v3',
      {
        headers: {
          token: user2
        },
        json: {
          channelId: channel1,
        }
      }
    );

    const res = request(
      'PUT',
      SERVER_URL + '/message/edit/v2',
      {
        headers: {
          token: user2
        },
        json: {
          messageId: message1,
          message: 'Goodbye'
        }
      }
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('test for invalid token', () => {
    const res = request(
      'PUT',
      SERVER_URL + '/message/edit/v2',
      {
        headers: {
          token: '-999'
        },
        json: {
          messageId: message1,
          message: 'Goodbye'
        }
      }
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('user is not in dms', () => {
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
    const user2 = JSON.parse(createUser2.getBody() as string);

    const createDm = request(
      'POST',
      SERVER_URL + '/dm/create/v2',
      {
        headers: {
          token: user2.token
        },
        json: {
          uIds: [user2.authUserId]
        }
      }
    );
    const dm1 = JSON.parse(createDm.getBody() as string).dmId;

    const createMessage2 = request(
      'POST',
      SERVER_URL + '/message/senddm/v2',
      {
        headers: {
          token: user2.token
        },
        json: {
          dmId: dm1,
          message: 'Hello'
        }
      }
    );
    const message2 = JSON.parse(createMessage2.getBody() as string).messageId;

    const res = request(
      'PUT',
      SERVER_URL + '/message/edit/v2',
      {
        headers: {
          token: user1
        },
        json: {
          messageId: message2,
          message: 'Goodbye'
        }
      }
    );
    expect(res.statusCode).toBe(INPUT_ERROR);
  });

  test('user is no permission in dms', () => {
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
    const user2 = JSON.parse(createUser2.getBody() as string);

    const createDm = request(
      'POST',
      SERVER_URL + '/dm/create/v2',
      {
        headers: {
          token: user1
        },
        json: {
          uIds: [user2.authUserId]
        }
      }
    );
    const dm1 = JSON.parse(createDm.getBody() as string).dmId;

    const createMessage2 = request(
      'POST',
      SERVER_URL + '/message/senddm/v2',
      {
        headers: {
          token: user1
        },
        json: {
          dmId: dm1,
          message: 'Hello'
        }
      }
    );
    const message2 = JSON.parse(createMessage2.getBody() as string).messageId;

    const res = request(
      'PUT',
      SERVER_URL + '/message/edit/v2',
      {
        headers: {
          token: user2.token
        },
        json: {
          messageId: message2,
          message: 'Goodbye'
        }
      }
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('test for successful message/edit/v1', () => {
    const res = request(
      'PUT',
      SERVER_URL + '/message/edit/v2',
      {
        headers: {
          token: user1
        },
        json: {
          messageId: message1,
          message: 'Goodbye'
        }
      }
    );
    const result = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(result).toStrictEqual({});

    const message = request(
      'GET',
      SERVER_URL + '/channel/messages/v3',
      {
        headers: {
          token: user1
        },
        qs: {
          channelId: channel1,
          start: 0
        }
      }
    );
    const checkMessage = JSON.parse(message.getBody() as string);
    expect(checkMessage.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: 'Goodbye' })
      ])
    );
  });

  test('test for successful message/edit/v1 when not owner of channel', () => {
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
    const user2 = JSON.parse(createUser2.getBody() as string).token;

    request(
      'POST',
      SERVER_URL + '/channel/join/v3',
      {
        headers: {
          token: user2
        },
        json: {
          channelId: channel1,
        }
      }
    );

    const createMessage2 = request(
      'POST',
      SERVER_URL + '/message/send/v2',
      {
        headers: {
          token: user2
        },
        json: {
          channelId: channel1,
          message: 'Hello'
        }
      }
    );
    const message2 = JSON.parse(createMessage2.getBody() as string).messageId;

    const res = request(
      'PUT',
      SERVER_URL + '/message/edit/v2',
      {
        headers: {
          token: user2
        },
        json: {
          messageId: message2,
          message: 'Goodbye'
        }
      }
    );
    expect(res.statusCode).toBe(OK);

    const message = request(
      'GET',
      SERVER_URL + '/channel/messages/v3',
      {
        headers: {
          token: user1
        },
        qs: {
          channelId: channel1,
          start: 0
        }
      }
    );
    const checkMessage = JSON.parse(message.getBody() as string);
    expect(checkMessage.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: 'Goodbye' })
      ])
    );
  });

  test('test for successful message/edit/v1 when message empty', () => {
    const res = request(
      'PUT',
      SERVER_URL + '/message/edit/v2',
      {
        headers: {
          token: user1
        },
        json: {
          messageId: message1,
          message: ''
        }
      }
    );
    const result = JSON.parse(res.getBody() as string);
    expect(result).toStrictEqual({});

    const message = request(
      'GET',
      SERVER_URL + '/channel/messages/v3',
      {
        headers: {
          token: user1
        },
        qs: {
          channelId: channel1,
          start: 0
        }
      }
    );
    const checkMessage = JSON.parse(message.getBody() as string);
    expect(checkMessage.messages).toEqual([]);
  });

  test('user has permission in dms', () => {
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
    const user2 = JSON.parse(createUser2.getBody() as string);

    const createDm = request(
      'POST',
      SERVER_URL + '/dm/create/v2',
      {
        headers: {
          token: user1
        },
        json: {
          uIds: [user2.authUserId]
        }
      }
    );
    const dm1 = JSON.parse(createDm.getBody() as string).dmId;

    const createMessage2 = request(
      'POST',
      SERVER_URL + '/message/senddm/v2',
      {
        headers: {
          token: user1
        },
        json: {
          dmId: dm1,
          message: 'Hello'
        }
      }
    );
    const message2 = JSON.parse(createMessage2.getBody() as string).messageId;

    const res = request(
      'PUT',
      SERVER_URL + '/message/edit/v2',
      {
        headers: {
          token: user1
        },
        json: {
          messageId: message2,
          message: 'Goodbye'
        }
      }
    );
    expect(res.statusCode).toBe(OK);
  });
});

describe('test for /message/remove/v2', () => {
  let user1, channel1, message1;

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
    user1 = JSON.parse(createUser.getBody() as string).token;

    const createChannel = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user1
        },
        json: {
          name: 'Channel1',
          isPublic: true
        }
      }
    );
    channel1 = JSON.parse(createChannel.getBody() as string).channelId;

    const createMessage = request(
      'POST',
      SERVER_URL + '/message/send/v2',
      {
        headers: {
          token: user1
        },
        json: {
          channelId: channel1,
          message: 'Hello'
        }
      }
    );
    message1 = JSON.parse(createMessage.getBody() as string).messageId;
  });

  test('test for invalid messageId', () => {
    const res = request(
      'DELETE',
      SERVER_URL + '/message/remove/v2',
      {
        headers: {
          token: user1
        },
        qs: {
          messageId: -99999,
        }
      }
    );
    expect(res.statusCode).toBe(INPUT_ERROR);
  });

  test('test for user not in channel', () => {
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
    const user2 = JSON.parse(createUser2.getBody() as string).token;

    const res = request(
      'DELETE',
      SERVER_URL + '/message/remove/v2',
      {
        headers: {
          token: user2
        },
        qs: {
          messageId: message1,
        }
      }
    );
    expect(res.statusCode).toBe(INPUT_ERROR);
  });

  test('test for user not in DM', () => {
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
    const user2 = JSON.parse(createUser2.getBody() as string);

    const createDm = request(
      'POST',
      SERVER_URL + '/dm/create/v2',
      {
        headers: {
          token: user2.token
        },
        json: {
          uIds: [user2.authUserId]
        }
      }
    );
    const dm1 = JSON.parse(createDm.getBody() as string).dmId;

    const createMessage2 = request(
      'POST',
      SERVER_URL + '/message/senddm/v2',
      {
        headers: {
          token: user2.token
        },
        json: {
          dmId: dm1,
          message: 'Hello'
        }
      }
    );
    const message2 = JSON.parse(createMessage2.getBody() as string).messageId;

    const res = request(
      'DELETE',
      SERVER_URL + '/message/remove/v2',
      {
        headers: {
          token: user1
        },
        qs: {
          messageId: message2,
        }
      }
    );
    expect(res.statusCode).toBe(INPUT_ERROR);
  });

  test('test for user no permission in dm', () => {
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
    const user2 = JSON.parse(createUser2.getBody() as string);

    const createDm = request(
      'POST',
      SERVER_URL + '/dm/create/v2',
      {
        headers: {
          token: user1
        },
        json: {
          uIds: [user2.authUserId]
        }
      }
    );
    const dm1 = JSON.parse(createDm.getBody() as string).dmId;

    const createMessage2 = request(
      'POST',
      SERVER_URL + '/message/senddm/v2',
      {
        headers: {
          token: user1
        },
        json: {
          dmId: dm1,
          message: 'Hello'
        }
      }
    );
    const message2 = JSON.parse(createMessage2.getBody() as string).messageId;

    const res = request(
      'DELETE',
      SERVER_URL + '/message/remove/v2',
      {
        headers: {
          token: user2.token
        },
        qs: {
          messageId: message2,
        }
      }
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('test for invalid user calling function', () => {
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
    const user2 = JSON.parse(createUser2.getBody() as string).token;

    request(
      'POST',
      SERVER_URL + '/channel/join/v3',
      {
        headers: {
          token: user2
        },
        json: {
          channelId: channel1,
        }
      }
    );

    const res = request(
      'DELETE',
      SERVER_URL + '/message/remove/v2',
      {
        headers: {
          token: user2
        },
        qs: {
          messageId: message1,
        }
      }
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('test for invalid token', () => {
    const res = request(
      'DELETE',
      SERVER_URL + '/message/remove/v2',
      {
        headers: {
          token: '-9999'
        },
        qs: {
          messageId: message1,
        }
      }
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('test for successful message/remove/v1', () => {
    const res = request(
      'DELETE',
      SERVER_URL + '/message/remove/v2',
      {
        headers: {
          token: user1
        },
        qs: {
          messageId: message1,
        }
      }
    );
    const result = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(result).toStrictEqual({});

    const message = request(
      'GET',
      SERVER_URL + '/channel/messages/v3',
      {
        headers: {
          token: user1
        },
        qs: {
          channelId: channel1,
          start: 0
        }
      }
    );
    const checkMessage = JSON.parse(message.getBody() as string);
    expect(checkMessage.messages).toEqual(
      expect.arrayContaining([])
    );
  });

  test('test for successful message/remove/v1 when not owner of channel', () => {
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
    const user2 = JSON.parse(createUser2.getBody() as string).token;

    request(
      'POST',
      SERVER_URL + '/channel/join/v3',
      {
        headers: {
          token: user2
        },
        json: {
          channelId: channel1,
        }
      }
    );

    const createMessage2 = request(
      'POST',
      SERVER_URL + '/message/send/v2',
      {
        headers: {
          token: user2
        },
        json: {
          channelId: channel1,
          message: 'Hello'
        }
      }
    );
    const message2 = JSON.parse(createMessage2.getBody() as string).messageId;

    const res = request(
      'DELETE',
      SERVER_URL + '/message/remove/v2',
      {
        headers: {
          token: user2
        },
        qs: {
          messageId: message2,
        }
      }
    );
    expect(res.statusCode).toBe(OK);
  });

  test('test for success in dm', () => {
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
    const user2 = JSON.parse(createUser2.getBody() as string);

    const createDm = request(
      'POST',
      SERVER_URL + '/dm/create/v2',
      {
        headers: {
          token: user1
        },
        json: {
          uIds: [user2.authUserId]
        }
      }
    );
    const dm1 = JSON.parse(createDm.getBody() as string).dmId;

    const createMessage2 = request(
      'POST',
      SERVER_URL + '/message/senddm/v2',
      {
        headers: {
          token: user1
        },
        json: {
          dmId: dm1,
          message: 'Hello'
        }
      }
    );
    const message2 = JSON.parse(createMessage2.getBody() as string).messageId;

    const res = request(
      'DELETE',
      SERVER_URL + '/message/remove/v2',
      {
        headers: {
          token: user1
        },
        qs: {
          messageId: message2,
        }
      }
    );
    expect(res.statusCode).toBe(OK);
  });
});

describe('test for /message/senddm/v2', () => {
  let user1, user2, dm1;

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

    const createDm = request(
      'POST',
      SERVER_URL + '/dm/create/v2',
      {
        headers: {
          token: user1.token
        },
        json: {
          uIds: [user1.authUserId]
        }
      }
    );
    dm1 = JSON.parse(createDm.getBody() as string).dmId;
  });

  test('when dmId is invalid', () => {
    const res = request(
      'POST',
      SERVER_URL + '/message/senddm/v2',
      {
        headers: {
          token: user1.token
        },
        json: {
          dmId: -999,
          message: 'Hello'
        }
      }
    );
    expect(res.statusCode).toBe(INPUT_ERROR);
  });

  test('when message is empty', () => {
    const res = request(
      'POST',
      SERVER_URL + '/message/senddm/v2',
      {
        headers: {
          token: user1.token
        },
        json: {
          dmId: dm1,
          message: ''
        }
      }
    );
    expect(res.statusCode).toBe(INPUT_ERROR);
  });

  test('when message is too long', () => {
    const res = request(
      'POST',
      SERVER_URL + '/message/senddm/v2',
      {
        headers: {
          token: user1.token
        },
        json: {
          dmId: dm1,
          message: 'A'.repeat(1001)
        }
      }
    );
    expect(res.statusCode).toBe(INPUT_ERROR);
  });

  test('when token is invalid', () => {
    const res = request(
      'POST',
      SERVER_URL + '/message/senddm/v2',
      {
        headers: {
          token: '-9999'
        },
        json: {
          dmId: dm1,
          message: 'Hello'
        }
      }
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('when user is not in channel', () => {
    const res = request(
      'POST',
      SERVER_URL + '/message/senddm/v2',
      {
        headers: {
          token: user2
        },
        json: {
          dmId: dm1,
          message: 'Hello'
        }
      }
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('test for successful message/senddm/v1', () => {
    const res = request(
      'POST',
      SERVER_URL + '/message/senddm/v2',
      {
        headers: {
          token: user1.token
        },
        json: {
          dmId: dm1,
          message: 'Hello'
        }
      }
    );
    const result = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(result).toStrictEqual({ messageId: expect.any(Number) });
  });
});

describe('test for message/react/v1', () => {
  let user1, channel1, message1;

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
    user1 = JSON.parse(createUser.getBody() as string).token;

    const createChannel = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user1,
        },
        json: {
          name: 'Channel1',
          isPublic: true
        }
      }
    );
    channel1 = JSON.parse(createChannel.getBody() as string).channelId;

    const createMessage = request(
      'POST',
      SERVER_URL + '/message/send/v2',
      {
        headers: {
          token: user1
        },
        json: {
          channelId: channel1,
          message: 'Hello'
        }
      }
    );
    message1 = JSON.parse(createMessage.getBody() as string).messageId;
  });

  describe('error cases', () => {
    test('invalid token', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/react/v1',
        {
          headers: {
            token: '-9999'
          },
          json: {
            messageId: message1,
            reactId: 1
          }
        }
      );
      expect(res.statusCode).toBe(FORBIDDEN);
    });

    test('invalid messageId', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/react/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: -999,
            reactId: 1
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('user not in channel', () => {
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
      const user2 = JSON.parse(createUser2.getBody() as string).token;

      const res = request(
        'POST',
        SERVER_URL + '/message/react/v1',
        {
          headers: {
            token: user2
          },
          json: {
            messageId: message1,
            reactId: 1
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('invalid reactId', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/react/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message1,
            reactId: 10000
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('reacting twice', () => {
      const react1 = request(
        'POST',
        SERVER_URL + '/message/react/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message1,
            reactId: 1
          }
        }
      );
      expect(react1.statusCode).toBe(OK);

      const res = request(
        'POST',
        SERVER_URL + '/message/react/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message1,
            reactId: 1
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('User not in dm', () => {
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
      const user2 = JSON.parse(createUser2.getBody() as string);
      const createDm = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user2.token,
          },
          json: {
            uIds: [user2.authUserId]
          }
        }
      );
      const dm1 = JSON.parse(createDm.getBody() as string).dmId;

      const sendMessage2 = request(
        'POST',
        SERVER_URL + '/message/senddm/v2',
        {
          headers: {
            token: user2.token
          },
          json: {
            dmId: dm1,
            message: 'Hello'
          }
        }
      );

      const message2 = JSON.parse(sendMessage2.getBody() as string).messageId;

      const react1 = request(
        'POST',
        SERVER_URL + '/message/react/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message2,
            reactId: 1
          }
        }
      );
      expect(react1.statusCode).toBe(INPUT_ERROR);
    });
  });

  describe('success cases', () => {
    test('basic success case', () => {
      const react1 = request(
        'POST',
        SERVER_URL + '/message/react/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message1,
            reactId: 1
          }
        }
      );
      expect(react1.statusCode).toBe(OK);

      const message = request(
        'GET',
        SERVER_URL + '/channel/messages/v3',
        {
          headers: {
            token: user1
          },
          qs: {
            channelId: channel1,
            start: 0
          }
        }
      );
      const checkMessage = JSON.parse(message.getBody() as string);
      expect(checkMessage.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            reacts: expect.arrayContaining([
              expect.objectContaining({
                reactId: 1,
                isThisUserReacted: true
              })
            ])
          })
        ])
      );
    });

    test('different reactions', () => {
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
      const user2 = JSON.parse(createUser2.getBody() as string).token;

      request(
        'POST',
        SERVER_URL + '/channel/join/v3',
        {
          headers: {
            token: user2,
          },
          json: {
            channelId: channel1,
          }
        }
      );

      const react1 = request(
        'POST',
        SERVER_URL + '/message/react/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message1,
            reactId: 1
          }
        }
      );
      expect(react1.statusCode).toBe(OK);

      const react2 = request(
        'POST',
        SERVER_URL + '/message/react/v1',
        {
          headers: {
            token: user2
          },
          json: {
            messageId: message1,
            reactId: 2
          }
        }
      );
      expect(react2.statusCode).toBe(OK);

      const message = request(
        'GET',
        SERVER_URL + '/channel/messages/v3',
        {
          headers: {
            token: user1
          },
          qs: {
            channelId: channel1,
            start: 0
          }
        }
      );

      const checkMessage = JSON.parse(message.getBody() as string);
      expect(checkMessage.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            reacts: expect.arrayContaining([
              expect.objectContaining({
                reactId: 2,
                isThisUserReacted: false
              })
            ])
          })
        ])
      );

      const message2 = request(
        'GET',
        SERVER_URL + '/channel/messages/v3',
        {
          headers: {
            token: user2
          },
          qs: {
            channelId: channel1,
            start: 0
          }
        }
      );

      const checkMessage2 = JSON.parse(message2.getBody() as string);
      expect(checkMessage2.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            reacts: expect.arrayContaining([
              expect.objectContaining({
                reactId: 1,
                isThisUserReacted: false
              })
            ])
          })
        ])
      );
    });

    test('basic success in dms', () => {
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
      const user2 = JSON.parse(createUser2.getBody() as string);
      const createDm = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user2.token,
          },
          json: {
            uIds: [user2.authUserId]
          }
        }
      );
      const dm1 = JSON.parse(createDm.getBody() as string).dmId;

      const sendMessage2 = request(
        'POST',
        SERVER_URL + '/message/senddm/v2',
        {
          headers: {
            token: user2.token
          },
          json: {
            dmId: dm1,
            message: 'Hello'
          }
        }
      );

      const message2 = JSON.parse(sendMessage2.getBody() as string).messageId;

      const react1 = request(
        'POST',
        SERVER_URL + '/message/react/v1',
        {
          headers: {
            token: user2.token
          },
          json: {
            messageId: message2,
            reactId: 1
          }
        }
      );
      expect(react1.statusCode).toBe(OK);

      const message = request(
        'GET',
        SERVER_URL + '/dm/messages/v2',
        {
          headers: {
            token: user2.token
          },
          qs: {
            dmId: dm1,
            start: 0
          }
        }
      );
      const checkMessage = JSON.parse(message.getBody() as string);
      expect(checkMessage.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            reacts: expect.arrayContaining([
              expect.objectContaining({
                reactId: 1,
                isThisUserReacted: true
              })
            ])
          })
        ])
      );
    });

    test('check dm react from perspective of different person', () => {
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
      const user2 = JSON.parse(createUser2.getBody() as string);
      const createDm = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user1,
          },
          json: {
            uIds: [user2.authUserId]
          }
        }
      );
      const dm1 = JSON.parse(createDm.getBody() as string).dmId;

      const sendMessage2 = request(
        'POST',
        SERVER_URL + '/message/senddm/v2',
        {
          headers: {
            token: user2.token
          },
          json: {
            dmId: dm1,
            message: 'Hello'
          }
        }
      );

      const message2 = JSON.parse(sendMessage2.getBody() as string).messageId;

      const react1 = request(
        'POST',
        SERVER_URL + '/message/react/v1',
        {
          headers: {
            token: user2.token
          },
          json: {
            messageId: message2,
            reactId: 1
          }
        }
      );
      expect(react1.statusCode).toBe(OK);

      const message = request(
        'GET',
        SERVER_URL + '/dm/messages/v2',
        {
          headers: {
            token: user1
          },
          qs: {
            dmId: dm1,
            start: 0
          }
        }
      );
      const checkMessage = JSON.parse(message.getBody() as string);
      expect(checkMessage.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            reacts: expect.arrayContaining([
              expect.objectContaining({
                reactId: 1,
                isThisUserReacted: false
              })
            ])
          })
        ])
      );
    });

    test('more than one user reaction', () => {
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
      const user2 = JSON.parse(createUser2.getBody() as string).token;

      request(
        'POST',
        SERVER_URL + '/channel/join/v3',
        {
          headers: {
            token: user2,
          },
          json: {
            channelId: channel1,
          }
        }
      );

      const res = request(
        'POST',
        SERVER_URL + '/message/react/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message1,
            reactId: 1
          }
        }
      );
      expect(res.statusCode).toBe(OK);

      const res2 = request(
        'POST',
        SERVER_URL + '/message/react/v1',
        {
          headers: {
            token: user2
          },
          json: {
            messageId: message1,
            reactId: 1
          }
        }
      );
      expect(res2.statusCode).toBe(OK);
    });
  });
});

describe('tests for /message/unreact/v1', () => {
  let user1, channel1, message1;

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
    user1 = JSON.parse(createUser.getBody() as string).token;

    const createChannel = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user1,
        },
        json: {
          name: 'Channel1',
          isPublic: true
        }
      }
    );
    channel1 = JSON.parse(createChannel.getBody() as string).channelId;

    const createMessage = request(
      'POST',
      SERVER_URL + '/message/send/v2',
      {
        headers: {
          token: user1
        },
        json: {
          channelId: channel1,
          message: 'Hello'
        }
      }
    );
    message1 = JSON.parse(createMessage.getBody() as string).messageId;

    request(
      'POST',
      SERVER_URL + '/message/react/v1',
      {
        headers: {
          token: user1
        },
        json: {
          messageId: message1,
          reactId: 1
        }
      }
    );
  });

  describe('error cases', () => {
    test('invalid token', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/unreact/v1',
        {
          headers: {
            token: '-9999'
          },
          json: {
            messageId: message1,
            reactId: 1
          }
        }
      );
      expect(res.statusCode).toBe(FORBIDDEN);
    });

    test('invalid messageId', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/unreact/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: -999,
            reactId: 1
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('invalid reactId', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/unreact/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message1,
            reactId: 1000
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('react not on message', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/unreact/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message1,
            reactId: 1
          }
        }
      );
      expect(res.statusCode).toBe(OK);

      const res2 = request(
        'POST',
        SERVER_URL + '/message/unreact/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message1,
            reactId: 1
          }
        }
      );
      expect(res2.statusCode).toBe(INPUT_ERROR);
    });

    test('user not in channel', () => {
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
      const user2 = JSON.parse(createUser2.getBody() as string).token;

      const res = request(
        'POST',
        SERVER_URL + '/message/unreact/v1',
        {
          headers: {
            token: user2
          },
          json: {
            messageId: message1,
            reactId: 1
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });
    test('user not in dm', () => {
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
      const user2 = JSON.parse(createUser2.getBody() as string);
      const createDm = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user2.token,
          },
          json: {
            uIds: [user2.authUserId]
          }
        }
      );
      const dm1 = JSON.parse(createDm.getBody() as string).dmId;

      const sendMessage2 = request(
        'POST',
        SERVER_URL + '/message/senddm/v2',
        {
          headers: {
            token: user2.token
          },
          json: {
            dmId: dm1,
            message: 'Hello'
          }
        }
      );

      const message2 = JSON.parse(sendMessage2.getBody() as string).messageId;

      const react1 = request(
        'POST',
        SERVER_URL + '/message/react/v1',
        {
          headers: {
            token: user2.token
          },
          json: {
            messageId: message2,
            reactId: 1
          }
        }
      );
      expect(react1.statusCode).toBe(OK);

      const unreact = request(
        'POST',
        SERVER_URL + '/message/unreact/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message2,
            reactId: 1
          }
        }
      );
      expect(unreact.statusCode).toBe(INPUT_ERROR);
    });
  });

  describe('success cases', () => {
    test('basic success', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/unreact/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message1,
            reactId: 1
          }
        }
      );
      expect(res.statusCode).toBe(OK);

      const message = request(
        'GET',
        SERVER_URL + '/channel/messages/v3',
        {
          headers: {
            token: user1
          },
          qs: {
            channelId: channel1,
            start: 0
          }
        }
      );

      const checkMessage = JSON.parse(message.getBody() as string);
      expect(checkMessage.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            reacts: expect.arrayContaining([
              expect.objectContaining({uIds: []})
            ])
          })
        ])
      );
    });
    test('for dms', () => {
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
      const user2 = JSON.parse(createUser2.getBody() as string);
      const createDm = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user2.token,
          },
          json: {
            uIds: [user2.authUserId]
          }
        }
      );
      const dm1 = JSON.parse(createDm.getBody() as string).dmId;

      const sendMessage2 = request(
        'POST',
        SERVER_URL + '/message/senddm/v2',
        {
          headers: {
            token: user2.token
          },
          json: {
            dmId: dm1,
            message: 'Hello'
          }
        }
      );

      const message2 = JSON.parse(sendMessage2.getBody() as string).messageId;

      const react1 = request(
        'POST',
        SERVER_URL + '/message/react/v1',
        {
          headers: {
            token: user2.token
          },
          json: {
            messageId: message2,
            reactId: 1
          }
        }
      );
      expect(react1.statusCode).toBe(OK);

      const unreact = request(
        'POST',
        SERVER_URL + '/message/unreact/v1',
        {
          headers: {
            token: user2.token
          },
          json: {
            messageId: message2,
            reactId: 1
          }
        }
      );
      expect(unreact.statusCode).toBe(OK);

      const message = request(
        'GET',
        SERVER_URL + '/dm/messages/v2',
        {
          headers: {
            token: user2.token
          },
          qs: {
            dmId: dm1,
            start: 0
          }
        }
      );
      const checkMessage = JSON.parse(message.getBody() as string);
      expect(checkMessage.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            reacts: expect.arrayContaining([
              expect.objectContaining({uIds: []})
            ])
          })
        ])
      );
    });

    test('successful unreact when two people reacted', () => {
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
      const user2 = JSON.parse(createUser2.getBody() as string).token;

      request(
        'POST',
        SERVER_URL + '/channel/join/v3',
        {
          headers: {
            token: user2
          },
          json: {
            channelId: channel1,
          }
        }
      );

      request(
        'POST',
        SERVER_URL + '/message/react/v1',
        {
          headers: {
            token: user2
          },
          json: {
            messageId: message1,
            reactId: 1
          }
        }
      );

      const unreact = request(
        'POST',
        SERVER_URL + '/message/unreact/v1',
        {
          headers: {
            token: user2
          },
          json: {
            messageId: message1,
            reactId: 1
          }
        }
      );
      expect(unreact.statusCode).toBe(OK);
    });
  });
});

describe('tests for /message/pin/v1', () => {
  let user1, channel1, message1;

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
    user1 = JSON.parse(createUser.getBody() as string).token;

    const createChannel = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user1,
        },
        json: {
          name: 'Channel1',
          isPublic: true
        }
      }
    );
    channel1 = JSON.parse(createChannel.getBody() as string).channelId;

    const createMessage = request(
      'POST',
      SERVER_URL + '/message/send/v2',
      {
        headers: {
          token: user1
        },
        json: {
          channelId: channel1,
          message: 'Hello'
        }
      }
    );
    message1 = JSON.parse(createMessage.getBody() as string).messageId;
  });

  describe('error cases', () => {
    test('invalid token', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/pin/v1',
        {
          headers: {
            token: '-9999'
          },
          json: {
            messageId: message1,
          }
        }
      );
      expect(res.statusCode).toBe(FORBIDDEN);
    });

    test('invalid messageId', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/pin/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: -999,
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('user not in channel', () => {
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
      const user2 = JSON.parse(createUser2.getBody() as string).token;

      const res = request(
        'POST',
        SERVER_URL + '/message/pin/v1',
        {
          headers: {
            token: user2
          },
          json: {
            messageId: message1,
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('pinning twice', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/pin/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message1,
          }
        }
      );
      expect(res.statusCode).toBe(OK);

      const res2 = request(
        'POST',
        SERVER_URL + '/message/pin/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message1,
          }
        }
      );
      expect(res2.statusCode).toBe(INPUT_ERROR);
    });

    test('User not in DM', () => {
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
      const user2 = JSON.parse(createUser2.getBody() as string);
      const createDm = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user2.token,
          },
          json: {
            uIds: [user2.authUserId]
          }
        }
      );
      const dm1 = JSON.parse(createDm.getBody() as string).dmId;

      const sendMessage2 = request(
        'POST',
        SERVER_URL + '/message/senddm/v2',
        {
          headers: {
            token: user2.token
          },
          json: {
            dmId: dm1,
            message: 'Hello'
          }
        }
      );

      const message2 = JSON.parse(sendMessage2.getBody() as string).messageId;

      const res = request(
        'POST',
        SERVER_URL + '/message/pin/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message2,
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });
  });

  describe('success cases', () => {
    test('basic success', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/pin/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message1,
          }
        }
      );
      expect(res.statusCode).toBe(OK);

      const message = request(
        'GET',
        SERVER_URL + '/channel/messages/v3',
        {
          headers: {
            token: user1
          },
          qs: {
            channelId: channel1,
            start: 0
          }
        }
      );
      const checkMessage = JSON.parse(message.getBody() as string);
      expect(checkMessage.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            isPinned: true
          })
        ])
      );
    });
    test('success in dm', () => {
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
      const user2 = JSON.parse(createUser2.getBody() as string);
      const createDm = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user2.token,
          },
          json: {
            uIds: [user2.authUserId]
          }
        }
      );
      const dm1 = JSON.parse(createDm.getBody() as string).dmId;

      const sendMessage2 = request(
        'POST',
        SERVER_URL + '/message/senddm/v2',
        {
          headers: {
            token: user2.token
          },
          json: {
            dmId: dm1,
            message: 'Hello'
          }
        }
      );

      const message2 = JSON.parse(sendMessage2.getBody() as string).messageId;

      const res = request(
        'POST',
        SERVER_URL + '/message/pin/v1',
        {
          headers: {
            token: user2.token
          },
          json: {
            messageId: message2,
          }
        }
      );
      expect(res.statusCode).toBe(OK);
    });
  });
});

describe('tests for /message/unpin/v1', () => {
  let user1, channel1, message1;

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
    user1 = JSON.parse(createUser.getBody() as string).token;

    const createChannel = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user1,
        },
        json: {
          name: 'Channel1',
          isPublic: true
        }
      }
    );
    channel1 = JSON.parse(createChannel.getBody() as string).channelId;

    const createMessage = request(
      'POST',
      SERVER_URL + '/message/send/v2',
      {
        headers: {
          token: user1
        },
        json: {
          channelId: channel1,
          message: 'Hello'
        }
      }
    );
    message1 = JSON.parse(createMessage.getBody() as string).messageId;

    request(
      'POST',
      SERVER_URL + '/message/pin/v1',
      {
        headers: {
          token: user1
        },
        json: {
          messageId: message1,
        }
      }
    );
  });

  describe('error cases', () => {
    test('invalid token', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/unpin/v1',
        {
          headers: {
            token: '-9999'
          },
          json: {
            messageId: message1,
          }
        }
      );
      expect(res.statusCode).toBe(FORBIDDEN);
    });

    test('invalid messageId', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/unpin/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: -999,
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('user not in channel', () => {
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
      const user2 = JSON.parse(createUser2.getBody() as string).token;

      const res = request(
        'POST',
        SERVER_URL + '/message/unpin/v1',
        {
          headers: {
            token: user2
          },
          json: {
            messageId: message1,
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('unpinned message', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/unpin/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message1,
          }
        }
      );
      expect(res.statusCode).toBe(OK);

      const res2 = request(
        'POST',
        SERVER_URL + '/message/unpin/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message1,
          }
        }
      );
      expect(res2.statusCode).toBe(INPUT_ERROR);
    });

    test('user is not in dm', () => {
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
      const user2 = JSON.parse(createUser2.getBody() as string);
      const createDm = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user2.token,
          },
          json: {
            uIds: [user2.authUserId]
          }
        }
      );
      const dm1 = JSON.parse(createDm.getBody() as string).dmId;

      const sendMessage2 = request(
        'POST',
        SERVER_URL + '/message/senddm/v2',
        {
          headers: {
            token: user2.token
          },
          json: {
            dmId: dm1,
            message: 'Hello'
          }
        }
      );

      const message2 = JSON.parse(sendMessage2.getBody() as string).messageId;

      request(
        'POST',
        SERVER_URL + '/message/pin/v1',
        {
          headers: {
            token: user2.token
          },
          json: {
            messageId: message2,
          }
        }
      );

      const res = request(
        'POST',
        SERVER_URL + '/message/unpin/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message2,
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });
  });

  describe('success cases', () => {
    test('basic success', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/unpin/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message1,
          }
        }
      );
      expect(res.statusCode).toBe(OK);

      const message = request(
        'GET',
        SERVER_URL + '/channel/messages/v3',
        {
          headers: {
            token: user1
          },
          qs: {
            channelId: channel1,
            start: 0
          }
        }
      );
      const checkMessage = JSON.parse(message.getBody() as string);
      expect(checkMessage.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            isPinned: false
          })
        ])
      );
    });

    test('user unpin in dm', () => {
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
      const user2 = JSON.parse(createUser2.getBody() as string);
      const createDm = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user2.token,
          },
          json: {
            uIds: [user2.authUserId]
          }
        }
      );
      const dm1 = JSON.parse(createDm.getBody() as string).dmId;

      const sendMessage2 = request(
        'POST',
        SERVER_URL + '/message/senddm/v2',
        {
          headers: {
            token: user2.token
          },
          json: {
            dmId: dm1,
            message: 'Hello'
          }
        }
      );

      const message2 = JSON.parse(sendMessage2.getBody() as string).messageId;

      request(
        'POST',
        SERVER_URL + '/message/pin/v1',
        {
          headers: {
            token: user2.token
          },
          json: {
            messageId: message2,
          }
        }
      );

      const res = request(
        'POST',
        SERVER_URL + '/message/unpin/v1',
        {
          headers: {
            token: user2.token
          },
          json: {
            messageId: message2,
          }
        }
      );
      expect(res.statusCode).toBe(OK);
    });
  });
});

describe('tests for /message/share/v1', () => {
  let user1, channel1, channel2, dm1, message1, message2;

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
    user1 = JSON.parse(createUser.getBody() as string).token;

    const createChannel = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user1,
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
          token: user1,
        },
        json: {
          name: 'Channel2',
          isPublic: true
        }
      }
    );
    channel2 = JSON.parse(createChannel2.getBody() as string).channelId;

    const createDm = request(
      'POST',
      SERVER_URL + '/dm/create/v2',
      {
        headers: {
          token: user1
        },
        json: {
          uIds: []
        }
      }
    );
    dm1 = JSON.parse(createDm.getBody() as string).dmId;

    const createMessage = request(
      'POST',
      SERVER_URL + '/message/send/v2',
      {
        headers: {
          token: user1
        },
        json: {
          channelId: channel1,
          message: 'Hello'
        }
      }
    );
    message1 = JSON.parse(createMessage.getBody() as string).messageId;

    const createMessage2 = request(
      'POST',
      SERVER_URL + '/message/senddm/v2',
      {
        headers: {
          token: user1
        },
        json: {
          dmId: dm1,
          message: 'Goodbye'
        }
      }
    );
    message2 = JSON.parse(createMessage2.getBody() as string).messageId;
  });

  describe('error cases', () => {
    test('invalid token', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: '-9999'
          },
          json: {
            ogMessageId: message1,
            message: 'hello',
            channelId: channel1,
            dmId: -1
          }
        }
      );
      expect(res.statusCode).toBe(FORBIDDEN);
    });

    test('invalid ogMessageId', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: user1
          },
          json: {
            ogMessageId: -1,
            message: 'hello',
            channelId: channel1,
            dmId: -1
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('message too long', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: user1
          },
          json: {
            ogMessageId: message1,
            message: 'A'.repeat(1001),
            channelId: channel1,
            dmId: -1
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('both channelId and dmId === -1', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: user1
          },
          json: {
            ogMessageId: message1,
            message: 'Hello',
            channelId: -1,
            dmId: -1
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('neither channelId and dmId === -1', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: user1
          },
          json: {
            ogMessageId: message1,
            message: 'Hello',
            channelId: channel1,
            dmId: dm1
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('invalid channelId', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: user1
          },
          json: {
            ogMessageId: message1,
            message: 'Hello',
            channelId: 3027327,
            dmId: -1
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('Invalid dmId', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: user1
          },
          json: {
            ogMessageId: message1,
            message: 'Hello',
            channelId: -1,
            dmId: 28037290137
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('User not in channel containing message', () => {
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
      const user2 = JSON.parse(createUser2.getBody() as string).token;

      request(
        'POST',
        SERVER_URL + '/channel/join/v3',
        {
          headers: {
            token: user2
          },
          json: {
            channelId: channel2,
          }
        }
      );

      const res = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: user2
          },
          json: {
            ogMessageId: message1,
            message: 'Hello',
            channelId: channel2,
            dmId: -1
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('User not in dm containing message', () => {
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
      const user2 = JSON.parse(createUser2.getBody() as string);

      const createDm2 = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user1
          },
          json: {
            uIds: [user2.authUserId]
          }
        }
      );
      const dm2 = JSON.parse(createDm2.getBody() as string).dmId;

      const res = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: user2.token
          },
          json: {
            ogMessageId: message2,
            message: 'Hello',
            channelId: -1,
            dmId: dm2
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('user not in channel', () => {
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
      const user2 = JSON.parse(createUser2.getBody() as string).token;

      request(
        'POST',
        SERVER_URL + '/channel/join/v3',
        {
          headers: {
            token: user2
          },
          json: {
            channelId: channel1,
          }
        }
      );

      const res = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: user2
          },
          json: {
            ogMessageId: message1,
            message: 'Hello',
            channelId: channel2,
            dmId: -1
          }
        }
      );
      expect(res.statusCode).toBe(FORBIDDEN);
    });

    test('User not in dm', () => {
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
      const user2 = JSON.parse(createUser2.getBody() as string);

      const createDm2 = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user1
          },
          json: {
            uIds: [user2.authUserId]
          }
        }
      );
      const dm2 = JSON.parse(createDm2.getBody() as string).dmId;

      const createMessage3 = request(
        'POST',
        SERVER_URL + '/message/senddm/v2',
        {
          headers: {
            token: user1
          },
          json: {
            dmId: dm2,
            message: 'AAAAAA'
          }
        }
      );
      const message3 = JSON.parse(createMessage3.getBody() as string).messageId;

      const res = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: user2.token
          },
          json: {
            ogMessageId: message3,
            message: 'Hello',
            channelId: -1,
            dmId: dm1
          }
        }
      );
      expect(res.statusCode).toBe(FORBIDDEN);
    });
  });

  describe('success cases', () => {
    test('basic success for channel', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: user1
          },
          json: {
            ogMessageId: message1,
            message: 'Hello',
            channelId: channel1,
            dmId: -1
          }
        }
      );
      expect(res.statusCode).toBe(OK);

      const message = request(
        'GET',
        SERVER_URL + '/channel/messages/v3',
        {
          headers: {
            token: user1
          },
          qs: {
            channelId: channel1,
            start: 0
          }
        }
      );
      const checkMessage = JSON.parse(message.getBody() as string);
      expect(checkMessage.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ message: 'Hello\n"""\nHello\n"""' })
        ])
      );
    });

    test('double share', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: user1
          },
          json: {
            ogMessageId: message1,
            message: 'Hello',
            channelId: channel1,
            dmId: -1
          }
        }
      );
      expect(res.statusCode).toBe(OK);
      const sharedMessage = JSON.parse(res.getBody() as string).sharedMessageId;

      const res2 = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: user1
          },
          json: {
            ogMessageId: sharedMessage,
            message: 'Hello',
            channelId: channel1,
            dmId: -1
          }
        }
      );
      expect(res2.statusCode).toBe(OK);

      const message = request(
        'GET',
        SERVER_URL + '/channel/messages/v3',
        {
          headers: {
            token: user1
          },
          qs: {
            channelId: channel1,
            start: 0
          }
        }
      );
      const checkMessage = JSON.parse(message.getBody() as string);
      expect(checkMessage.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ message: 'Hello\n"""\nHello\n\t\n\t"""\n\tHello\n\t"""\n"""' })
        ])
      );
    });

    test('basic success for dm', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: user1
          },
          json: {
            ogMessageId: message2,
            message: 'Hello',
            channelId: -1,
            dmId: dm1
          }
        }
      );
      expect(res.statusCode).toBe(OK);
      const sharedMessage = JSON.parse(res.getBody() as string).sharedMessageId;

      const message = request(
        'GET',
        SERVER_URL + '/dm/messages/v2',
        {
          headers: {
            token: user1
          },
          qs: {
            dmId: dm1,
            start: 0
          }
        }
      );
      const checkMessage = JSON.parse(message.getBody() as string);
      expect(checkMessage.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ message: 'Hello\n"""\nGoodbye\n"""' })
        ])
      );

      const res2 = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: user1
          },
          json: {
            ogMessageId: sharedMessage,
            message: 'Hello',
            channelId: -1,
            dmId: dm1
          }
        }
      );
      expect(res2.statusCode).toBe(OK);

      const checkMessageAgain = request(
        'GET',
        SERVER_URL + '/dm/messages/v2',
        {
          headers: {
            token: user1
          },
          qs: {
            dmId: dm1,
            start: 0
          }
        }
      );
      const checkMessage2 = JSON.parse(checkMessageAgain.getBody() as string);
      expect(checkMessage2.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ message: 'Hello\n"""\nHello\n\t\n\t"""\n\tGoodbye\n\t"""\n"""' })
        ])
      );
    });
  });
});

describe('test for message/react/v1', () => {
  let user1, channel1, message1;

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
    user1 = JSON.parse(createUser.getBody() as string).token;

    const createChannel = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user1,
        },
        json: {
          name: 'Channel1',
          isPublic: true
        }
      }
    );
    channel1 = JSON.parse(createChannel.getBody() as string).channelId;

    const createMessage = request(
      'POST',
      SERVER_URL + '/message/send/v2',
      {
        headers: {
          token: user1
        },
        json: {
          channelId: channel1,
          message: 'Hello'
        }
      }
    );
    message1 = JSON.parse(createMessage.getBody() as string).messageId;
  });

  describe('error cases', () => {
    test('invalid token', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/react/v1',
        {
          headers: {
            token: '-9999'
          },
          json: {
            messageId: message1,
            reactId: 1
          }
        }
      );
      expect(res.statusCode).toBe(FORBIDDEN);
    });

    test('invalid messageId', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/react/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: -999,
            reactId: 1
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('user not in channel', () => {
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
      const user2 = JSON.parse(createUser2.getBody() as string).token;

      const res = request(
        'POST',
        SERVER_URL + '/message/react/v1',
        {
          headers: {
            token: user2
          },
          json: {
            messageId: message1,
            reactId: 1
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('invalid reactId', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/react/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message1,
            reactId: 10000
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('reacting twice', () => {
      const react1 = request(
        'POST',
        SERVER_URL + '/message/react/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message1,
            reactId: 1
          }
        }
      );
      expect(react1.statusCode).toBe(OK);

      const res = request(
        'POST',
        SERVER_URL + '/message/react/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message1,
            reactId: 1
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });
  });

  describe('success cases', () => {
    test('basic success case', () => {
      const react1 = request(
        'POST',
        SERVER_URL + '/message/react/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message1,
            reactId: 1
          }
        }
      );
      expect(react1.statusCode).toBe(OK);

      const message = request(
        'GET',
        SERVER_URL + '/channel/messages/v3',
        {
          headers: {
            token: user1
          },
          qs: {
            channelId: channel1,
            start: 0
          }
        }
      );

      const checkMessage = JSON.parse(message.getBody() as string);
      expect(checkMessage.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            reacts: expect.arrayContaining([
              expect.objectContaining({
                reactId: 1,
                isThisUserReacted: true
              })
            ])
          })
        ])
      );
    });

    test('for dms', () => {
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
      const user2 = JSON.parse(createUser2.getBody() as string);
      const createDm = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user2.token,
          },
          json: {
            uIds: [user2.authUserId]
          }
        }
      );
      const dm1 = JSON.parse(createDm.getBody() as string).dmId;

      const sendMessage2 = request(
        'POST',
        SERVER_URL + '/message/senddm/v2',
        {
          headers: {
            token: user2.token
          },
          json: {
            dmId: dm1,
            message: 'Hello'
          }
        }
      );

      const message2 = JSON.parse(sendMessage2.getBody() as string).messageId;

      const react1 = request(
        'POST',
        SERVER_URL + '/message/react/v1',
        {
          headers: {
            token: user2.token
          },
          json: {
            messageId: message2,
            reactId: 1
          }
        }
      );
      expect(react1.statusCode).toBe(OK);
    });

    test('more than one user reaction', () => {
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
      const user2 = JSON.parse(createUser2.getBody() as string).token;

      request(
        'POST',
        SERVER_URL + '/channel/join/v3',
        {
          headers: {
            token: user2,
          },
          json: {
            channelId: channel1,
          }
        }
      );

      const res = request(
        'POST',
        SERVER_URL + '/message/react/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message1,
            reactId: 1
          }
        }
      );
      expect(res.statusCode).toBe(OK);

      const res2 = request(
        'POST',
        SERVER_URL + '/message/react/v1',
        {
          headers: {
            token: user2
          },
          json: {
            messageId: message1,
            reactId: 1
          }
        }
      );
      expect(res2.statusCode).toBe(OK);
    });
  });
});

describe('tests for /message/unreact/v1', () => {
  let user1, channel1, message1;

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
    user1 = JSON.parse(createUser.getBody() as string).token;

    const createChannel = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user1,
        },
        json: {
          name: 'Channel1',
          isPublic: true
        }
      }
    );
    channel1 = JSON.parse(createChannel.getBody() as string).channelId;

    const createMessage = request(
      'POST',
      SERVER_URL + '/message/send/v2',
      {
        headers: {
          token: user1
        },
        json: {
          channelId: channel1,
          message: 'Hello'
        }
      }
    );
    message1 = JSON.parse(createMessage.getBody() as string).messageId;

    request(
      'POST',
      SERVER_URL + '/message/react/v1',
      {
        headers: {
          token: user1
        },
        json: {
          messageId: message1,
          reactId: 1
        }
      }
    );
  });

  describe('error cases', () => {
    test('invalid token', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/unreact/v1',
        {
          headers: {
            token: '-9999'
          },
          json: {
            messageId: message1,
            reactId: 1
          }
        }
      );
      expect(res.statusCode).toBe(FORBIDDEN);
    });

    test('invalid messageId', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/unreact/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: -999,
            reactId: 1
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('invalid reactId', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/unreact/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message1,
            reactId: 1000
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('react not on message', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/unreact/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message1,
            reactId: 1
          }
        }
      );
      expect(res.statusCode).toBe(OK);

      const res2 = request(
        'POST',
        SERVER_URL + '/message/unreact/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message1,
            reactId: 1
          }
        }
      );
      expect(res2.statusCode).toBe(INPUT_ERROR);
    });
  });

  describe('success cases', () => {
    test('basic success', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/unreact/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message1,
            reactId: 1
          }
        }
      );
      expect(res.statusCode).toBe(OK);

      const message = request(
        'GET',
        SERVER_URL + '/channel/messages/v3',
        {
          headers: {
            token: user1
          },
          qs: {
            channelId: channel1,
            start: 0
          }
        }
      );

      const checkMessage = JSON.parse(message.getBody() as string);
      expect(checkMessage.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            reacts: expect.arrayContaining([
              expect.objectContaining({uIds: []})
            ])
          })
        ])
      );
    });
  });
});

describe('tests for /message/pin/v1', () => {
  let user1, channel1, message1;

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
    user1 = JSON.parse(createUser.getBody() as string).token;

    const createChannel = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user1,
        },
        json: {
          name: 'Channel1',
          isPublic: true
        }
      }
    );
    channel1 = JSON.parse(createChannel.getBody() as string).channelId;

    const createMessage = request(
      'POST',
      SERVER_URL + '/message/send/v2',
      {
        headers: {
          token: user1
        },
        json: {
          channelId: channel1,
          message: 'Hello'
        }
      }
    );
    message1 = JSON.parse(createMessage.getBody() as string).messageId;
  });

  describe('error cases', () => {
    test('invalid token', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/pin/v1',
        {
          headers: {
            token: '-999999'
          },
          json: {
            messageId: message1,
          }
        }
      );
      expect(res.statusCode).toBe(FORBIDDEN);
    });

    test('invalid messageId', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/pin/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: -999,
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('user not in channel', () => {
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
      const user2 = JSON.parse(createUser2.getBody() as string).token;

      const res = request(
        'POST',
        SERVER_URL + '/message/pin/v1',
        {
          headers: {
            token: user2
          },
          json: {
            messageId: message1,
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });
  });

  describe('success cases', () => {
    test('basic success', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/pin/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message1,
          }
        }
      );
      expect(res.statusCode).toBe(OK);

      const message = request(
        'GET',
        SERVER_URL + '/channel/messages/v3',
        {
          headers: {
            token: user1
          },
          qs: {
            channelId: channel1,
            start: 0
          }
        }
      );
      const checkMessage = JSON.parse(message.getBody() as string);
      expect(checkMessage.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            isPinned: true
          })
        ])
      );
    });
  });
});

describe('tests for /message/unpin/v1', () => {
  let user1, channel1, message1;

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
    user1 = JSON.parse(createUser.getBody() as string).token;

    const createChannel = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user1,
        },
        json: {
          name: 'Channel1',
          isPublic: true
        }
      }
    );
    channel1 = JSON.parse(createChannel.getBody() as string).channelId;

    const createMessage = request(
      'POST',
      SERVER_URL + '/message/send/v2',
      {
        headers: {
          token: user1
        },
        json: {
          channelId: channel1,
          message: 'Hello'
        }
      }
    );
    message1 = JSON.parse(createMessage.getBody() as string).messageId;

    request(
      'POST',
      SERVER_URL + '/message/pin/v1',
      {
        headers: {
          token: user1
        },
        json: {
          messageId: message1,
        }
      }
    );
  });

  describe('error cases', () => {
    test('invalid token', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/unpin/v1',
        {
          headers: {
            token: '-9999'
          },
          json: {
            messageId: message1,
          }
        }
      );
      expect(res.statusCode).toBe(FORBIDDEN);
    });

    test('invalid messageId', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/unpin/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: -999,
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('user not in channel', () => {
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
      const user2 = JSON.parse(createUser2.getBody() as string).token;

      const res = request(
        'POST',
        SERVER_URL + '/message/unpin/v1',
        {
          headers: {
            token: user2
          },
          json: {
            messageId: message1,
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('unpinned message', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/unpin/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message1,
          }
        }
      );
      expect(res.statusCode).toBe(OK);

      const res2 = request(
        'POST',
        SERVER_URL + '/message/unpin/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message1,
          }
        }
      );
      expect(res2.statusCode).toBe(INPUT_ERROR);
    });
  });

  describe('success cases', () => {
    test('basic success', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/unpin/v1',
        {
          headers: {
            token: user1
          },
          json: {
            messageId: message1,
          }
        }
      );
      expect(res.statusCode).toBe(OK);

      const message = request(
        'GET',
        SERVER_URL + '/channel/messages/v3',
        {
          headers: {
            token: user1
          },
          qs: {
            channelId: channel1,
            start: 0
          }
        }
      );
      const checkMessage = JSON.parse(message.getBody() as string);
      expect(checkMessage.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            isPinned: false
          })
        ])
      );
    });
  });
});

describe('tests for /message/share/v1', () => {
  let user1, channel1, channel2, dm1, message1, message2;

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
    user1 = JSON.parse(createUser.getBody() as string).token;

    const createChannel = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user1,
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
          token: user1,
        },
        json: {
          name: 'Channel2',
          isPublic: true
        }
      }
    );
    channel2 = JSON.parse(createChannel2.getBody() as string).channelId;

    const createDm = request(
      'POST',
      SERVER_URL + '/dm/create/v2',
      {
        headers: {
          token: user1
        },
        json: {
          uIds: []
        }
      }
    );
    dm1 = JSON.parse(createDm.getBody() as string).dmId;

    const createMessage = request(
      'POST',
      SERVER_URL + '/message/send/v2',
      {
        headers: {
          token: user1
        },
        json: {
          channelId: channel1,
          message: 'Hello'
        }
      }
    );
    message1 = JSON.parse(createMessage.getBody() as string).messageId;

    const createMessage2 = request(
      'POST',
      SERVER_URL + '/message/senddm/v2',
      {
        headers: {
          token: user1
        },
        json: {
          dmId: dm1,
          message: 'Goodbye'
        }
      }
    );
    message2 = JSON.parse(createMessage2.getBody() as string).messageId;
  });

  describe('error cases', () => {
    test('invalid token', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: '-9999'
          },
          json: {
            ogMessageId: message1,
            message: 'hello',
            channelId: channel1,
            dmId: -1
          }
        }
      );
      expect(res.statusCode).toBe(FORBIDDEN);
    });

    test('invalid ogMessageId', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: user1
          },
          json: {
            ogMessageId: -1,
            message: 'hello',
            channelId: channel1,
            dmId: -1
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('message too long', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: user1
          },
          json: {
            ogMessageId: message1,
            message: 'A'.repeat(1001),
            channelId: channel1,
            dmId: -1
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('both channelId and dmId === -1', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: user1
          },
          json: {
            ogMessageId: message1,
            message: 'Hello',
            channelId: -1,
            dmId: -1
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('neither channelId and dmId === -1', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: user1
          },
          json: {
            ogMessageId: message1,
            message: 'Hello',
            channelId: channel1,
            dmId: dm1
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('invalid channelId', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: user1
          },
          json: {
            ogMessageId: message1,
            message: 'Hello',
            channelId: 3027327,
            dmId: -1
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('Invalid dmId', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: user1
          },
          json: {
            ogMessageId: message1,
            message: 'Hello',
            channelId: -1,
            dmId: 28037290137
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('User not in channel containing message', () => {
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
      const user2 = JSON.parse(createUser2.getBody() as string).token;

      request(
        'POST',
        SERVER_URL + '/channel/join/v3',
        {
          headers: {
            token: user2
          },
          json: {
            channelId: channel2,
          }
        }
      );

      const res = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: user2
          },
          json: {
            ogMessageId: message1,
            message: 'Hello',
            channelId: channel2,
            dmId: -1
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('User not in dm containing message', () => {
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
      const user2 = JSON.parse(createUser2.getBody() as string);

      const createDm2 = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user1
          },
          json: {
            uIds: [user2.authUserId]
          }
        }
      );
      const dm2 = JSON.parse(createDm2.getBody() as string).dmId;

      const res = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: user2.token
          },
          json: {
            ogMessageId: message2,
            message: 'Hello',
            channelId: -1,
            dmId: dm2
          }
        }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    });

    test('user not in channel', () => {
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
      const user2 = JSON.parse(createUser2.getBody() as string).token;

      request(
        'POST',
        SERVER_URL + '/channel/join/v3',
        {
          headers: {
            token: user2
          },
          json: {
            channelId: channel1,
          }
        }
      );

      const res = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: user2
          },
          json: {
            ogMessageId: message1,
            message: 'Hello',
            channelId: channel2,
            dmId: -1
          }
        }
      );
      expect(res.statusCode).toBe(FORBIDDEN);
    });

    test('User not in dm', () => {
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
      const user2 = JSON.parse(createUser2.getBody() as string);

      const createDm2 = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user1
          },
          json: {
            uIds: [user2.authUserId]
          }
        }
      );
      const dm2 = JSON.parse(createDm2.getBody() as string).dmId;

      const createMessage3 = request(
        'POST',
        SERVER_URL + '/message/senddm/v2',
        {
          headers: {
            token: user1
          },
          json: {
            dmId: dm2,
            message: 'AAAAAA'
          }
        }
      );
      const message3 = JSON.parse(createMessage3.getBody() as string).messageId;

      const res = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: user2
          },
          json: {
            ogMessageId: message3,
            message: 'Hello',
            channelId: -1,
            dmId: dm1
          }
        }
      );
      expect(res.statusCode).toBe(FORBIDDEN);
    });
  });

  describe('success cases', () => {
    test('basic success for channel', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: user1
          },
          json: {
            ogMessageId: message1,
            message: 'Hello',
            channelId: channel1,
            dmId: -1
          }
        }
      );
      expect(res.statusCode).toBe(OK);

      const message = request(
        'GET',
        SERVER_URL + '/channel/messages/v3',
        {
          headers: {
            token: user1
          },
          qs: {
            channelId: channel1,
            start: 0
          }
        }
      );
      const checkMessage = JSON.parse(message.getBody() as string);
      expect(checkMessage.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ message: 'Hello\n"""\nHello\n"""' })
        ])
      );
    });

    test('double share', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: user1
          },
          json: {
            ogMessageId: message1,
            message: 'Hello',
            channelId: channel1,
            dmId: -1
          }
        }
      );
      expect(res.statusCode).toBe(OK);
      const sharedMessage = JSON.parse(res.getBody() as string).sharedMessageId;

      const res2 = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: user1
          },
          json: {
            ogMessageId: sharedMessage,
            message: 'Hello',
            channelId: channel1,
            dmId: -1
          }
        }
      );
      expect(res2.statusCode).toBe(OK);

      const message = request(
        'GET',
        SERVER_URL + '/channel/messages/v3',
        {
          headers: {
            token: user1
          },
          qs: {
            channelId: channel1,
            start: 0
          }
        }
      );
      const checkMessage = JSON.parse(message.getBody() as string);
      expect(checkMessage.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ message: 'Hello\n"""\nHello\n\t\n\t"""\n\tHello\n\t"""\n"""' })
        ])
      );
    });

    test('basic success for dm', () => {
      const res = request(
        'POST',
        SERVER_URL + '/message/share/v1',
        {
          headers: {
            token: user1
          },
          json: {
            ogMessageId: message2,
            message: 'Hello',
            channelId: -1,
            dmId: dm1
          }
        }
      );
      expect(res.statusCode).toBe(OK);

      const message = request(
        'GET',
        SERVER_URL + '/dm/messages/v2',
        {
          headers: {
            token: user1
          },
          qs: {
            dmId: dm1,
            start: 0
          }
        }
      );
      const checkMessage = JSON.parse(message.getBody() as string);
      expect(checkMessage.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ message: 'Hello\n"""\nGoodbye\n"""' })
        ])
      );
    });
  });
});

//= ========================================= TEST FOR MESSAGE SENDLATER V1 =============================

describe('test for /message/sendlater/v1', () => {
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

    user1 = JSON.parse(createUser.getBody() as string).token;
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
          token: user1
        },
        json: {
          name: 'Channel1',
          isPublic: true
        }
      }
    );

    channel1 = JSON.parse(createChannel.getBody() as string).channelId;
  });

  test('when channelId is not valid', () => {
    const res = request(
      'POST',
      SERVER_URL + '/message/sendlater/v1',
      {
        headers: {
          token: user1
        },

        json: {
          channelId: -999,
          message: 'Hello world',
          timeSent: getTimeStamp()
        }
      }
    );
    expect(res.statusCode).toBe(INPUT_ERROR);
  });

  test('when message less than one', () => {
    const res = request(
      'POST',
      SERVER_URL + '/message/sendlater/v1',
      {
        headers: {
          token: user1
        },
        json: {
          channelId: channel1,
          message: '',
          timeSent: getTimeStamp()
        }
      }
    );
    expect(res.statusCode).toBe(INPUT_ERROR);
  });

  test('when message great than 1000', () => {
    const res = request(
      'POST',
      SERVER_URL + '/message/sendlater/v1',
      {
        headers: {
          token: user1
        },
        json: {
          channelId: channel1,
          message: 'A'.repeat(1001),
          timeSent: getTimeStamp()
        }
      }
    );
    expect(res.statusCode).toBe(INPUT_ERROR);
  });

  test('when token is invalid', () => {
    const res = request(
      'POST',
      SERVER_URL + '/message/sendlater/v1',
      {
        headers: {
          token: '-999'
        },
        json: {
          token: '-99999999',
          channelId: channel1,
          message: 'Hello',
          timeSent: getTimeStamp()
        }
      }
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('when user is not in channel', () => {
    const res = request(
      'POST',
      SERVER_URL + '/message/sendlater/v1',
      {
        headers: {
          token: user2
        },
        json: {
          channelId: channel1,
          message: 'Hello',
          timeSent: getTimeStamp() + 2
        }
      }

    );
    expect(res.statusCode).toBe(403);
  });

  test('time sent is in past', () => {
    const res = request(
      'POST',
      SERVER_URL + '/message/sendlater/v1',
      {
        headers: {
          token: user2
        },
        json: {
          channelId: channel1,
          message: 'Hello',
          timeSent: getTimeStamp() - 3,
        }
      }
    );
    expect(res.statusCode).toBe(400);
  });

  test('test for successful/message/sendlater/v1', () => {
    const res = request(
      'POST',
      SERVER_URL + '/message/sendlater/v1',
      {
        headers: {
          token: user1
        },
        json: {
          channelId: channel1,
          message: 'Hello',
          timeSent: getTimeStamp() + 2
        }
      }
    );

    const start = getTimeStamp();
    let now = start;
    while (now - start < 4) {
      now = getTimeStamp();
    }

    const result = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(result).toStrictEqual({ messageId: expect.any(Number) });
    // test for delay
  });
});

//= ====================================================================================================

//= ========================================= TEST FOR MESSAGE SENDLATER DM V1 =============================

describe('test for /message/sendlaterdm/v1', () => {
  let user1, user2, dm1;
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
    const createDm = request(
      'POST',
      SERVER_URL + '/dm/create/v2',
      {
        headers: {
          token: user1.token
        },
        json: {
          uIds: [user1.authUserId]
        }
      }
    );
    dm1 = JSON.parse(createDm.getBody() as string).dmId;
  });

  test('when dmId is invalid', () => {
    const res = request(
      'POST',
      SERVER_URL + '/message/sendlaterdm/v1',
      {
        headers: {
          token: user1.token
        },
        json: {
          dmId: -999,
          message: 'Hello',
          timeSent: getTimeStamp()
        }
      }
    );

    expect(res.statusCode).toBe(INPUT_ERROR);
  });

  test('when message is empty', () => {
    const res = request(
      'POST',
      SERVER_URL + '/message/sendlaterdm/v1',
      {
        headers: {
          token: user1.token
        },
        json: {
          dmId: dm1,
          message: '',
          timeSent: getTimeStamp()
        }
      }
    );
    expect(res.statusCode).toBe(INPUT_ERROR);
  });

  test('when message great than 10000', () => {
    const res = request(
      'POST',
      SERVER_URL + '/message/sendlaterdm/v1',
      {
        headers: {
          token: user1.token
        },
        json: {
          dmId: dm1,
          message: 'A'.repeat(1001),
          timeSent: getTimeStamp()
        }
      }
    );
    expect(res.statusCode).toBe(INPUT_ERROR);
  });

  test('when token is invalid', () => {
    const res = request(
      'POST',
      SERVER_URL + '/message/sendlaterdm/v1',
      {
        headers: {
          token: '-9999'
        },
        json: {
          dmId: dm1,
          message: 'Hello',
          timeSent: getTimeStamp()
        }
      }
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('when user is not in channel', () => {
    const res = request(
      'POST',
      SERVER_URL + '/message/sendlaterdm/v1',
      {
        headers: {
          token: user2
        },
        json: {
          dmId: dm1,
          message: 'Hello',
          timeSent: getTimeStamp()
        }
      }
    );
    expect(res.statusCode).toBe(403);
  });

  test('time sent is in past', () => {
    const res = request(
      'POST',
      SERVER_URL + '/message/sendlaterdm/v1',
      {
        headers: {
          token: user1.token
        },
        json: {
          dmId: dm1,
          message: 'Hello',
          timeSent: getTimeStamp() - 3
        }
      }
    );
    expect(res.statusCode).toBe(400);
  });

  test('test for successful/message/sendlaterdm/v1', () => {
    const res = request(
      'POST',
      SERVER_URL + '/message/sendlaterdm/v1',
      {
        headers: {
          token: user1.token
        },
        json: {
          dmId: dm1,
          message: 'Hello',
          timeSent: getTimeStamp() + 2
        }
      }

    );
    const result = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(result).toStrictEqual({ messageId: expect.any(Number) });

    // test for delay
    const start = getTimeStamp();
    let now = start;
    while (now - start < 4) {
      now = getTimeStamp();
    }
  });
});

//= ====================================================================================================

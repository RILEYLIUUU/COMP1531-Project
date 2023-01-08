import request from 'sync-request';
import config from './config.json';

const port = config.port;
const url = config.url;
const SERVER_URL = `${url}:${port}`;
const getTimeStamp = () => Math.floor(Date.now() / 1000);

//= =========================================TEST FOR STAND UP START =================================

describe('test for standup/start/v1', () => {
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
      SERVER_URL + '/standup/start/v1',
      {
        headers: {
          token: user1
        },

        json: {
          channelId: -999,
          length: 5
        }
      }
    );
    expect(res.statusCode).toBe(400);
  });

  test('when token is invalid', () => {
    const res = request(
      'POST',
      SERVER_URL + '/standup/start/v1',
      {
        headers: {
          token: '-999'
        },
        json: {
          token: '-99999999',
          channelId: channel1,
          length: 5
        }
      }
    );
    expect(res.statusCode).toBe(403);
  });

  test('when user is not in channel', () => {
    const res = request(
      'POST',
      SERVER_URL + '/standup/start/v1',
      {
        headers: {
          token: user2
        },
        json: {
          channelId: channel1,
          length: 5
        }
      }
    );
    expect(res.statusCode).toBe(403);
  });

  test('length is a negative number ', () => {
    const res = request(
      'POST',
      SERVER_URL + '/standup/start/v1',
      {
        headers: {
          token: user1
        },
        json: {
          channelId: channel1,
          length: -5
        }
      }
    );
    expect(res.statusCode).toBe(400);
  });

  test('an active standup is currently running in the channel', () => {
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

    request(
      'POST',
      SERVER_URL + '/standup/start/v1',
      {
        headers: {
          token: user1
        },
        json: {
          channelId: channel1,
          length: 5
        }
      }
    );

    const res = request(
      'POST',
      SERVER_URL + '/standup/start/v1',
      {
        headers: {
          token: user2
        },
        json: {
          channelId: channel1,
          length: 5
        }
      }
    );
    expect(res.statusCode).toBe(400);
  });

  test('sucessful case ', () => {
    // let user 2 join to channel2
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

    // start STAND UP PERIOD for 5 minus
    request(
      'POST',
      SERVER_URL + '/standup/start/v1',
      {
        headers: {
          token: user1
        },
        json: {
          channelId: channel1,
          length: 5
        }
      }
    );

    // During standup period , send message to standup mesaage list
    request(
      'POST',
      SERVER_URL + '/standup/send/v1',
      {
        headers: {
          token: user1
        },
        json: {
          channelId: channel1,
          message: 'Hello Guys'
        }
      }
    );

    request(
      'POST',
      SERVER_URL + '/standup/send/v1',
      {
        headers: {
          token: user2
        },
        json: {
          channelId: channel1,
          message: 'How are you'
        }
      }
    );

    const start = getTimeStamp();
    let now = start;
    while (now - start < 10) {
      now = getTimeStamp();
    }

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
        expect.objectContaining({ message: expect.any(String) })
      ])
    );

    // use While loop to let server sleep around 10s
  });
});

//= ====================================================================================================

//= =======================================TEST FOR STAND UP ACTIVE V1===============================

describe('test for /standup/active/v1', () => {
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
      'GET',
      SERVER_URL + '/standup/active/v1',
      {
        headers: {
          token: user1
        },

        qs: {
          channelId: -999,
        }
      }
    );
    expect(res.statusCode).toBe(400);
  });

  test('when user is not in channel', () => {
    const res = request(
      'GET',
      SERVER_URL + '/standup/active/v1',
      {
        headers: {
          token: user2
        },
        qs: {
          channelId: channel1,
        }
      }
    );
    expect(res.statusCode).toBe(403);
  });

  test('when token is invalid', () => {
    const res = request(
      'GET',
      SERVER_URL + '/standup/active/v1',
      {
        headers: {
          token: '-999'
        },
        qs: {
          token: '-99999999',
          channelId: channel1,
        }
      }
    );
    expect(res.statusCode).toBe(403);
  });

  test('sucessful', () => {
    // CASE:
    // START STAND UP PERIOD
    request(
      'POST',
      SERVER_URL + '/standup/start/v1',
      {
        headers: {
          token: user1
        },
        json: {
          channelId: channel1,
          length: 5
        }
      }
    );

    // STAND UP SENT
    const status = request(
      'GET',
      SERVER_URL + '/standup/active/v1',
      {
        headers: {
          token: user1
        },
        qs: {
          channelId: channel1,
        }
      }
    );
    const checkSatus = JSON.parse(status.getBody() as string);
    expect(checkSatus).toStrictEqual({
      isActive: true,
      timeFinish: expect.any(Number)
    }
    );
    // use While loop to let server sleep around 10s
    const start = getTimeStamp();
    let now = start;
    while (now - start < 10) {
      now = getTimeStamp();
    }
  });
});

//= ====================================================================================================

//= ======================================= TEST FOR STAND UP SEND V1===============================

describe('test for /standup/send/v1', () => {
  let user1, user2, channel1, channel2;

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

    const createChannel2 = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user2
        },
        json: {
          name: 'Channel2',
          isPublic: true
        }
      }
    );
    channel2 = JSON.parse(createChannel2.getBody() as string).channelId;
  });

  test('when channelId is not valid', () => {
    const res = request(
      'POST',
      SERVER_URL + '/standup/send/v1',
      {
        headers: {
          token: user1
        },

        json: {
          channelId: -999,
          message: 'Hello world',
        }
      }
    );
    expect(res.statusCode).toBe(400);
  });

  test('when message less than 1', () => {
    const res = request(
      'POST',
      SERVER_URL + '/standup/send/v1',
      {
        headers: {
          token: user1
        },
        json: {
          channelId: channel1,
          message: '',
        }
      }
    );
    expect(res.statusCode).toBe(400);
  });

  test('when message great than 1000', () => {
    const res = request(
      'POST',
      SERVER_URL + '/standup/send/v1',
      {
        headers: {
          token: user1
        },
        json: {
          channelId: channel1,
          message: 'A'.repeat(1001),
        }
      }
    );
    expect(res.statusCode).toBe(400);
  });

  test('when token is invalid', () => {
    const res = request(
      'POST',
      SERVER_URL + '/standup/send/v1',
      {
        headers: {
          token: '-999'
        },
        json: {
          token: '-99999999',
          channelId: channel1,
          message: 'Hello',
        }
      }
    );
    expect(res.statusCode).toBe(403);
  });

  test('when user is not in channel', () => {
    const res = request(
      'POST',
      SERVER_URL + '/standup/send/v1',
      {
        headers: {
          token: user2
        },
        json: {
          channelId: channel1,
          message: 'Hello',
        }
      }
    );
    expect(res.statusCode).toBe(403);
  });

  test('an active standup is not currently running in the channel  ', () => {
    request(
      'POST',
      SERVER_URL + '/standup/start/v1',
      {
        headers: {
          token: user2
        },
        json: {
          channelId: channel2,
          length: 5
        }
      }
    );
    const res = request(
      'POST',
      SERVER_URL + '/standup/send/v1',
      {
        headers: {
          token: user1
        },
        json: {
          channelId: channel1,
          message: 'Hello',
        }
      }
    );
    expect(res.statusCode).toBe(400);
  });

  test('sucessful case ', () => {
    // let user 2 join to channel2
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

    // start STAND UP PERIOD for 5 minus
    request(
      'POST',
      SERVER_URL + '/standup/start/v1',
      {
        headers: {
          token: user1
        },
        json: {
          channelId: channel1,
          length: 5
        }
      }
    );

    // During standup period , send message to standup mesaage list
    request(
      'POST',
      SERVER_URL + '/standup/send/v1',
      {
        headers: {
          token: user1
        },
        json: {
          channelId: channel1,
          message: 'Hello Guys'
        }
      }
    );

    request(
      'POST',
      SERVER_URL + '/standup/send/v1',
      {
        headers: {
          token: user2
        },
        json: {
          channelId: channel1,
          message: 'How are you'
        }
      }
    );

    const start = getTimeStamp();
    let now = start;
    while (now - start < 10) {
      now = getTimeStamp();
    }

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

    // use While loop to let server sleep around 10s

    const checkMessage = JSON.parse(message.getBody() as string);
    expect(checkMessage.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: expect.any(String) })
      ])
    );
  });
});

//= ====================================================================================================

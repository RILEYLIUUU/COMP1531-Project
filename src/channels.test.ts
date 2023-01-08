import request from 'sync-request';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

// Test for channelsListV1

// Provides an array of all channels
// (and their associated details)
// that the authorised user is part of.

describe('test for /channels/list/v3 ', () => {
  let userId1, channelId1;

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
          email: 'haydensmith@gmail.com',
          password: 'password',
          nameFirst: 'Hayden',
          nameLast: 'Smith'
        }
      }
    );
    userId1 = JSON.parse(createUser.getBody() as string);

    const createChannel = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: userId1.token,
        },
        json: {
          name: 'My Channel',
          isPublic: true
        }
      }
    );
    channelId1 = JSON.parse(createChannel.getBody() as string).channelId;
  });

  test('Test for token is not valid', () => {
    const res = request(
      'GET',
      SERVER_URL + '/channels/list/v3',
      {
        headers: {
          token: '-938838383837373',
        },
        qs: {
        }
      }
    );
    expect(res.statusCode).toBe(403);
  });

  test('Test for sucessful channels/list/v3 functions', () => {
    const details = request(
      'GET',
      SERVER_URL + '/channels/list/v3',
      {
        headers: {
          token: userId1.token,
        },
        qs: {
        }
      }
    );

    const detailResult = JSON.parse(details.getBody() as string);
    const expectedAllMembers = [
      {
        channels: [
          {
            channelId: channelId1,
            name: 'My Channel',
          },
        ]
      }
    ];
    const expectedAllMembersSet = new Set(expectedAllMembers);
    const resultAllMemberSet = new Set([detailResult]);
    expect(resultAllMemberSet).toStrictEqual(expectedAllMembersSet);
  });
});

// Test for channelsListAllV1

// Provides an array of all channels,
// including private channels (and their associated details)

describe('test for /channels/listall/v3 ', () => {
  let userId1, userId2, channelId1, channelId2;

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
          email: 'haydensmith@gmail.com',
          password: 'password',
          nameFirst: 'Hayden',
          nameLast: 'Smith'
        }
      }
    );
    userId1 = JSON.parse(createUser.getBody() as string);

    const createUser2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'rileyliu@gmail.com',
          password: '1233444',
          nameFirst: 'Riley',
          nameLast: 'Liu'
        }
      }
    );
    userId2 = JSON.parse(createUser2.getBody() as string);

    const createChannel = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: userId1.token,
        },
        json: {
          name: 'My Channel',
          isPublic: true
        }
      }
    );
    channelId1 = JSON.parse(createChannel.getBody() as string).channelId;

    const createChannel2 = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: userId2.token,
        },
        json: {
          name: 'Our Channel',
          isPublic: false
        }
      }
    );
    channelId2 = JSON.parse(createChannel2.getBody() as string).channelId;
  });

  test('Test for token is not valid', () => {
    const res = request(
      'GET',
      SERVER_URL + '/channels/list/v3',
      {
        headers: {
          token: '-938838383737'
        },
        qs: {
        }
      }
    );
    expect(res.statusCode).toBe(403);
  });

  test('Test for sucessful channels/listall/v3 functions', () => {
    const details = request(
      'GET',
      SERVER_URL + '/channels/listall/v3',
      {
        headers: {
          token: userId1.token,
        },
        qs: {
        }
      }
    );

    const detailResult = JSON.parse(details.getBody() as string);
    const expectedAllMembers = [
      {
        channels: [
          {
            channelId: channelId1,
            name: 'My Channel',
          },
          {
            channelId: channelId2,
            name: 'Our Channel',

          },
        ]
      }
    ];
    const expectedAllMembersSet = new Set(expectedAllMembers);
    const resultAllMemberSet = new Set([detailResult]);
    expect(resultAllMemberSet).toStrictEqual(expectedAllMembersSet);
  });
});

describe('channels/create/v3 tests', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/clear/v1',
      { qs: {} }
    );
  });
  test('Successful return types', () => {
    const user1Input = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'jake@gmail.com',
          password: '123abcsddf',
          nameFirst: 'Jake',
          nameLast: 'Renzella',
        }
      }
    );
    const user1 = JSON.parse(user1Input.getBody() as string);
    const res = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user1.token,
        },
        json: {
          name: 'Channel 1',
          isPublic: true,
        }
      }
    );
    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual({ channelId: expect.any(Number) });
  });
  describe('Error test cases', () => {
    test('name length is less than one character', () => {
      const user1Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'jake@gmail.com',
            password: '123abcsddf',
            nameFirst: 'Jake',
            nameLast: 'Renzella',
          }
        }
      );
      const user1 = JSON.parse(user1Input.getBody() as string);
      const res = request(
        'POST',
        SERVER_URL + '/channels/create/v3',
        {
          headers: {
            token: user1.token,
          },
          json: {
            name: '',
            isPublic: true,
          }
        }
      );
      expect(res.statusCode).toBe(400);
    });
    test('name length is greater than 20 characters', () => {
      const user1Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'jake@gmail.com',
            password: '123abcsddf',
            nameFirst: 'Jake',
            nameLast: 'Renzella',
          }
        }
      );
      const user1 = JSON.parse(user1Input.getBody() as string);
      const res = request(
        'POST',
        SERVER_URL + '/channels/create/v3',
        {
          headers: {
            token: user1.token,
          },
          json: {
            name: 'channelnamegreaterthan20characters',
            isPublic: true,
          }
        }
      );
      expect(res.statusCode).toBe(400);
    });

    test('Invalid token', () => {
      const user1Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'jake@gmail.com',
            password: '123abcsddf',
            nameFirst: 'Jake',
            nameLast: 'Renzella',
          }
        }
      );
      const user1 = JSON.parse(user1Input.getBody() as string);
      request(
        'POST',
        SERVER_URL + '/auth/logout/v2',
        {
          headers: {
            token: user1.token,
          },
          json: {
          }
        }
      );
      const res = request(
        'POST',
        SERVER_URL + '/channels/create/v3',
        {
          headers: {
            token: '-20122',
          },
          json: {
            name: 'Channel 1',
            isPublic: true,
          }
        }
      );
      expect(res.statusCode).toEqual(expect.any(Number));
    });
  });
});

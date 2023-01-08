import request from 'sync-request';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
import { hash, tokenHasher } from './auth';
beforeEach(() => {
  request(
    'DELETE',
    SERVER_URL + '/clear/v1',
    { qs: {} }
  );
});

describe('dm/create/v2 tests', () => {
  test('Successful return type', () => {
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
    const user2Input = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'tim@gmail.com',
          password: '123adfdfbcsddf',
          nameFirst: 'Tim',
          nameLast: 'Liu',
        }
      }
    );
    const user2 = JSON.parse(user2Input.getBody() as string);
    const user3Input = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'eric@gmail.com',
          password: '123adffgdfdvdbcsddf',
          nameFirst: 'Eric',
          nameLast: 'Lam',
        }
      }
    );
    const user3 = JSON.parse(user3Input.getBody() as string);
    const res = request(
      'POST',
      SERVER_URL + '/dm/create/v2',
      {
        headers: {
          token: user1.token,
        },
        json: {
          uIds: [user2.authUserId, user3.authUserId],
        }
      }
    );
    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual({ dmId: expect.any(Number) });
  });
  describe('Error Test cases', () => {
    test('test for when any uId does not refer to a valid user', () => {
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
      const user2Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'tim@gmail.com',
            password: '123adfdfbcsddf',
            nameFirst: 'Tim',
            nameLast: 'Liu',
          }
        }
      );
      const user2 = JSON.parse(user2Input.getBody() as string);
      const user3Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'eric@gmail.com',
            password: '123adffgdfdvdbcsddf',
            nameFirst: 'Eric',
            nameLast: 'Lam',
          }
        }
      );
      const user3 = JSON.parse(user3Input.getBody() as string);
      const res = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user1.token,
          },
          json: {
            uIds: [user2.authUserId, user3.authUserId, 34],
          }
        }
      );
      expect(res.statusCode).toEqual(400);
    });
    test('testing for when there are duplicate uIds', () => {
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
      const user2Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'tim@gmail.com',
            password: '123adfdfbcsddf',
            nameFirst: 'Tim',
            nameLast: 'Liu',
          }
        }
      );
      const user2 = JSON.parse(user2Input.getBody() as string);
      const user3Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'eric@gmail.com',
            password: '123adffgdfdvdbcsddf',
            nameFirst: 'Eric',
            nameLast: 'Lam',
          }
        }
      );
      const user3 = JSON.parse(user3Input.getBody() as string);
      const res = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user1.token,
          },
          json: {
            uIds: [user2.authUserId, user2.authUserId, user3.authUserId],
          }
        }
      );
      expect(res.statusCode).toEqual(400);
    });
  });

  test('testing for when token is invalid', () => {
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
    const user2Input = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'tim@gmail.com',
          password: '123adfdfbcsddf',
          nameFirst: 'Tim',
          nameLast: 'Liu',
        }
      }
    );
    const user2 = JSON.parse(user2Input.getBody() as string);
    const user3Input = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'eric@gmail.com',
          password: '123adffgdfdvdbcsddf',
          nameFirst: 'Eric',
          nameLast: 'Lam',
        }
      }
    );
    const user3 = JSON.parse(user3Input.getBody() as string);
    const logout = request(
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
    JSON.parse(logout.getBody() as string);
    const res = request(
      'POST',
      SERVER_URL + '/dm/create/v2',
      {
        headers: {
          token: user1.token,
        },
        json: {
          uIds: [user2.authUserId, user3.authUserId],
        }
      }
    );
    expect(res.statusCode).toEqual(403);
  });
});

describe('dm/list/v2 tests', () => {
  test('Successful return type', () => {
    const user1Input = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'van@gmail.com',
          password: '123abcsddf',
          nameFirst: 'Van',
          nameLast: 'Nathaniel',
        }
      }
    );
    const user1 = JSON.parse(user1Input.getBody() as string);
    const user2Input = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'nate@gmail.com',
          password: '123adfdfbcsddf',
          nameFirst: 'Nathan',
          nameLast: 'Lee',
        }
      }
    );
    const user2 = JSON.parse(user2Input.getBody() as string);
    const user3Input = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'greg@gmail.com',
          password: '123adffgdfdvdbcsddf',
          nameFirst: 'Greg',
          nameLast: 'Langfield',
        }
      }
    );
    const user3 = JSON.parse(user3Input.getBody() as string);
    const dm1Input = request(
      'POST',
      SERVER_URL + '/dm/create/v2',
      {
        headers: {
          token: user1.token
        },
        json: {
          uIds: [user2.authUserId, user3.authUserId],
        }
      }
    );
    const dm1 = JSON.parse(dm1Input.getBody() as string);
    const dm2Input = request(
      'POST',
      SERVER_URL + '/dm/create/v2',
      {
        headers: {
          token: user1.token
        },
        json: {
          uIds: [user2.authUserId],
        }
      }
    );
    const dm2 = JSON.parse(dm2Input.getBody() as string);
    const res = request(
      'GET',
      SERVER_URL + '/dm/list/v2',
      {
        headers: {
          token: user1.token
        },
        qs: {
        }
      }
    );
    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual({
      dms: [
        {
          name: 'greglangfield, nathanlee, vannathaniel',
          dmId: dm1.dmId,
        },
        {
          name: 'nathanlee, vannathaniel',
          dmId: dm2.dmId,
        }
      ]
    });
  });

  test('Invalid token case', () => {
    const user1Input = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'van@gmail.com',
          password: '123abcsddf',
          nameFirst: 'Van',
          nameLast: 'Nathaniel',
        }
      }
    );
    const user1 = JSON.parse(user1Input.getBody() as string);
    const user2Input = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'nate@gmail.com',
          password: '123adfdfbcsddf',
          nameFirst: 'Nathan',
          nameLast: 'Lee',
        }
      }
    );
    const user2 = JSON.parse(user2Input.getBody() as string);
    const user3Input = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'greg@gmail.com',
          password: '123adffgdfdvdbcsddf',
          nameFirst: 'Greg',
          nameLast: 'Langfield',
        }
      }
    );
    const user3 = JSON.parse(user3Input.getBody() as string);
    const dm1Input = request(
      'POST',
      SERVER_URL + '/dm/create/v2',
      {
        headers: {
          token: user1.token
        },
        json: {
          uIds: [user2.authUserId, user3.authUserId],
        }
      }
    );
    JSON.parse(dm1Input.getBody() as string);
    const dm2Input = request(
      'POST',
      SERVER_URL + '/dm/create/v2',
      {
        headers: {
          token: user1.token
        },
        json: {
          uIds: [user2.authUserId],
        }
      }
    );
    JSON.parse(dm2Input.getBody() as string);
    const logout = request(
      'POST',
      SERVER_URL + '/auth/logout/v2',
      {
        headers: {
          token: user1.token
        },
        json: {
        }
      }
    );
    JSON.parse(logout.getBody() as string);
    const res = request(
      'GET',
      SERVER_URL + '/dm/list/v2',
      {
        headers: {
          token: user1.token
        },
        qs: {
        }
      }
    );
    expect(res.statusCode).toEqual(403);
  });
});

describe('dm/remove/v2 tests', () => {
  test('successful return type', () => {
    const user1Input = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'van@gmail.com',
          password: '123abcsddf',
          nameFirst: 'Van',
          nameLast: 'Nathaniel',
        }
      }
    );
    const user1 = JSON.parse(user1Input.getBody() as string);
    const user2Input = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'nate@gmail.com',
          password: '123adfdfbcsddf',
          nameFirst: 'Nathan',
          nameLast: 'Lee',
        }
      }
    );
    const user2 = JSON.parse(user2Input.getBody() as string);
    const user3Input = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'greg@gmail.com',
          password: '123adffgdfdvdbcsddf',
          nameFirst: 'Greg',
          nameLast: 'Langfield',
        }
      }
    );
    const user3 = JSON.parse(user3Input.getBody() as string);
    const dmInput = request(
      'POST',
      SERVER_URL + '/dm/create/v2',
      {
        headers: {
          token: user1.token,
        },
        json: {
          uIds: [user2.authUserId, user3.authUserId],
        }
      }
    );
    const dm = JSON.parse(dmInput.getBody() as string);
    const res = request(
      'DELETE',
      SERVER_URL + '/dm/remove/v2',
      {
        headers: {
          token: user1.token,
        },
        qs: {
          dmId: dm.dmId,
        }
      }
    );
    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual({});
  });
  describe('Error test cases', () => {
    test(' for when invalid dmId is inputted', () => {
      const user1Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'van@gmail.com',
            password: '123abcsddf',
            nameFirst: 'Van',
            nameLast: 'Nathaniel',
          }
        }
      );
      const user1 = JSON.parse(user1Input.getBody() as string);
      const user2Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'nate@gmail.com',
            password: '123adfdfbcsddf',
            nameFirst: 'Nathan',
            nameLast: 'Lee',
          }
        }
      );
      const user2 = JSON.parse(user2Input.getBody() as string);
      const user3Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'greg@gmail.com',
            password: '123adffgdfdvdbcsddf',
            nameFirst: 'Greg',
            nameLast: 'Langfield',
          }
        }
      );
      const user3 = JSON.parse(user3Input.getBody() as string);
      const dmInput = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user1.token,
          },
          json: {
            uIds: [user2.authUserId, user3.authUserId],
          }
        }
      );
      JSON.parse(dmInput.getBody() as string);
      const res = request(
        'DELETE',
        SERVER_URL + '/dm/remove/v2',
        {
          headers: {
            token: user1.token,
          },
          qs: {
            dmId: 25,
          }
        }
      );
      expect(res.statusCode).toEqual(400);
    });
    test('for when dmId is valid but the authorised user is not the original DM creator', () => {
      const user1Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'van@gmail.com',
            password: '123abcsddf',
            nameFirst: 'Van',
            nameLast: 'Nathaniel',
          }
        }
      );
      const user1 = JSON.parse(user1Input.getBody() as string);
      const user2Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'nate@gmail.com',
            password: '123adfdfbcsddf',
            nameFirst: 'Nathan',
            nameLast: 'Lee',
          }
        }
      );
      const user2 = JSON.parse(user2Input.getBody() as string);
      const user3Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'greg@gmail.com',
            password: '123adffgdfdvdbcsddf',
            nameFirst: 'Greg',
            nameLast: 'Langfield',
          }
        }
      );
      const user3 = JSON.parse(user3Input.getBody() as string);
      const dmInput = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user1.token,
          },
          json: {
            uIds: [user2.authUserId, user3.authUserId],
          }
        }
      );
      const dm = JSON.parse(dmInput.getBody() as string);
      const res = request(
        'DELETE',
        SERVER_URL + '/dm/remove/v2',
        {
          headers: {
            token: user2.token,
          },
          qs: {
            dmId: dm.dmId,
          }
        }
      );
      expect(res.statusCode).toEqual(403);
    });
    test('DmId is valid and the authorised user is no longer in the dm', () => {
      const user1Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'van@gmail.com',
            password: '123abcsddf',
            nameFirst: 'Van',
            nameLast: 'Nathaniel',
          }
        }
      );
      const user1 = JSON.parse(user1Input.getBody() as string);
      const user2Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'nate@gmail.com',
            password: '123adfdfbcsddf',
            nameFirst: 'Nathan',
            nameLast: 'Lee',
          }
        }
      );
      const user2 = JSON.parse(user2Input.getBody() as string);
      const user3Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'greg@gmail.com',
            password: '123adffgdfdvdbcsddf',
            nameFirst: 'Greg',
            nameLast: 'Langfield',
          }
        }
      );
      const user3 = JSON.parse(user3Input.getBody() as string);
      const dmInput = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user1.token,
          },
          json: {
            uIds: [user2.authUserId, user3.authUserId],
          }
        }
      );
      const dm = JSON.parse(dmInput.getBody() as string);
      const dmLeaveInput = request(
        'POST',
        SERVER_URL + '/dm/leave/v2',
        {
          headers: {
            token: user1.token,
          },
          json: {
            dmId: dm.dmId,
          }
        }
      );
      JSON.parse(dmLeaveInput.getBody() as string);
      const res = request(
        'DELETE',
        SERVER_URL + '/dm/remove/v2',
        {
          headers: {
            token: user1.token,
          },
          qs: {
            dmId: dm.dmId,
          }
        }
      );
      expect(res.statusCode).toEqual(403);
    });
    test('Invalid token', () => {
      const user1Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'van@gmail.com',
            password: '123abcsddf',
            nameFirst: 'Van',
            nameLast: 'Nathaniel',
          }
        }
      );
      const user1 = JSON.parse(user1Input.getBody() as string);
      const user2Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'nate@gmail.com',
            password: '123adfdfbcsddf',
            nameFirst: 'Nathan',
            nameLast: 'Lee',
          }
        }
      );
      const user2 = JSON.parse(user2Input.getBody() as string);
      const user3Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'greg@gmail.com',
            password: '123adffgdfdvdbcsddf',
            nameFirst: 'Greg',
            nameLast: 'Langfield',
          }
        }
      );
      const user3 = JSON.parse(user3Input.getBody() as string);
      const dmInput = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user1.token,
          },
          json: {
            uIds: [user2.authUserId, user3.authUserId],
          }
        }
      );
      const dm = JSON.parse(dmInput.getBody() as string);
      const logout = request(
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
      JSON.parse(logout.getBody() as string);
      const res = request(
        'DELETE',
        SERVER_URL + '/dm/remove/v2',
        {
          headers: {
            token: user1.token,
          },
          qs: {
            dmId: dm.dmId,
          }
        }
      );
      expect(res.statusCode).toEqual(403);
    });
  });
});

describe('dm/details/v2 tests', () => {
  test('Successful return type', () => {
    const user1Input = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'jeff@gmail.com',
          password: '122342342',
          nameFirst: 'Jeff',
          nameLast: 'Alexander',
        }
      }
    );
    const user1 = JSON.parse(user1Input.getBody() as string);
    const user2Input = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'bob@gmail.com',
          password: '12232344242',
          nameFirst: 'Bob',
          nameLast: 'Ross',
        }
      }
    );
    const user2 = JSON.parse(user2Input.getBody() as string);
    const user3Input = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'yang@gmail.com',
          password: '1221321321',
          nameFirst: 'Yang',
          nameLast: 'Chew',
        }
      }
    );
    const user3 = JSON.parse(user3Input.getBody() as string);
    const dm1Input = request(
      'POST',
      SERVER_URL + '/dm/create/v2',
      {
        headers: {
          token: user1.token,
        },
        json: {
          uIds: [user2.authUserId, user3.authUserId],
        }
      }
    );
    const dm1 = JSON.parse(dm1Input.getBody() as string);
    const res = request(
      'GET',
      SERVER_URL + '/dm/details/v2',
      {
        headers: {
          token: user1.token,
        },
        qs: {
          dmId: dm1.dmId,
        }
      }
    );
    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual({
      name: 'bobross, jeffalexander, yangchew',
      members:
    [{
      uId: user1.authUserId,
      email: 'jeff@gmail.com',
      password: hash('122342342'),
      nameFirst: 'Jeff',
      nameLast: 'Alexander',
      handleStr: 'jeffalexander',
      permissionId: 1,
      sessions: [user1.token],
      hashSessions: [tokenHasher(user1.token)],
      profileImgUrl: SERVER_URL + 'src/imgurl/test.jpg',
      notifications: []
    },
    {
      uId: user2.authUserId,
      email: 'bob@gmail.com',
      password: hash('12232344242'),
      nameFirst: 'Bob',
      nameLast: 'Ross',
      handleStr: 'bobross',
      permissionId: 2,
      sessions: [user2.token],
      hashSessions: [tokenHasher(user2.token)],
      profileImgUrl: SERVER_URL + 'src/imgurl/test.jpg',
      notifications: [{
        channelId: -1,
        dmId: 1,
        notificationMessage: 'jeffalexander added you to bobross, jeffalexander, yangchew'
      }]
    },
    {
      uId: user3.authUserId,
      email: 'yang@gmail.com',
      password: hash('1221321321'),
      nameFirst: 'Yang',
      nameLast: 'Chew',
      handleStr: 'yangchew',
      permissionId: 2,
      sessions: [user3.token],
      hashSessions: [tokenHasher(user3.token)],
      profileImgUrl: SERVER_URL + 'src/imgurl/test.jpg',
      notifications: [{
        channelId: -1,
        dmId: 1,
        notificationMessage: 'jeffalexander added you to bobross, jeffalexander, yangchew'
      }]
    }]
    });
  });
  describe('Error test cases', () => {
    test('invalid dmId', () => {
      const user1Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'jeff@gmail.com',
            password: '122342342',
            nameFirst: 'Jeff',
            nameLast: 'Alexander',
          }
        }
      );
      const user1 = JSON.parse(user1Input.getBody() as string);
      const user2Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'bob@gmail.com',
            password: '12232344242',
            nameFirst: 'Bob',
            nameLast: 'Ross',
          }
        }
      );
      const user2 = JSON.parse(user2Input.getBody() as string);
      const user3Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'yang@gmail.com',
            password: '1221321321',
            nameFirst: 'Yang',
            nameLast: 'Chew',
          }
        }
      );
      const user3 = JSON.parse(user3Input.getBody() as string);
      const dm1Input = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user1.token,
          },
          json: {
            uIds: [user2.authUserId, user3.authUserId],
          }
        }
      );
      JSON.parse(dm1Input.getBody() as string);
      const res = request(
        'GET',
        SERVER_URL + '/dm/details/v2',
        {
          headers: {
            token: user1.token,
          },
          qs: {
            dmId: 24,
          }
        }
      );
      expect(res.statusCode).toEqual(400);
    });
    test('dmId is valid but authorised user is not a member of the DM', () => {
      const user1Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'jeff@gmail.com',
            password: '122342342',
            nameFirst: 'Jeff',
            nameLast: 'Alexander',
          }
        }
      );
      const user1 = JSON.parse(user1Input.getBody() as string);
      const user2Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'bob@gmail.com',
            password: '12232344242',
            nameFirst: 'Bob',
            nameLast: 'Ross',
          }
        }
      );
      const user2 = JSON.parse(user2Input.getBody() as string);
      const user3Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'yang@gmail.com',
            password: '1221321321',
            nameFirst: 'Yang',
            nameLast: 'Chew',
          }
        }
      );
      const user3 = JSON.parse(user3Input.getBody() as string);
      const dm1Input = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user1.token,
          },
          json: {
            uIds: [user2.authUserId],
          }
        }
      );
      const dm1 = JSON.parse(dm1Input.getBody() as string);
      const res = request(
        'GET',
        SERVER_URL + '/dm/details/v2',
        {
          headers: {
            token: user3.token,
          },
          qs: {
            dmId: dm1.dmId,
          }
        }
      );
      expect(res.statusCode).toEqual(403);
    });
    test('Invalid token', () => {
      const user1Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'jeff@gmail.com',
            password: '122342342',
            nameFirst: 'Jeff',
            nameLast: 'Alexander',
          }
        }
      );
      const user1 = JSON.parse(user1Input.getBody() as string);
      const user2Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'bob@gmail.com',
            password: '12232344242',
            nameFirst: 'Bob',
            nameLast: 'Ross',
          }
        }
      );
      const user2 = JSON.parse(user2Input.getBody() as string);
      const user3Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'yang@gmail.com',
            password: '1221321321',
            nameFirst: 'Yang',
            nameLast: 'Chew',
          }
        }
      );
      const user3 = JSON.parse(user3Input.getBody() as string);
      const dm1Input = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user1.token,
          },
          json: {
            uIds: [user2.authUserId, user3.authUserId],
          }
        }
      );
      const dm1 = JSON.parse(dm1Input.getBody() as string);
      const logout = request(
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
      JSON.parse(logout.getBody() as string);
      const res = request(
        'GET',
        SERVER_URL + '/dm/details/v2',
        {
          headers: {
            token: user1.token,
          },
          qs: {
            dmId: dm1.dmId,
          }
        }
      );
      expect(res.statusCode).toStrictEqual(403);
    });
  });
});

describe('dm/leave/v2 tests', () => {
  test('Successful return type', () => {
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
    const user2Input = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'tim@gmail.com',
          password: '123adfdfbcsddf',
          nameFirst: 'Tim',
          nameLast: 'Liu',
        }
      }
    );
    const user2 = JSON.parse(user2Input.getBody() as string);
    const user3Input = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'eric@gmail.com',
          password: '123adffgdfdvdbcsddf',
          nameFirst: 'Eric',
          nameLast: 'Lam',
        }
      }
    );
    const user3 = JSON.parse(user3Input.getBody() as string);
    const dm1Input = request(
      'POST',
      SERVER_URL + '/dm/create/v2',
      {
        headers: {
          token: user1.token,
        },
        json: {
          uIds: [user2.authUserId, user3.authUserId],
        }
      }
    );
    const dm1 = JSON.parse(dm1Input.getBody() as string);
    const res = request(
      'POST',
      SERVER_URL + '/dm/leave/v2',
      {
        headers: {
          token: user1.token,
        },
        json: {
          dmId: dm1.dmId,
        }
      }
    );
    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual({});
  });
  describe('Error test cases', () => {
    test('invalid dmId', () => {
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
      const user2Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'tim@gmail.com',
            password: '123adfdfbcsddf',
            nameFirst: 'Tim',
            nameLast: 'Liu',
          }
        }
      );
      const user2 = JSON.parse(user2Input.getBody() as string);
      const user3Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'eric@gmail.com',
            password: '123adffgdfdvdbcsddf',
            nameFirst: 'Eric',
            nameLast: 'Lam',
          }
        }
      );
      const user3 = JSON.parse(user3Input.getBody() as string);
      const dm1Input = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user1.token,
          },
          json: {
            uIds: [user2.authUserId, user3.authUserId],
          }
        }
      );
      JSON.parse(dm1Input.getBody() as string);
      const res = request(
        'POST',
        SERVER_URL + '/dm/leave/v2',
        {
          headers: {
            token: user1.token,
          },
          json:
          {
            dmId: 34,
          }
        }
      );
      expect(res.statusCode).toEqual(400);
    });

    test('dmId is valid but the authorised user is not a member of the dm', () => {
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
      const user2Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'tim@gmail.com',
            password: '123adfdfbcsddf',
            nameFirst: 'Tim',
            nameLast: 'Liu',
          }
        }
      );
      const user2 = JSON.parse(user2Input.getBody() as string);
      const user3Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'eric@gmail.com',
            password: '123adffgdfdvdbcsddf',
            nameFirst: 'Eric',
            nameLast: 'Lam',
          }
        }
      );
      const user3 = JSON.parse(user3Input.getBody() as string);
      const dm1Input = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user1.token,
          },
          json: {
            uIds: [user2.authUserId],
          }
        }
      );
      const dm1 = JSON.parse(dm1Input.getBody() as string);
      const res = request(
        'POST',
        SERVER_URL + '/dm/leave/v2',
        {
          headers: {
            token: user3.token,
          },
          json:
          {
            dmId: dm1.dmId,
          }
        }
      );
      expect(res.statusCode).toEqual(403);
    });
    test('invalid token', () => {
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
      const user2Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'tim@gmail.com',
            password: '123adfdfbcsddf',
            nameFirst: 'Tim',
            nameLast: 'Liu',
          }
        }
      );
      const user2 = JSON.parse(user2Input.getBody() as string);
      const user3Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'eric@gmail.com',
            password: '123adffgdfdvdbcsddf',
            nameFirst: 'Eric',
            nameLast: 'Lam',
          }
        }
      );
      const user3 = JSON.parse(user3Input.getBody() as string);
      const dm1Input = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user1.token,
          },
          json: {
            uIds: [user2.authUserId, user3.authUserId],
          }
        }
      );
      const dm1 = JSON.parse(dm1Input.getBody() as string);
      const logout = request(
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
      JSON.parse(logout.getBody() as string);
      const res = request(
        'POST',
        SERVER_URL + '/dm/leave/v2',
        {
          headers: {
            token: user1.token,
          },
          json:
          {
            dmId: dm1.dmId,
          }
        }
      );
      expect(res.statusCode).toEqual(403);
    });
  });
});

describe('dm/messages/v2 tests', () => {
  test('successful return type', () => {
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
    const user2Input = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'tim@gmail.com',
          password: '123adfdfbcsddf',
          nameFirst: 'Tim',
          nameLast: 'Liu',
        }
      }
    );
    const user2 = JSON.parse(user2Input.getBody() as string);
    const user3Input = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'eric@gmail.com',
          password: '123adffgdfdvdbcsddf',
          nameFirst: 'Eric',
          nameLast: 'Lam',
        }
      }
    );
    const user3 = JSON.parse(user3Input.getBody() as string);
    const dm1Input = request(
      'POST',
      SERVER_URL + '/dm/create/v2',
      {
        headers: {
          token: user1.token,
        },
        json: {
          uIds: [user2.authUserId, user3.authUserId],
        }
      }
    );
    const dm1 = JSON.parse(dm1Input.getBody() as string);
    const res = request(
      'GET',
      SERVER_URL + '/dm/messages/v2',
      {
        headers: {
          token: user1.token,
        },
        qs: {
          dmId: dm1.dmId,
          start: 0,
        }
      }
    );
    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });
  describe('Error cases', () => {
    test('dmId does not refer to valid DM', () => {
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
      const user2Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'tim@gmail.com',
            password: '123adfdfbcsddf',
            nameFirst: 'Tim',
            nameLast: 'Liu',
          }
        }
      );
      const user2 = JSON.parse(user2Input.getBody() as string);
      const user3Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'eric@gmail.com',
            password: '123adffgdfdvdbcsddf',
            nameFirst: 'Eric',
            nameLast: 'Lam',
          }
        }
      );
      const user3 = JSON.parse(user3Input.getBody() as string);
      const dm1Input = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user1.token,
          },
          json: {
            uIds: [user2.authUserId, user3.authUserId],
          }
        }
      );
      JSON.parse(dm1Input.getBody() as string);
      const res = request(
        'GET',
        SERVER_URL + '/dm/messages/v2',
        {
          headers: {
            token: user1.token,
          },
          qs: {
            dmId: 23,
            start: 0,
          }
        }
      );
      expect(res.statusCode).toEqual(400);
    });
    test('start is greater than total number of messages in channel', () => {
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
      const user2Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'tim@gmail.com',
            password: '123adfdfbcsddf',
            nameFirst: 'Tim',
            nameLast: 'Liu',
          }
        }
      );
      const user2 = JSON.parse(user2Input.getBody() as string);
      const user3Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'eric@gmail.com',
            password: '123adffgdfdvdbcsddf',
            nameFirst: 'Eric',
            nameLast: 'Lam',
          }
        }
      );
      const user3 = JSON.parse(user3Input.getBody() as string);
      const dm1Input = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user1.token,
          },
          json: {
            uIds: [user2.authUserId, user3.authUserId],
          }
        }
      );
      const dm1 = JSON.parse(dm1Input.getBody() as string);
      const res = request(
        'GET',
        SERVER_URL + '/dm/messages/v2',
        {
          headers: {
            token: user1.token,
          },
          qs: {
            dmId: dm1.dmId,
            start: 2323,
          }
        }
      );
      expect(res.statusCode).toEqual(400);
    });
    test('valid dmId but authorised user is not a member of the DM', () => {
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
      const user2Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'tim@gmail.com',
            password: '123adfdfbcsddf',
            nameFirst: 'Tim',
            nameLast: 'Liu',
          }
        }
      );
      const user2 = JSON.parse(user2Input.getBody() as string);
      const user3Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'eric@gmail.com',
            password: '123adffgdfdvdbcsddf',
            nameFirst: 'Eric',
            nameLast: 'Lam',
          }
        }
      );
      const user3 = JSON.parse(user3Input.getBody() as string);
      const dm1Input = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user1.token,
          },
          json: {
            uIds: [user2.authUserId],
          }
        }
      );
      const dm1 = JSON.parse(dm1Input.getBody() as string);
      const res = request(
        'GET',
        SERVER_URL + '/dm/messages/v2',
        {
          headers: {
            token: user3.token,
          },
          qs: {
            dmId: dm1.dmId,
            start: 0,
          }
        }
      );
      expect(res.statusCode).toEqual(403);
    });
    test('invalid token', () => {
      const user1Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'van@gmail.com',
            password: '123abcsddf',
            nameFirst: 'Van',
            nameLast: 'Nathaniel',
          }
        }
      );
      const user1 = JSON.parse(user1Input.getBody() as string);
      const user2Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'nate@gmail.com',
            password: '123adfdfbcsddf',
            nameFirst: 'Nathan',
            nameLast: 'Lee',
          }
        }
      );
      const user2 = JSON.parse(user2Input.getBody() as string);
      const user3Input = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'greg@gmail.com',
            password: '123adffgdfdvdbcsddf',
            nameFirst: 'Greg',
            nameLast: 'Langfield',
          }
        }
      );
      const user3 = JSON.parse(user3Input.getBody() as string);
      const dm1Input = request(
        'POST',
        SERVER_URL + '/dm/create/v2',
        {
          headers: {
            token: user1.token,
          },
          json: {
            uIds: [user2.authUserId, user3.authUserId],
          }
        }
      );
      const dm1 = JSON.parse(dm1Input.getBody() as string);
      const logout = request(
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
      JSON.parse(logout.getBody() as string);
      const res = request(
        'GET',
        SERVER_URL + '/dm/messages/v2',
        {
          headers: {
            token: user1.token,
          },
          qs: {
            dmId: dm1.dmId,
            start: 0,
          }
        }
      );
      expect(res.statusCode).toEqual(403);
    });
  });
});

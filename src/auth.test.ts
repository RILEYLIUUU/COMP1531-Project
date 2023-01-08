import request from 'sync-request';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
import { hash } from './auth';
import { tokenHasher } from './auth';
beforeEach(() => {
  request(
    'DELETE',
    SERVER_URL + '/clear/v1',
    { qs: {} }
  );
});

describe('auth/register/v3 tests', () => {
  test('Successful return types test', () => {
    const res = request(
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
    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual({ authUserId: expect.any(Number), token: expect.any(String) });
  });
  describe('Error test cases', () => {
    test('test for when the user enters an invalid email', () => {
      const res = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'invalidemailmial.com',
            password: '123abc!@#',
            nameFirst: 'Mike',
            nameLast: 'Kowalski',
          }
        }
      );
      expect(res.statusCode).toEqual(400);
    });

    test('test for when an email entered is already being used by another user', () => {
      request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'greg@gmail.com',
            password: '123aw3wewerfwfw#',
            nameFirst: 'Greg',
            nameLast: 'Swift',
          }
        }
      );
      const res = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'greg@gmail.com',
            password: '123abc!@#',
            nameFirst: 'Greg',
            nameLast: 'Harrelson',
          }
        }
      );
      expect(res.statusCode).toBe(400);
    });
    test('test for when the length of password entered is less than 6 characters', () => {
      const res = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'sam@gmail.com',
            password: '12345',
            nameFirst: 'Sam',
            nameLast: 'Harvey',
          }
        }
      );
      expect(res.statusCode).toBe(400);
    });
    test('for when nameFirst is less than 1 character long', () => {
      const res = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'kim@gmail.com',
            password: '12345666',
            nameFirst: '',
            nameLast: 'Lam',
          }
        }
      );
      expect(res.statusCode).toBe(400);
    });
    test('for when nameFirst is greater than 50 characters long', () => {
      const res = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'simeon@gmail.com',
            password: '23erwerfddefsf',
            nameFirst: 'T5lbQJyhuWQsxBM1CWFyKoOED23COMMfYX11h4mqoBxtaUOPyKU',
            nameLast: 'lastName',
          }
        }
      );
      expect(res.statusCode).toBe(400);
    });
    test('for when nameLast is less than 1 character long', () => {
      const res = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'sfd@gmail.com',
            password: 'sdfsffsffssfsd',
            nameFirst: 'firstname',
            nameLast: '',
          }
        }
      );
      expect(res.statusCode).toBe(400);
    });
    test('for when nameLast is greater than 50 characters long', () => {
      const res = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'sfd@gmail.com',
            password: 'sdfsffsffssfsd',
            nameFirst: 'firstname',
            nameLast: 'T5lbQJyhuWQsxBM1CWFyKoOED23COMMfYX11h4mqoBxtaUOPyKU',
          }
        }
      );
      expect(res.statusCode).toBe(400);
    });
    test('for when 2 users share the same name', () => {
      request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'samenamesamenamed@gmail.com',
            password: 'sdfsffsffssfsd',
            nameFirst: 'same',
            nameLast: 'name',
          }
        }
      );
      request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'samename3@gmail.com',
            password: '124434343443',
            nameFirst: 'same',
            nameLast: 'name',
          }
        }
      );
      const res = request(
        'POST',
        SERVER_URL + '/auth/register/v3',
        {
          json: {
            email: 'samenamed@gmail.com',
            password: 'sdfdgfdfgdfgfgdffssfsd',
            nameFirst: 'same',
            nameLast: 'name',
          }
        }
      );
      const data = JSON.parse(res.getBody() as string);
      expect(data).toStrictEqual({ authUserId: expect.any(Number), token: expect.any(String) });
    });
  });
});

describe('testing /auth/logout/v2', () => {
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
      'POST',
      SERVER_URL + '/auth/logout/v2',
      {
        headers: {
          token: '999'
        },
        qs: {

        }
      }
    );
    expect(res.statusCode).toBe(403);
  });

  test('test for log out the first user', () => {
    request(
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

    const details = request(
      'GET',
      SERVER_URL + '/users/all/v2',
      {
        headers: {
          token: user2.token
        },
        qs: {
          // token: user2.token,
        }
      }
    );

    const detailResult = JSON.parse(details.getBody() as string);
    const expectedAllUsersDetails =
        [{
          uId: user1.authUserId,
          email: 'valid1@gmail.com',
          password: hash('123abc!@#'),
          nameFirst: 'User',
          nameLast: 'One',
          handleStr: 'userone',
          permissionId: 1,
          sessions: [],
          hashSessions: [],
          profileImgUrl: SERVER_URL + 'src/imgurl/test.jpg',
          notifications: []
        },
        {
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
        },
        {
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
        },
        ];
    const expectedAllMembersSet = new Set(expectedAllUsersDetails);
    const resultAllMemberSet = new Set(detailResult.users);
    expect(resultAllMemberSet).toStrictEqual(expectedAllMembersSet);
  });

  test('Test log out the last user', () => {
    request(
      'POST',
      SERVER_URL + '/auth/logout/v2',
      {
        headers: {
          token: user3.token
        },
        json: {
        }
      }
    );

    const details = request(
      'GET',
      SERVER_URL + '/users/all/v2',
      {
        headers: {
          token: user1.token
        },
        qs: {
        }
      }
    );

    const detailResult = JSON.parse(details.getBody() as string);
    const expectedAllUsersDetails =
    [{
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
    },
    {
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
    },
    {
      uId: user3.authUserId,
      email: 'valid3@gmail.com',
      password: hash('789hij!@#'),
      nameFirst: 'User',
      nameLast: 'Three',
      handleStr: 'userthree',
      permissionId: 2,
      sessions: [],
      hashSessions: [],
      profileImgUrl: SERVER_URL + 'src/imgurl/test.jpg',
      notifications: []
    },
    ];
    const expectedAllMembersSet = new Set(expectedAllUsersDetails);
    const resultAllMemberSet = new Set(detailResult.users);
    expect(resultAllMemberSet).toStrictEqual(expectedAllMembersSet);
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

  test('test for invalid email', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/login/v3',
      {
        json: {
          email: 'invalidgmailcom',
          password: '123abc!@#'
        }
      });
    expect(res.statusCode).toBe(400);
  });

  test('test for invalid password', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/login/v3',
      {
        json: {
          email: 'valid@gmail.com',
          password: '00000000'
        }
      });
    expect(res.statusCode).toBe(400);
  });

  test('test for sucessful user login', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/login/v3',
      {
        json: {
          email: 'valid@gmail.com',
          password: '123abc!@#'
        }
      });
    const result = JSON.parse(res.getBody() as string);

    const expectedAllUsersDetails =
    [{ token: result.token, authUserId: user.authUserId }];
    const expectedAllMembersSet = new Set(expectedAllUsersDetails);
    const resultAllMemberSet = new Set([result]);
    expect(resultAllMemberSet).toStrictEqual(expectedAllMembersSet);
  });
});

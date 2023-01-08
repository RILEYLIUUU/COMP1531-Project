import request from 'sync-request';
import { port, url } from './config.json';
import { hash, tokenHasher } from './auth';
const SERVER_URL = `${url}:${port}`;
describe('admin/user/remove/v1', () => {
  let user1, user2, user3;
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/clear/v1',
      { qs: {} }
    );
    const user1Input = request(
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
    user1 = JSON.parse(user1Input.getBody() as string);
    const user2Input = request(
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
    user2 = JSON.parse(user2Input.getBody() as string);
    const user3Input = request(
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
    user3 = JSON.parse(user3Input.getBody() as string);
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
    const channelInput = request(
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
    JSON.parse(channelInput.getBody() as string);
  });
  test('Successful return type', () => {
    const res = request(
      'DELETE',
      SERVER_URL + '/admin/user/remove/v1',
      {
        headers: {
          token: user1.token,
        },
        qs: {
          uId: user2.authUserId,
        }
      }
    );
    expect(res.statusCode).toStrictEqual(200);
  });
  describe('Error test cases', () => {
    test('uId does not refer to a valid user', () => {
      const res = request(
        'DELETE',
        SERVER_URL + '/admin/user/remove/v1',
        {
          headers: {
            token: user2.token,
          },
          qs: {
            uId: -8999,
          }
        }
      );
      expect(res.statusCode).toStrictEqual(400);
    });
    test('uId refers to a user who is the only global owner', () => {
      const res = request(
        'DELETE',
        SERVER_URL + '/admin/user/remove/v1',
        {
          headers: {
            token: user1.token,
          },
          qs: {
            uId: user1.authUserId,
          }
        }
      );
      expect(res.statusCode).toStrictEqual(400);
    });
    test('the authorised user is not a global owner', () => {
      const res = request(
        'DELETE',
        SERVER_URL + '/admin/user/remove/v1',
        {
          headers: {
            token: user2.token,
          },
          qs: {
            uId: user3.authUserId,
          }
        }
      );
      expect(res.statusCode).toStrictEqual(403);
    });
    test('Invalid token', () => {
      const res = request(
        'DELETE',
        SERVER_URL + '/admin/user/remove/v1',
        {
          headers: {
            token: '-9999',
          },
          qs: {
            uId: user3.authUserId,
          }
        }
      );
      expect(res.statusCode).toStrictEqual(403);
    });
  });
});

describe('search/v1 test', () => {
  let user1, user2, user3;
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/clear/v1',
      { qs: {} }
    );
    const user1Input = request(
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
    user1 = JSON.parse(user1Input.getBody() as string);
    const user2Input = request(
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
    user2 = JSON.parse(user2Input.getBody() as string);
    const user3Input = request(
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
    user3 = JSON.parse(user3Input.getBody() as string);
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
    const channelInput = request(
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
    const channel = JSON.parse(channelInput.getBody() as string);
    const channelMessageInput = request(
      'POST',
      SERVER_URL + '/message/send/v2',
      {
        headers: {
          token: user1.token,
        },
        json: {
          channelId: channel.channelId,
          message: 'Test channel message substring'
        }
      }
    );
    JSON.parse(channelMessageInput.getBody() as string);
    const dmMessageInput = request(
      'POST',
      SERVER_URL + '/message/senddm/v2',
      {
        headers: {
          token: user1.token,
        },
        json: {
          dmId: dm.dmId,
          message: 'Test dm Message substring',
        }
      }
    );
    JSON.parse(dmMessageInput.getBody() as string);
    const channel1Input = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: {
          token: user2.token,
        },
        json: {
          name: 'notinchannel',
          isPublic: false,
        }
      }
    );
    const channel1 = JSON.parse(channel1Input.getBody() as string);
    const channel1MessageInput = request(
      'POST',
      SERVER_URL + '/message/send/v2',
      {
        headers: {
          token: user2.token,
        },
        json: {
          channelId: channel1.channelId,
          message: 'Test channel message substring where user is not a member of the channel'
        }
      }
    );
    JSON.parse(channel1MessageInput.getBody() as string);
  });
  test('Successful return type', () => {
    const res = request(
      'GET',
      SERVER_URL + '/search/v1',
      {
        headers: {
          token: user1.token,
        },
        qs: {
          queryStr: 'message'
        }
      }
    );
    const messages = JSON.parse(res.getBody() as string);
    expect(messages).toStrictEqual({
      messages: [
        {
          messageId: 100,
          uId: 0,
          channelId: 1,
          message: 'Test channel message substring',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
        {
          messageId: 200,
          uId: 0,
          dmId: 1,
          message: 'Test dm Message substring',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
        {
          channelId: 2,
          isPinned
        }
      ]
    });
  });
  describe('Error Cases', () => {
    test('querystr is less than one character', () => {
      const res = request(
        'GET',
        SERVER_URL + '/search/v1',
        {
          headers: {
            token: user1.token,
          },
          qs: {
            queryStr: ''
          }
        }
      );
      expect(res.statusCode).toStrictEqual(400);
    });
    test('querystr is more than 1000 characters', () => {
      const res = request(
        'GET',
        SERVER_URL + '/search/v1',
        {
          headers: {
            token: user1.token,
          },
          qs: {
            queryStr: 'a'.repeat(1001)
          }
        }
      );
      expect(res.statusCode).toStrictEqual(400);
    });
    test('Invalid token', () => {
      const res = request(
        'GET',
        SERVER_URL + '/search/v1',
        {
          headers: {
            token: '-999999',
          },
          qs: {
            queryStr: 'message'
          }
        }
      );
      expect(res.statusCode).toStrictEqual(403);
    });
  });
});

describe('notifications/get/v1 tests', () => {
  let user1, user2, user3, channelMessage, channel, dm;
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/clear/v1',
      { qs: {} }
    );
    const user1Input = request(
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
    user1 = JSON.parse(user1Input.getBody() as string);
    const user2Input = request(
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
    user2 = JSON.parse(user2Input.getBody() as string);
    const user3Input = request(
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
    user3 = JSON.parse(user3Input.getBody() as string);
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
    dm = JSON.parse(dmInput.getBody() as string);
    const channelInput = request(
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
    channel = JSON.parse(channelInput.getBody() as string);
    request(
      'POST',
      SERVER_URL + '/channel/invite/v3',
      {
        headers: {
          token: user1.token,
        },
        json: {
          channelId: channel.channelId,
          uId: user2.authUserId,
        }
      }
    );
    const channelMessageInput = request(
      'POST',
      SERVER_URL + '/message/send/v2',
      {
        headers: {
          token: user1.token,
        },
        json: {
          channelId: channel.channelId,
          message: 'Test channel message substring @usertwo'
        }
      }
    );
    channelMessage = JSON.parse(channelMessageInput.getBody() as string);
    const dmMessageInput = request(
      'POST',
      SERVER_URL + '/message/senddm/v2',
      {
        headers: {
          token: user1.token,
        },
        json: {
          dmId: dm.dmId,
          message: 'Test dm message substring @usertwo',
        }
      }
    );
    JSON.parse(dmMessageInput.getBody() as string);
    request(
      'POST',
      SERVER_URL + '/message/react/v1',
      {
        headers: {
          token: user1.token,
        },
        json: {
          messageId: channelMessage.messageId,
          reactId: 1,
        }
      }
    );
  });

  test('Successful return type', () => {
    const dmDetailsInput = request(
      'GET',
      SERVER_URL + '/dm/details/v2',
      {
        headers: {
          token: user1.token,
        },
        qs: {
          dmId: dm.dmId,
        }
      }
    );
    JSON.parse(dmDetailsInput.getBody() as string);
    const channelDetailsInput = request(
      'GET',
      SERVER_URL + '/channel/details/v3',
      {
        headers: {
          token: user1.token,
        },
        qs: {
          channelId: channel.channelId,
        }
      }
    );
    const tagSelf = request(
      'POST',
      SERVER_URL + '/message/senddm/v2',
      {
        headers: {
          token: user2.token,
        },
        json: {
          dmId: dm.dmId,
          message: 'Tagging myself @usertwo',
        }
      }
    );
    request(
      'PUT',
      SERVER_URL + '/message/edit/v2',
      {headers: {
        token: user1.token
      },
      json: {
        messageId: channelMessage.messageId,
        message: 'Edited message tag @usertwo',
      }
    }
    )
    JSON.parse(channelDetailsInput.getBody() as string);
    const notificationInput = request(
      'GET',
      SERVER_URL + '/notifications/get/v1',
      {
        headers: {
          token: user2.token,
        },
        qs: {
        }
      }
    );
    const notifications = JSON.parse(notificationInput.getBody() as string);
    const expectedNotifications = {
      notifications: [
        // {
        //   channelId: 1,
        //   dmId: -1,
        //   notificationMessage: 'userone reacted to your message in Channel1'
        // },
        {
          channelId: -1,
          dmId: 1,
          notificationMessage: 'usertwo tagged you in userone, userthree, usertwo: Tagging myself @user'
        },
        {
          channelId: -1,
          dmId: 1,
          notificationMessage: 'userone tagged you in userone, userthree, usertwo: Test dm message subs'
        },
        {
          channelId: 1,
          dmId: -1,
          notificationMessage: 'userone tagged you in Channel1: Test channel message'
        },
        {
          channelId: 1,
          dmId: -1,
          notificationMessage: 'userone added you to Channel1'
        },
        {
          channelId: -1,
          dmId: 1,
          notificationMessage: 'userone added you to userone, userthree, usertwo'
        }
      ]
    };
    expect(notifications).toStrictEqual(expectedNotifications);
  });
  test('Invalid token', () => {
    const notificationInput = request(
      'GET',
      SERVER_URL + '/notifications/get/v1',
      {
        headers: {
          token: '-99999',
        },
        qs: {

        }
      }
    );
    expect(notificationInput.statusCode).toStrictEqual(403);
  });
});

describe('/admin/userpermission/change/v1 Tests', () => {
  let user1, user2, user3;
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/clear/v1',
      { qs: {} }
    );
    const user1Input = request(
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
    user1 = JSON.parse(user1Input.getBody() as string);
    const user2Input = request(
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
    user2 = JSON.parse(user2Input.getBody() as string);
    const user3Input = request(
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
    user3 = JSON.parse(user3Input.getBody() as string);
  });
  test('Successful return type', () => {
    request(
      'POST',
      SERVER_URL + '/admin/userpermission/change/v1',
      {
        headers: {
          token: user1.token
        },
        json: {
          uId: user3.authUserId,
          permissionId: 1,
        }
      }
    );
    const userArrayInput = request(
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
    const userArray = JSON.parse(userArrayInput.getBody() as string);
    const expectedUserArray = {
      users: [{
        uId: user1.authUserId,
        email: 'valid1@gmail.com',
        password: hash('123abc!@#'),
        nameFirst: 'User',
        nameLast: 'One',
        handleStr: 'userone',
        permissionId: 1,
        sessions: [user1.token],
        hashSessions: [tokenHasher(user1.token)],
        notifications: [],
        profileImgUrl: 'http://127.0.0.1:1336src/imgurl/test.jpg',
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
        notifications: [],
        profileImgUrl: 'http://127.0.0.1:1336src/imgurl/test.jpg',
      },
      {
        uId: user3.authUserId,
        email: 'valid3@gmail.com',
        password: hash('789hij!@#'),
        nameFirst: 'User',
        nameLast: 'Three',
        handleStr: 'userthree',
        permissionId: 1,
        sessions: [user3.token],
        hashSessions: [tokenHasher(user3.token)],
        notifications: [],
        profileImgUrl: 'http://127.0.0.1:1336src/imgurl/test.jpg',
      }]
    };
    expect(userArray).toStrictEqual(expectedUserArray);
  });
  describe('Error Test Cases', () => {
    test('Invalid uId', () => {
      const res = request(
        'POST',
        SERVER_URL + '/admin/userpermission/change/v1',
        {
          headers: {
            token: user1.token
          },
          json: {
            uId: -99999,
            permissionId: 1,
          }
        });
      expect(res.statusCode).toStrictEqual(400);
    });
    test('uId refers to a user who is the only global owner and they are being demoted to a user', () => {
      const res = request(
        'POST',
        SERVER_URL + '/admin/userpermission/change/v1',
        {
          headers: {
            token: user1.token
          },
          json: {
            uId: user1.authUserId,
            permissionId: 2,
          }
        });
      expect(res.statusCode).toStrictEqual(400);
    });
    test('Invalid permissionId', () => {
      const res = request(
        'POST',
        SERVER_URL + '/admin/userpermission/change/v1',
        {
          headers: {
            token: user1.token
          },
          json: {
            uId: user2.authUserId,
            permissionId: 10,
          }
        });
      expect(res.statusCode).toStrictEqual(400);
    });
    test('The user already has the permissions level of permissionId', () => {
      const res = request(
        'POST',
        SERVER_URL + '/admin/userpermission/change/v1',
        {
          headers: {
            token: user1.token
          },
          json: {
            uId: user2.authUserId,
            permissionId: 2,
          }
        });
      expect(res.statusCode).toStrictEqual(400);
    });
    test('The authorised user is not a global owner', () => {
      const res = request(
        'POST',
        SERVER_URL + '/admin/userpermission/change/v1',
        {
          headers: {
            token: user2.token
          },
          json: {
            uId: user1.authUserId,
            permissionId: 1,
          }
        });
      expect(res.statusCode).toStrictEqual(403);
    });
    test('Invalid token', () => {
      const res = request(
        'POST',
        SERVER_URL + '/admin/userpermission/change/v1',
        {
          headers: {
            token: '-9999'
          },
          json: {
            uId: user3.authUserId,
            permissionId: 1,
          }
        });
      expect(res.statusCode).toStrictEqual(403);
    });
  });
});

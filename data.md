
```javascript
const data = {
    users: {
        1: {
            uId: 1,
            email: 'haydensmith@gmail.com',
            password: 'password',
            nameFirst: 'Hayden',
            nameLast: 'Smith',
            handleStr: 'hayden_smith',
            whetherGlobal: true,
        },
        2: {
            uId: 2,
            email: 'rileyliu@gmail.com',
            password: '1233444',
            nameFirst: 'Riley',
            nameLast: 'Liu',
            handleStr: 'Riley_Liu',
            whetherGlobal: false,
        }
    },

    channels: {
        1:{
            channelId: 1，
            name: 'My Channel',
            messages: [1,2],
            ownerMembers: [1],
            ispublic: true,
            allMembers: [1,2],
        },
        2:{
            channelId: 2,
            name: 'our Channel',
            messages: [1,2],
            ownerMembers: [1],
            ispublic: true,
            allMembers: [1,2],
        }
    },

    messages: {
        1:{
            messageId: 1,
            uId: 1,
            message:'Hello, World',
            timeSent: 124444444,
        },
        2:{
            messageId:2,
            uId:2,
            message:"sssss",
            timeSent: 12232423,
        }
    }
}
``` 

[Optional] short description:
The data to populate the file was inspired by the iteration 0 interface. This program will allow users to communicate on the new UNSW Beans platform. Each user has a unique id and password to log into their account. Their full name and user handle will allow them to be easily identified by fellow users of the app.


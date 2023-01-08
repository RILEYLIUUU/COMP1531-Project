import fs from 'fs';

const save = () => {
  const jsonstr = JSON.stringify(data);
  fs.writeFileSync('./database.json', jsonstr);
};

const load = () => {
  if (fs.existsSync('./database.json')) {
    const dbstr = fs.readFileSync('./database.json');
    data = JSON.parse(String(dbstr));
  }
};

// =============================================== //

interface Notification {
  channelId: number;
  dmId: number;
  notificationMessage: string;
}

interface User {
  uId: number;
  email: string;
  password: string;
  nameFirst: string;
  nameLast: string;
  handleStr: string;
  permissionId: number;
  sessions: string[];
  secretCode?: string;
  profileImgUrl: string;
  hashSessions: string[];
  notifications: Notification[];
}

interface Channel {
  name: string;
  channelId: number;
  isPublic: boolean;
  ownerMembers: number[];
  allMembers: number[];
  messagesId: number[];
  isActive: boolean;
  standupMessage: string[];
  timeFinish: number;
}

interface React {
  reactId: number;
  uIds: number[];
}

export interface Message {
  messageId: number;
  uId: number;
  channelId?: number;
  dmId?: number;
  message: string;
  ogMessage?: string;
  timeSent: number;
  reacts: React[];
  isPinned: boolean;
}

interface DM {
  dmId: number,
  name: string,
  uIds: number[],
  creator: number,
  messagesId: number[],
  members: User[],
}

interface Data {
  users: User[];
  allUsers: User[];
  channels: Channel[];
  messages: Message[];
  dms: DM[];
  messageCreationCounter: number;
}

// =============================================== //

// YOU SHOULD MODIFY THIS OBJECT BELOW
let data: Data = {
  users: [],
  allUsers: [],
  channels: [],
  messages: [],
  dms: [],
  messageCreationCounter: 0
};

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
function getData() {
  load();
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData) {
  data = newData;
  save();
}

export { getData, setData };

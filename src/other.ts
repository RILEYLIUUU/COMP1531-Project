import { getData, setData } from './dataStore';

/**
 * Function used to empty the data in dataStore
 *
 * @param {}
 * @returns {}
 *
 */
export function clearV1() {
  const data = getData();
  data.users = [];
  data.allUsers = [];
  data.channels = [];
  data.messages = [];
  data.dms = [];
  data.messageCreationCounter = 0;
  setData(data);
  return {};
}

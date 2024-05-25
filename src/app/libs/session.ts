export enum sessionMap {
  loginResponseTokens = '$sef-user$',
}

export const setSession = (key: sessionMap, value: unknown): void => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const getSession = (key: sessionMap) => {
  return JSON.parse(window.localStorage.getItem(key)!);
};

export const endSession = () => {
  window.localStorage.clear();
  window.location.reload();
};

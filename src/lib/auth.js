import { writable } from "svelte/store";

export const authStates = {
  LOGGED_OUT: "logged out",
  LOGIN_PENDING: "pending",
  LOGGED_IN: "logged in",
  LOGIN_FAILED: "failed",
};

export const authState = writable(authStates.LOGGED_OUT);
export const user = writable({});

export const login_initiate = (userName, password) => {
  user.set({
    name: userName,
    password,
  });
  authState.set(authStates.LOGIN_PENDING);
};

export const login_complete = () => {
  authState.set(authStates.LOGGED_IN);
};

export const login_fail = () => {
  authState.set(authStates.LOGIN_FAILED);
};

export const logout = () => {
  user.set({});
  authState.set(authStates.LOGGED_OUT);
};

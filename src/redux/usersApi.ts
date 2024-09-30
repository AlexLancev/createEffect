import { createStore, createEvent, createEffect, sample } from "effector";
import persist from "effector-localstorage";
import { v4 as uuidv4 } from "uuid";

import { DataType } from "../types";
import { FetchError, UserNotFoundError, UserCopyError, UserAddError } from "../types/errors";

export const $users = createStore<DataType[]>([]);

export const setUsers = createEvent<DataType[]>();
export const addUser = createEvent<DataType>();
export const deleteUser = createEvent<string>();
export const copyUser = createEvent<string>();

const headers = {
  "Content-Type": "application/json",
};

sample({
  clock: setUsers,
  target: $users,
});

sample({
  source: $users,
  clock: addUser,
  fn: (state, user) => [...state, user],
  target: $users,
});

sample({
  source: $users,
  clock: deleteUser,
  fn: (state, key) => {
    const userExists = state.some(user => user.key === key);
    if (!userExists) {
      console.warn(new UserNotFoundError(key).message);
      return state;
    }
    return state.filter(user => user.key !== key);
  },
  target: $users,
});

sample({
  source: $users,
  clock: copyUser,
  fn: (state, key) => {
    const userToCopy = state.find(user => user.key === key);
    if (!userToCopy) {
      console.warn(new UserNotFoundError(key).message);
      return state;
    }
    const newUser = { ...userToCopy, key: uuidv4() };
    return [...state, newUser];
  },
  target: $users,
});

export const fetchUsersEffect = createEffect<void, DataType[], FetchError>(async () => {
  const response = await fetch("/api/users");
  if (!response.ok) {
    throw new FetchError("Ошибка при загрузке пользователей");
  }
  return response.json();
});

fetchUsersEffect.done.watch(({ result }) => {
  setUsers(result);
});

fetchUsersEffect();

export const deleteUserEffect = createEffect<string, { key: string }, FetchError>(async (key) => {
  const response = await fetch(`/api/users/${key}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) {
    throw new FetchError("Ошибка при удалении пользователя");
  }
  return { key };
});

deleteUserEffect.done.watch(({ result }) => {
  deleteUser(result.key);
});

export const addUserEffect = createEffect<Partial<DataType>, DataType, UserAddError>(async (userData) => {
  const response = await fetch("/api/users", {
    method: "POST",
    headers,
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    throw new UserAddError("Ошибка при добавлении пользователя");
  }
  return response.json();
});

addUserEffect.done.watch(({ result }) => {
  addUser(result);
});

export const copyUserEffect = createEffect<Partial<DataType>, DataType, UserCopyError>(async (userData) => {
  const response = await fetch("/api/users", {
    method: "POST",
    headers,
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    throw new UserCopyError("Ошибка при копировании пользователя");
  }
  return response.json();
});

copyUserEffect.done.watch(({ result }) => {
  addUser(result);
});

persist({ store: $users, key: "users" });

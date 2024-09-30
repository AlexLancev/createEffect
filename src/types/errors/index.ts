export class FetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FetchError";
  }
}

export class UserNotFoundError extends Error {
  constructor(key: string) {
    super(`Пользователь с ключом ${key} не найден.`);
    this.name = "UserNotFoundError";
  }
}

export class UserCopyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserCopyError";
  }
}

export class UserAddError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserAddError";
  }
}

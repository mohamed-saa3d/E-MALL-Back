export interface IResponseUser {
  id: number;
  email: string;
  name: string;
}

export interface IRequestUser {
  email: string;
  password: string;
  name: string;
}

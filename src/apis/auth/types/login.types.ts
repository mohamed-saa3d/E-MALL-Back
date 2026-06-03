export interface IResponseUser {
  id: number;
  email: string;
  name: string;
  phoneNumber: string;
}

export interface IRequestUser {
  email: string;
  password: string;
}
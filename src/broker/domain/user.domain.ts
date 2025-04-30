export interface IUser {
  id: number;
  email: string;
  accountnumber: string;
}

export class User implements IUser {
  public id: number;
  public email: string;
  public accountnumber: string;

  constructor(id: number, email: string, accountnumber: string) {
    this.id = id;
    this.email = email;
    this.accountnumber = accountnumber;
  }
}

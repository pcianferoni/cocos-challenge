export class User {
  public id: number;
  public email?: string;
  public accountnumber?: string;

  constructor(id: number, accountnumber?: string, email?: string) {
    this.id = id;
    this.accountnumber = accountnumber;
    this.email = email;
  }
}

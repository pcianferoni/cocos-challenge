export class Portfolio {
  public availableCash: number;
  public totalBalance: number;
  public assets: AssetYield[];

  constructor(
    availableCash: number,
    totalBalance: number,
    assets: AssetYield[],
  ) {
    this.availableCash = availableCash;
    this.totalBalance = totalBalance;
    this.assets = assets;
  }
}
export class AssetYield {
  constructor(
    public ticker: string,
    public currentValue: number,
    public performance: number,
    public quantity: number,
  ) {}
}

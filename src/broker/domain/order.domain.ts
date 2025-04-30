import z from 'zod';

export class Order {
  public id: number;
  public size: number;
  public price: number;
  public type: ORDER_TYPE;
  public side: ORDER_SIDE;
  public status: ORDER_STATUS;
  public datetime: string;
  public instrumentid: number;
  public userid: number;

  constructor(order: any) {
    this.id = order.id;
    this.size = order.size;
    this.price = order.price;
    this.type = order.type;
    this.side = order.side;
    this.status = order.status;
    this.datetime = order.datetime;
    this.instrumentid = order.instrumentid;
    this.userid = order.userid;
  }

  isBuyOrSell(): boolean {
    return this.side === ORDER_SIDE.BUY || this.side === ORDER_SIDE.SELL;
  }

  isBuy(): boolean {
    return this.side === ORDER_SIDE.BUY;
  }

  isSell(): boolean {
    return this.side === ORDER_SIDE.SELL;
  }

  isStatusFilled(): boolean {
    return this.status === ORDER_STATUS.FILLED;
  }
}

export enum ORDER_STATUS {
  NEW = 'NEW',
  FILLED = 'FILLED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum ORDER_SIDE {
  BUY = 'BUY',
  SELL = 'SELL',
  CASH_IN = 'CASH_IN',
  CASH_OUT = 'CASH_OUT',
}

export enum ORDER_TYPE {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
}

export const FIAT_ARS_INSTRUMENT_ID = 66;

export const CreateBuyOrderSchema = z
  .object({
    instrumentid: z.number(),
    side: z.nativeEnum(ORDER_SIDE),
    size: z.number().optional(),
    price: z.number().optional(),
    type: z.nativeEnum(ORDER_TYPE),
    userid: z.number(),
    isSizeBased: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.isSizeBased) {
      if (data.size == null) {
        ctx.addIssue({
          path: ['size'],
          code: z.ZodIssueCode.custom,
          message: "Debe proporcionar 'size' cuando isSizeBased es true",
        });
      }
    } else {
      if (data.price == null) {
        ctx.addIssue({
          path: ['price'],
          code: z.ZodIssueCode.custom,
          message: "Debe proporcionar 'price' cuando isSizeBased es false",
        });
      }
    }
  });

export const CreateSellOrderSchema = z.object({
  instrumentid: z.number(),
  side: z.nativeEnum(ORDER_SIDE),
  size: z.number().optional(),
  type: z.nativeEnum(ORDER_TYPE),
  userid: z.number(),
});

import { Result } from "../shared/result";
import { getFutureDate } from "../utils/date";

export class Client {
  private _ip: string;
  private _expirationDate: Date;
  private _ttl: number;
  constructor(ip: string, ttl: number = 3600) {
    this._ip = ip;
    this._expirationDate = getFutureDate(ttl);
    this._ttl = ttl;
  }

  get ip(): string {
    return this._ip;
  }

  get expirationDate(): Date {
    return this._expirationDate;
  }

  public isExpired(): boolean {
    return new Date() > this._expirationDate;
  }

  public renew(): Result<Date> {
    if (this.isExpired()) {
      return Result.error(new Error("Client is already expired"));
    }

    this._expirationDate = getFutureDate(this._ttl);
    return Result.success(this._expirationDate);
  }
}

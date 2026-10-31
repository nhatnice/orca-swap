export default interface ITradeBody {
  pool?: string;
  amount: number;
  amountDecimal?: number;
  secretKey: string;
  cluster?: string;
  tokenOwnerAccountA?: string;
  tokenOwnerAccountB?: string;
}

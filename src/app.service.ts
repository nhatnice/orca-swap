import { BadRequestException, Injectable } from '@nestjs/common';
import ITradeBody from './interfaces/ITradeBody';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { DecimalUtil } from '@orca-so/sdk';
import Decimal from 'decimal.js';
import { base58 } from '@scure/base';
import {
  MAX_SQRT_PRICE,
  MIN_SQRT_PRICE,
  ORCA_WHIRLPOOL_PROGRAM_ID,
  PDAUtil,
  TickUtil,
  WhirlpoolContext,
  WhirlpoolIx,
  buildWhirlpoolClient,
  toTx,
} from '@orca-so/whirlpools-sdk';
import { BN, Wallet } from '@coral-xyz/anchor';

const DEFAULT_CLUSTER =
  process.env.SOLANA_CLUSTER || 'https://api.mainnet-beta.solana.com';
const DEFAULT_POOL =
  process.env.DEFAULT_POOL_ADDRESS ||
  '8Mt3QbGAn7x3BowDrDiFmXJbsmzY8mpQ5jNw8BqX5GWc';
const DEFAULT_TOKEN_A_OWNER = process.env.DEFAULT_TOKEN_A_OWNER || '';
const DEFAULT_TOKEN_B_OWNER = process.env.DEFAULT_TOKEN_B_OWNER || '';

@Injectable()
export class AppService {
  async buy(body: ITradeBody) {
    if (!body.secretKey) {
      throw new BadRequestException('secretKey is required');
    }

    const tokenOwnerAccountA =
      body.tokenOwnerAccountA || DEFAULT_TOKEN_A_OWNER;
    const tokenOwnerAccountB =
      body.tokenOwnerAccountB || DEFAULT_TOKEN_B_OWNER;

    if (!tokenOwnerAccountA) {
      throw new BadRequestException(
        'tokenOwnerAccountA is required (or set DEFAULT_TOKEN_A_OWNER in .env)',
      );
    }
    if (!tokenOwnerAccountB) {
      throw new BadRequestException(
        'tokenOwnerAccountB is required (or set DEFAULT_TOKEN_B_OWNER in .env)',
      );
    }

    const cluster = body.cluster || DEFAULT_CLUSTER;
    const connection = new Connection(cluster, 'singleGossip');
    const wallet = new Wallet(
      Keypair.fromSecretKey(base58.decode(body.secretKey)),
    );
    const ctx = WhirlpoolContext.from(
      connection,
      wallet,
      ORCA_WHIRLPOOL_PROGRAM_ID,
    );

    const whirlpoolClient = buildWhirlpoolClient(ctx);
    const poolAddress = body.pool || DEFAULT_POOL;
    const whirlpool = await whirlpoolClient.getPool(poolAddress);
    const whirlpoolData = await whirlpool.getData();

    const amountIn = DecimalUtil.toU64(
      new Decimal(body.amount),
      body.amountDecimal || 6,
    );
    const startTick = TickUtil.getStartTickIndex(
      whirlpoolData.tickCurrentIndex,
      whirlpoolData.tickSpacing,
    );
    const tickArrayKey = PDAUtil.getTickArray(
      ORCA_WHIRLPOOL_PROGRAM_ID,
      whirlpool.getAddress(),
      startTick,
    );

    const oraclePda = PDAUtil.getOracle(
      ctx.program.programId,
      whirlpool.getAddress(),
    );
    const tx = toTx(
      ctx,
      WhirlpoolIx.swapIx(ctx.program, {
        whirlpool: whirlpool.getAddress(),
        tokenAuthority: ctx.wallet.publicKey,
        tokenOwnerAccountA: new PublicKey(tokenOwnerAccountA),
        tokenVaultA: whirlpool.getTokenVaultAInfo().address,
        tokenOwnerAccountB: new PublicKey(tokenOwnerAccountB),
        tokenVaultB: whirlpool.getTokenVaultBInfo().address,
        oracle: oraclePda.publicKey,
        amount: amountIn,
        otherAmountThreshold: new BN(0),
        sqrtPriceLimit: new BN(MAX_SQRT_PRICE),
        amountSpecifiedIsInput: true,
        aToB: false,
        tickArray0: tickArrayKey.publicKey,
        tickArray1: tickArrayKey.publicKey,
        tickArray2: tickArrayKey.publicKey,
      }),
    );

    const txId = await tx.buildAndExecute();

    return {
      txId,
    };
  }

  async sell(body: ITradeBody) {
    if (!body.secretKey) {
      throw new BadRequestException('secretKey is required');
    }

    const tokenOwnerAccountA =
      body.tokenOwnerAccountA || DEFAULT_TOKEN_A_OWNER;
    const tokenOwnerAccountB =
      body.tokenOwnerAccountB || DEFAULT_TOKEN_B_OWNER;

    if (!tokenOwnerAccountA) {
      throw new BadRequestException(
        'tokenOwnerAccountA is required (or set DEFAULT_TOKEN_A_OWNER in .env)',
      );
    }
    if (!tokenOwnerAccountB) {
      throw new BadRequestException(
        'tokenOwnerAccountB is required (or set DEFAULT_TOKEN_B_OWNER in .env)',
      );
    }

    const cluster = body.cluster || DEFAULT_CLUSTER;
    const connection = new Connection(cluster, 'singleGossip');
    const wallet = new Wallet(
      Keypair.fromSecretKey(base58.decode(body.secretKey)),
    );
    const ctx = WhirlpoolContext.from(
      connection,
      wallet,
      ORCA_WHIRLPOOL_PROGRAM_ID,
    );

    const whirlpoolClient = buildWhirlpoolClient(ctx);
    const poolAddress = body.pool || DEFAULT_POOL;
    const whirlpool = await whirlpoolClient.getPool(poolAddress);
    const whirlpoolData = await whirlpool.getData();

    const amountIn = DecimalUtil.toU64(
      new Decimal(body.amount),
      body.amountDecimal || 9,
    );
    const startTick = TickUtil.getStartTickIndex(
      whirlpoolData.tickCurrentIndex,
      whirlpoolData.tickSpacing,
    );
    const tickArrayKey = PDAUtil.getTickArray(
      ORCA_WHIRLPOOL_PROGRAM_ID,
      whirlpool.getAddress(),
      startTick,
    );

    const oraclePda = PDAUtil.getOracle(
      ctx.program.programId,
      whirlpool.getAddress(),
    );
    const tx = toTx(
      ctx,
      WhirlpoolIx.swapIx(ctx.program, {
        whirlpool: whirlpool.getAddress(),
        tokenAuthority: ctx.wallet.publicKey,
        tokenOwnerAccountA: new PublicKey(tokenOwnerAccountA),
        tokenVaultA: whirlpool.getTokenVaultAInfo().address,
        tokenOwnerAccountB: new PublicKey(tokenOwnerAccountB),
        tokenVaultB: whirlpool.getTokenVaultBInfo().address,
        oracle: oraclePda.publicKey,
        amount: amountIn,
        otherAmountThreshold: new BN(0),
        sqrtPriceLimit: new BN(MIN_SQRT_PRICE),
        amountSpecifiedIsInput: true,
        aToB: true,
        tickArray0: tickArrayKey.publicKey,
        tickArray1: tickArrayKey.publicKey,
        tickArray2: tickArrayKey.publicKey,
      }),
    );

    const txId = await tx.buildAndExecute();

    return {
      txId,
    };
  }
}

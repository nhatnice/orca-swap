import { Injectable } from '@nestjs/common';
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

const MAINNET_CLUSTER = 'https://api.mainnet-beta.solana.com';
const LMF_POOL = '8Mt3QbGAn7x3BowDrDiFmXJbsmzY8mpQ5jNw8BqX5GWc';
const LMF_TOKEN_A_OWNER = '59Kg4RVmw5MWMbxRHcLjiLneKNhDu4DB57wQTV9FC5nz';
const LMF_TOKEN_B_OWNER = '5eamoqoaNTqrffjJ55VoZUyzFFcomrebbdL3RBha6hV5';

@Injectable()
export class AppService {
  async buy(body: ITradeBody) {
    const connection = new Connection(body.cluster, 'singleGossip');
    const wallet = new Wallet(
      Keypair.fromSecretKey(base58.decode(body.secretKey)),
    );
    const ctx = WhirlpoolContext.from(
      connection,
      wallet,
      ORCA_WHIRLPOOL_PROGRAM_ID,
    );

    const whirlpoolClient = buildWhirlpoolClient(ctx);
    const whirlpool = await whirlpoolClient.getPool(body.pool || LMF_POOL);
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
        tokenOwnerAccountA: new PublicKey(
          body.tokenOwnerAccountA || LMF_TOKEN_A_OWNER,
        ),
        tokenVaultA: whirlpool.getTokenVaultAInfo().address,
        tokenOwnerAccountB: new PublicKey(
          body.tokenOwnerAccountB || LMF_TOKEN_B_OWNER,
        ),
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
    const connection = new Connection(body.cluster, 'singleGossip');
    const wallet = new Wallet(
      Keypair.fromSecretKey(base58.decode(body.secretKey)),
    );
    const ctx = WhirlpoolContext.from(
      connection,
      wallet,
      ORCA_WHIRLPOOL_PROGRAM_ID,
    );

    const whirlpoolClient = buildWhirlpoolClient(ctx);
    const whirlpool = await whirlpoolClient.getPool(body.pool || LMF_POOL);
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
        tokenOwnerAccountA: new PublicKey(
          body.tokenOwnerAccountA || LMF_TOKEN_A_OWNER,
        ),
        tokenVaultA: whirlpool.getTokenVaultAInfo().address,
        tokenOwnerAccountB: new PublicKey(
          body.tokenOwnerAccountB || LMF_TOKEN_B_OWNER,
        ),
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

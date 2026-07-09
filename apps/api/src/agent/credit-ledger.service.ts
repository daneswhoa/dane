import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../db/database.module';
import * as schema from '../db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import * as crypto from 'crypto';

@Injectable()
export class CreditLedgerService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any
  ) {}

  /**
   * Resolves the current balance of any given user or reserve account by summing all transaction outputs
   */
  async resolveBalance(username: string): Promise<number> {
    return this.resolveBalanceWithTx(this.db, username);
  }

  /**
   * Internal helper supporting transaction scopes (prevents race conditions)
   */
  private async resolveBalanceWithTx(tx: any, username: string): Promise<number> {
    const received = await tx
      .select({ total: sql<number>`COALESCE(sum(amount), 0)` })
      .from(schema.creditTransactions)
      .where(eq(schema.creditTransactions.receiverUsername, username));

    const sent = await tx
      .select({ total: sql<number>`COALESCE(sum(amount), 0)` })
      .from(schema.creditTransactions)
      .where(eq(schema.creditTransactions.senderUsername, username));

    const receivedVal = Number(received[0]?.total || 0);
    const sentVal = Number(sent[0]?.total || 0);

    return Math.max(0, receivedVal - sentVal);
  }

  /**
   * Mints new credits out of thin air into the central 'RESERVE' account
   */
  async mintCredits(amount: number, description: string = 'Minted new supply'): Promise<string> {
    if (amount <= 0) {
      throw new Error('Mint amount must be positive');
    }

    return this.db.transaction(async (tx: any) => {
      const lastTx = await tx
        .select()
        .from(schema.creditTransactions)
        .orderBy(desc(schema.creditTransactions.timestamp))
        .limit(1);

      const prevTxid = lastTx[0]?.id || 'GENESIS';
      const timestamp = new Date();

      // SHA-256 block hash computation: sender + receiver + amount + type + timestamp + prevTxid
      const hashInput = `SYSTEM|RESERVE|${amount}|mint|${timestamp.toISOString()}|${prevTxid}`;
      const txid = crypto.createHash('sha256').update(hashInput).digest('hex');

      await tx.insert(schema.creditTransactions).values({
        id: txid,
        senderUsername: 'SYSTEM',
        receiverUsername: 'RESERVE',
        amount,
        transactionType: 'mint',
        operationCategory: 'manual_adjust',
        description,
        previousTxid: prevTxid === 'GENESIS' ? null : prevTxid,
        timestamp,
      });

      return txid;
    });
  }

  /**
   * Transfers credits between accounts, verifying balances and calculating block hashes
   */
  async transferCredits(
    sender: string,
    receiver: string,
    amount: number,
    type: 'transfer' | 'purchase' | 'spend',
    category?: 'email_broadcast' | 'sophia_chat' | 'whatsapp_notif' | 'sms_notif' | 'manual_adjust',
    description?: string
  ): Promise<string> {
    if (amount <= 0) {
      throw new Error('Transfer amount must be positive');
    }

    return this.db.transaction(async (tx: any) => {
      // Enforce transaction balance check to block double spending
      const senderBalance = await this.resolveBalanceWithTx(tx, sender);
      if (senderBalance < amount) {
        throw new Error(`Insufficient credits: ${sender} has ${senderBalance} tokens, requested ${amount}`);
      }

      const lastTx = await tx
        .select()
        .from(schema.creditTransactions)
        .orderBy(desc(schema.creditTransactions.timestamp))
        .limit(1);

      const prevTxid = lastTx[0]?.id || 'GENESIS';
      const timestamp = new Date();

      // SHA-256 block hash computation: sender + receiver + amount + type + timestamp + prevTxid
      const hashInput = `${sender}|${receiver}|${amount}|${type}|${timestamp.toISOString()}|${prevTxid}`;
      const txid = crypto.createHash('sha256').update(hashInput).digest('hex');

      await tx.insert(schema.creditTransactions).values({
        id: txid,
        senderUsername: sender,
        receiverUsername: receiver,
        amount,
        transactionType: type,
        operationCategory: category || 'manual_adjust',
        description: description || '',
        previousTxid: prevTxid === 'GENESIS' ? null : prevTxid,
        timestamp,
      });

      return txid;
    });
  }

  /**
   * Verifies the SHA-256 block signature chain integrity recursively going back up to 50 blocks
   */
  async verifyTransactionChain(txid: string): Promise<{ isValid: boolean; error?: string; chain?: any[] }> {
    let currentId = txid;
    const verifiedChain: any[] = [];
    const maxSteps = 50;

    for (let i = 0; i < maxSteps; i++) {
      const txRecords = await this.db
        .select()
        .from(schema.creditTransactions)
        .where(eq(schema.creditTransactions.id, currentId))
        .limit(1);

      if (txRecords.length === 0) {
        return { isValid: false, error: `Block ID ${currentId} not found in transaction history.`, chain: verifiedChain };
      }

      const currentBlock = txRecords[0];
      const timestampStr = currentBlock.timestamp instanceof Date 
        ? currentBlock.timestamp.toISOString() 
        : new Date(currentBlock.timestamp).toISOString();

      const prevTxid = currentBlock.previousTxid || 'GENESIS';

      // Re-hash block details to verify integrity
      const hashInput = `${currentBlock.senderUsername}|${currentBlock.receiverUsername}|${currentBlock.amount}|${currentBlock.transactionType}|${timestampStr}|${prevTxid}`;
      const calculatedHash = crypto.createHash('sha256').update(hashInput).digest('hex');

      if (calculatedHash !== currentBlock.id) {
        return {
          isValid: false,
          error: `Integrity check failed at Block ${currentBlock.id}. Stored hash mismatch. Recalculated: ${calculatedHash}`,
          chain: verifiedChain
        };
      }

      verifiedChain.push({
        txid: currentBlock.id,
        sender: currentBlock.senderUsername,
        receiver: currentBlock.receiverUsername,
        amount: currentBlock.amount,
        type: currentBlock.transactionType,
        category: currentBlock.operationCategory,
        timestamp: currentBlock.timestamp,
        previousTxid: currentBlock.previousTxid,
        description: currentBlock.description
      });

      if (!currentBlock.previousTxid) {
        // Reached genesis block/start of ledger chain
        break;
      }

      currentId = currentBlock.previousTxid;
    }

    return { isValid: true, chain: verifiedChain };
  }
}

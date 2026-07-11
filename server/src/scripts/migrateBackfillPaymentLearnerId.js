import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";

dotenv.config();

/**
 * migrateBackfillPaymentLearnerId
 *
 * Task 8.8 — one-off, backward-compatible migration.
 *
 * For every existing Payment document where learnerId is not set, look up
 * a User by the stored email (case-insensitive). If exactly ONE match is
 * found, set learnerId to that User's _id. If zero or multiple matches are
 * found, leave learnerId unset (never guess).
 *
 * Rules:
 *   - Idempotent: safe to re-run. Documents that already have learnerId,
 *     or that were already checked and left unset due to 0/2+ matches,
 *     are skipped on subsequent runs (matched again the same way, same
 *     deterministic result — running it twice changes nothing further).
 *   - Never modifies amount, status, orderId, paymentId, or any other
 *     existing field — only ever sets `learnerId`.
 *
 * Usage:
 *   node src/scripts/migrateBackfillPaymentLearnerId.js
 */
const run = async () => {
  await connectDB();

  const candidates = await Payment.find({
    $or: [{ learnerId: { $exists: false } }, { learnerId: null }],
  }).select("_id email");

  console.log(`Found ${candidates.length} Payment record(s) with no learnerId.`);

  let updated = 0;
  let skippedNoMatch = 0;
  let skippedMultipleMatches = 0;

  for (const payment of candidates) {
    if (!payment.email) {
      skippedNoMatch += 1;
      continue;
    }

    // Case-insensitive exact match on email (not a partial/regex match —
    // this is a data migration and must not guess).
    const matches = await User.find({
      email: { $regex: `^${escapeRegExp(payment.email)}$`, $options: "i" },
    })
      .select("_id")
      .lean();

    if (matches.length === 1) {
      await Payment.updateOne(
        { _id: payment._id },
        { $set: { learnerId: matches[0]._id } }
      );
      updated += 1;
    } else if (matches.length === 0) {
      skippedNoMatch += 1;
    } else {
      skippedMultipleMatches += 1;
    }
  }

  console.log("Migration complete.");
  console.log(`  Updated:                    ${updated}`);
  console.log(`  Skipped (no user match):    ${skippedNoMatch}`);
  console.log(`  Skipped (multiple matches): ${skippedMultipleMatches}`);

  await mongoose.connection.close();
  process.exit(0);
};

// Escape a string for safe use inside a RegExp.
const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

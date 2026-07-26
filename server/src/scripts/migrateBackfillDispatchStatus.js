import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Certificate from "../models/Certificate.js";

dotenv.config();

/**
 * migrateBackfillDispatchStatus
 *
 * Certificate Dispatch & Courier Management — one-off, backward-compatible
 * migration.
 *
 * The new `dispatchStatus` field defaults to "pending" for every NEW
 * certificate, but Mongoose only applies schema defaults on document
 * hydration — most of the dispatch module's queries use `.lean()` for
 * performance, which returns raw documents and will NOT show the default
 * for certificates that existed before this module was added. This script
 * backfills the field on disk once, so every certificate (old and new)
 * behaves identically everywhere, including in `.lean()` queries and
 * aggregations.
 *
 * Rules:
 *   - Idempotent: only touches documents where dispatchStatus does not
 *     already exist. Safe to re-run.
 *   - Never modifies certificateNumber, status, issuedAt, or any other
 *     existing field — only ever sets `dispatchStatus` (and nothing else).
 *
 * Usage:
 *   node src/scripts/migrateBackfillDispatchStatus.js
 */
const run = async () => {
  await connectDB();

  const result = await Certificate.updateMany(
    { dispatchStatus: { $exists: false } },
    { $set: { dispatchStatus: "pending" } }
  );

  console.log(`Backfilled dispatchStatus="pending" on ${result.modifiedCount} certificate(s).`);
  process.exit(0);
};

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

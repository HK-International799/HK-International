import mongoose from "mongoose";

// ── Certificate Dispatch & Courier Management: Expense tracking ────────────
export const DISPATCH_EXPENSE_CATEGORIES = [
  "Courier Charges",
  "Certificate Envelope",
  "Brown Envelope",
  "Plastic Cover",
  "Tape",
  "Glue",
  "Scissors",
  "Cutter",
  "Marker",
  "Scale",
  "Printer Ink",
  "Paper",
  "Fuel",
  "Bike Fuel",
  "Auto Fare",
  "Bus Fare",
  "Taxi",
  "Parking",
  "Food During Dispatch",
  "Miscellaneous",
];

export const DISPATCH_PAYMENT_MODES = ["cash", "upi", "card", "bank_transfer", "other"];

const dispatchExpenseSchema = new mongoose.Schema(
  {
    expenseDate: { type: Date, required: true, default: Date.now },
    category: { type: String, enum: DISPATCH_EXPENSE_CATEGORIES, required: true },
    item: { type: String, required: true, trim: true },
    quantity: { type: Number, default: 1, min: 0 },
    unitPrice: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 }, // auto-calculated (quantity * unitPrice) unless overridden

    vendor: { type: String, default: "" },
    billNumber: { type: String, default: "" },
    paymentMode: { type: String, enum: DISPATCH_PAYMENT_MODES, default: "cash" },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    notes: { type: String, default: "" },

    billUrl: { type: String, default: "" },
    billPublicId: { type: String, default: "" },

    // Optional link to a dispatch batch. Null = general dispatch expense,
    // not tied to any single day's consignment.
    dispatchBatch: { type: mongoose.Schema.Types.ObjectId, ref: "DispatchBatch", default: null },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

dispatchExpenseSchema.pre("validate", function calcTotal(next) {
  if (this.isModified("quantity") || this.isModified("unitPrice") || this.isNew) {
    const computed = (this.quantity || 0) * (this.unitPrice || 0);
    // Only auto-fill when total wasn't explicitly provided/overridden
    if (this.total === undefined || this.total === null || this.total === 0) {
      this.total = computed;
    }
  }
  next();
});

dispatchExpenseSchema.index({ expenseDate: -1 });
dispatchExpenseSchema.index({ dispatchBatch: 1 });
dispatchExpenseSchema.index({ category: 1 });

export default mongoose.model("DispatchExpense", dispatchExpenseSchema);

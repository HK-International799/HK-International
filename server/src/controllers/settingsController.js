import Settings from "../models/Settings.js";

export const getSettings = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    const settings = await Settings.find(filter).sort({ category: 1, key: 1 });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching settings", error: err.message });
  }
};

export const upsertSetting = async (req, res) => {
  try {
    const { key, value, category, description } = req.body;
    const setting = await Settings.findOneAndUpdate(
      { key },
      { value, category, description, updatedBy: req.user._id },
      { new: true, upsert: true }
    );
    res.json(setting);
  } catch (err) {
    res.status(500).json({ message: "Error saving setting", error: err.message });
  }
};

export const deleteSetting = async (req, res) => {
  try {
    await Settings.findByIdAndDelete(req.params.id);
    res.json({ message: "Setting deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting setting", error: err.message });
  }
};

export const bulkUpdateSettings = async (req, res) => {
  try {
    const { settings } = req.body; // array of { key, value, category }
    const ops = settings.map((s) => ({
      updateOne: {
        filter: { key: s.key },
        update: { $set: { value: s.value, category: s.category, updatedBy: req.user._id } },
        upsert: true,
      },
    }));
    await Settings.bulkWrite(ops);
    const all = await Settings.find().sort({ category: 1, key: 1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: "Error bulk updating", error: err.message });
  }
};

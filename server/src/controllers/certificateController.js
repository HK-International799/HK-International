import Certificate from "../models/Certificate.js";
import crypto from "crypto";

export const issueCertificate = async (req, res) => {
  try {
    const certNum = `CERT-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const cert = await Certificate.create({
      ...req.body,
      certificateNumber: certNum,
      issuedBy: req.user._id,
    });
    res.status(201).json(cert);
  } catch (err) {
    res.status(500).json({ message: "Error issuing certificate", error: err.message });
  }
};

export const getAllCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find()
      .populate("studentId", "name email avatar")
      .populate("courseId", "title")
      .populate("issuedBy", "name")
      .sort({ issuedAt: -1 });
    res.json(certs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching certificates", error: err.message });
  }
};

export const getCertificateById = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id)
      .populate("studentId", "name email")
      .populate("courseId", "title");
    if (!cert) return res.status(404).json({ message: "Certificate not found" });
    res.json(cert);
  } catch (err) {
    res.status(500).json({ message: "Error fetching certificate", error: err.message });
  }
};

export const revokeCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findByIdAndUpdate(req.params.id, { status: "revoked" }, { new: true });
    if (!cert) return res.status(404).json({ message: "Certificate not found" });
    res.json(cert);
  } catch (err) {
    res.status(500).json({ message: "Error revoking certificate", error: err.message });
  }
};

export const deleteCertificate = async (req, res) => {
  try {
    await Certificate.findByIdAndDelete(req.params.id);
    res.json({ message: "Certificate deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting certificate", error: err.message });
  }
};

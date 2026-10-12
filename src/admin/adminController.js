import bcrypt from "bcrypt";
import Admin from "./adminModel.js";
import generateToken from "../../utils/generateToken.js";

const sanitizeAdmin = (admin) => {
  if (!admin) {
    return null;
  }

  const adminData = admin.toObject ? admin.toObject() : { ...admin };
  delete adminData.password;
  return adminData;
};

const issueToken = (admin) => generateToken(
  {
    id: admin._id.toString(),
    email: admin.email,
    role: admin.role,
    isFounder: admin.isFounder,
  }
);

export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch admins", error: error.message });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { fullName, email, password, role, isFounder } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "fullName, email, and password are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingAdmin = await Admin.findOne({ email: normalizedEmail });

    if (existingAdmin) {
      return res.status(409).json({ message: "An admin with this email already exists." });
    }

    const admin = await Admin.create({
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      password,
      role: role === "founder" ? "founder" : "admin",
      isFounder: Boolean(isFounder),
    });

    const token = issueToken(admin);
    res.status(201).json({
      message: "Admin created successfully",
      token,
      admin: sanitizeAdmin(admin),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create admin", error: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = issueToken(admin);

    res.status(200).json({
      message: "Admin logged in successfully",
      token,
      admin: sanitizeAdmin(admin),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to log in admin", error: error.message });
  }
};

export const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch admin", error: error.message });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const { password, ...updates } = req.body;

    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const admin = await Admin.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: "Failed to update admin", error: error.message });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete admin", error: error.message });
  }
};

export const getCurrentAdmin = (req, res) => {
  res.status(200).json({
    admin: sanitizeAdmin(req.admin),
  });
};

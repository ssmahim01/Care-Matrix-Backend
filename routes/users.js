// users related CRUD
import express from "express";
import { connectDB } from "../config/connectDB.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
const router = express.Router();
const saltRounds = 10;
import jwt from "jsonwebtoken";

// Hashing password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

// Initialize usersCollection
let usersCollection;
async function initCollection() {
  const collections = await connectDB();
  usersCollection = collections.users;
}
await initCollection();

// Post new user in db --->
router.post("/", async (req, res) => {
  const user = req.body;
  const password = user?.password;

  // If new user, handle password for non-social sign-ins
  let hashedPassword = null;
  if (password) {
    hashedPassword = await hashPassword(password);
  }
  // check if user is already exists--->
  const query = { email: user.email };
  const isExist = await usersCollection.findOne(query);
  if (isExist) {
    return res.send(isExist);
  }
  // if new user save data in db --->
  const result = await usersCollection.insertOne({
    role: "patient",
    ...user,
    ...(hashedPassword && { password: hashedPassword }),
  });
  res.send({
    data: result,
    message: "User Posted In DB Successfully",
  });
}); // Api endpoint -> /users

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const storedUserHash = user.password;
    if (!password || !storedUserHash) {
      return res.status(400).send({ message: "Password or hash missing!" });
    }

    const lockUntil = user.lockUntil || null;
    let failedAttempts = user.failedAttempts || 0;

    // Check if the account is locked
    if (lockUntil && lockUntil > Date.now()) {
      const minutesLeft = Math.ceil((lockUntil - Date.now()) / (60 * 1000));
      return res.status(403).send({
        message: `Too many failed attempts. Try again in ${minutesLeft} minutes.`,
        lockUntil,
      });
    }

    const isMatch = await bcrypt.compare(password, storedUserHash);
    if (!isMatch) {
      failedAttempts += 1;
      const updateData = { failedAttempts };

      // Lock the account after 4 failed attempts
      if (failedAttempts >= 4) {
        updateData.lockUntil = Date.now() + 15 * 60 * 1000;
      }

      await usersCollection.updateOne({ email }, { $set: updateData });
      return res.status(401).send({
        message: `Incorrect password. Attempts left: ${4 - failedAttempts}`,
        failedAttempts,
      });
    }

    // Reset failed attempts on successful login
    await usersCollection.updateOne(
      { email },
      { $set: { failedAttempts: 0, lockUntil: null } }
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).send({
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error during login" });
  }
});

// Get user role --->
router.get("/role/:email", async (req, res) => {
  const email = req.params.email;
  const result = await usersCollection.findOne({ email });
  res.send({ role: result?.role });
}); // Api endpoint -> /users/role/:email

// Fetch logged-in user's details
router.get("/me/:uid", async (req, res) => {
    const userId = req.params.uid;

    // Fetch user details from the users collection
    const user = await usersCollection.findOne({ uid: userId });

    if (!user) {
      return res.status(404).send({
        status: "error",
        message: "User not found",
      });
    }

    res.status(200).send({
      status: "success",
      data: user,
    });
}); // Api endpoint -> /users/me/:uid

// Get single user
router.get("/individual/:uid", async (req, res) => {
  const id = req.params.uid;
  const result = await usersCollection.findOne({ uid: id });
  res.send(result);
}); // Api endpoint -> /users/individual/:uid

// Get user phoneNumber --->
router.get("/phone/:uid", async (req, res) => {
  const uid = req.params.uid;
  const result = await usersCollection.findOne({ uid });
  res.send({ phoneNumber: result?.phoneNumber || null });
}); // Api endpoint -> /users/phone/:uid

// Retrieve lockUntil and failedAttempts data from DB
router.get("/lock-profile/:email", async (req, res) => {
  const email = req.params.email;
  const result = await usersCollection.findOne({ email });
  res.send({
    lockUntil: result?.lockUntil,
    failedAttempts: result?.failedAttempts,
  });
}); // Api endpoint -> /users/lock-profile/:email

// Update user lastLoginAt --->
router.patch("/last-login-at/:email", async (req, res) => {
  const email = req.params.email;
  const { lastLoginAt } = req.body;
  const filter = { email };
  const updatedUserInfo = {
    $set: {
      lastLoginAt: lastLoginAt,
    },
  };
  const result = await usersCollection.updateOne(filter, updatedUserInfo);
  res.send({ data: result, message: "lastLoginAt Time updated successfully" });
}); // Api endpoint -> /users/update-profile/:email

// Verify Password
router.post("/verify-password", async (req, res) => {
  const { uid, password } = req.body;
  const user = await usersCollection.findOne({ uid });

  if (!user) return res.status(404).send({ success: false });

  const isMatch = await bcrypt.compare(password, user.password);
  if (isMatch) {
    res.send({ success: true });
  }else {
    res.send({ success: false, message: "Incorrect current password" });
  }
}); // Api endpoint -> /users/verify-password


// update user profile route
router.put("/update-profile/:email", async (req, res) => {
  try {
    const email = req.params.email
    const { data, profileImage } = req.body

    if (!email || !data) {
      return res.status(400).json({ message: "Missing email or data" })
    }

    const updateData = {
      ...data,
    }
    if (profileImage) {
      updateData.profileImage = profileImage 
    }
    const result = await usersCollection.updateOne(
      { email },
      { $set: updateData }
    )
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("Error updating profile:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}) // API endpoint --> /users/update-profile/{value-->email}

// Update user name --->
router.patch("/update-name/:email", async (req, res) => {
  const email = req.params.email;
  const { name } = req.body;
  const filter = { email };
  const updatedUserInfo = {
    $set: {
      name: name,
    },
  };
  const result = await usersCollection.updateOne(filter, updatedUserInfo);
  res.send({ data: result, message: "Username updated successfully" });
}); // Api endpoint -> /users/update-name/:email

router.patch("/update-user-photo/:email", async (req, res) => {
  const email = req.params.email;
  const { photo } = req.body;
  const filter = { email };
  const updatedUserInfo = {
    $set: {
      photo: photo,
    },
  };
  const result = await usersCollection.updateOne(filter, updatedUserInfo);
  res.send({ data: result, message: "User Photo updated successfully" });
}); // Api endpoint -> /users/update-name/:email

// Update user photo --->
router.patch("/update-photo/:email", async (req, res) => {
  const email = req.params.email;
  const { data, profileImage } = req.body;
  const filter = { email };
  const updatedUserInfo = {
    $set: {
      name: data?.name,
      photo: profileImage,
      role: data?.role,
      phoneNumber: data?.phoneNumber,
    },
  };
  const result = await usersCollection.updateOne(filter, updatedUserInfo);
  res.send({ data: result, message: "User Photo updated successfully" });
}); // Api endpoint -> /users/update-photo/:email

// Update the role
router.patch("/convert-role/:email", async  (req, res) => {
  const email = req.params.email;
  const query = { email: email };

  const updateRole = {
    $set: { role: "doctor" },
  };

  const updateResult = await usersCollection.updateOne(query, updateRole);
  res.status(200).send({  message: "Updated the role", updateResult  });
}); // API endpoint -> /users/convert-role

// Convert to patient
router.patch("/convert-patient/:email", async (req, res) => {
  const email = req.params.email;
  const query = { email: email };

  const updateRole = {
    $set: { role: "patient" },
  };

  const updateResult = await usersCollection.updateOne(query, updateRole);
  res.status(200).send({ message: "Updated the role", updateResult });
}); // API endpoint -> /users/convert-patient

router.patch("/update-password/:uid", async (req, res) => {
  const { uid } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).send({ message: "New password is required" });
  }

  const bcryptPassword = await hashPassword(newPassword);
  const result = await usersCollection.updateOne(
    { uid },
    { $set: { password: bcryptPassword } }
  );

  if (result.matchedCount === 0) {
    return res.status(404).send({ message: "User not found" });
  }

  res
    .status(200)
    .send({ message: "Password updated in database", success: true });
}); // API endpoint -> /users/update-password/:uid

// ADMIN ONLY -> Get all users --->
router.get("/", async (req, res) => {
  const result = await usersCollection.find().toArray();
  res.send(
    result.map((item) => ({
      _id: item?._id,
      role: item?.role,
      name: item?.name,
      email: item?.email,
      photo: item?.photo,
      phoneNumber: item?.phoneNumber,
      createdAt: item?.createdAt,
      lastLoginAt: item?.lastLoginAt,
    }))
  );
}); // Api endpoint -> /users

// get users by search params by their name
router.get("/search-users", async (req, res) => {
  const search = req.query.name;
  if (!search) {
    return res.status(400).send({ message: "Missing 'name' query parameter." });
  }
  if (!search) {
    // Return all users if no search term is provided
    const allUsers = await usersCollection.find().toArray();
    return res.send(allUsers);
  }
  try {
    const result = await usersCollection
      .find({
        name: { $regex: search, $options: "i" },
      })
      .project({
        _id: 1,
        name: 1,
        email: 1,
        role: 1,
        photo: 1,
        phoneNumber: 1,
        createdAt: 1,
        lastLoginAt: 1,
      })
      .toArray();

    res.send(result);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).send({ message: "Failed to search users.", error });
  }
}); // Api endpoint -> /users/search-users?name={value}

// Delete user from db & firebase --->
router.delete("/delete-user/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  try {
    const user = await usersCollection.findOne(query);
    if (!user) {
      return res.status(404).send({ message: `User not found.` });
    }
    const result = await usersCollection.deleteOne(query);
    if (result.deletedCount === 0) {
      return res.status(500).send({ message: "Failed to delete user." });
    }
    res.send({
      message: `User: '${user.email}' deleted successfully!`,
    });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).send({
      error: "Failed to delete user.",
      details: err.message,
    });
  }
}); // Api endpoint -> /users/delete-user/:email

// update shopping discount
router.patch("/update-discount/:email", async (req, res) => {
  const email = req.params.email;
  // console.log(email);
  const { discount } = req.body;
  const filter = { email: email };

  const updatedDoc = {
    $set: {
      discountVoucher: parseInt(discount),
    },
  };
  try {
    const result = await usersCollection.updateOne(filter, updatedDoc);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to update discount" });
  }
});

router.get("/discount/:email", async (req, res) => {
  const email = req.params.email;
  const filter = { email: email };
  const result = await usersCollection.findOne(filter);
  res.send({ discountVoucher: result?.discountVoucher || null });
});

export default router;

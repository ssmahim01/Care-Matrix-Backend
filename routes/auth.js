// authentication and jwt related CRUD

import express from "express";
const router = express.Router();

router.post("/jwt", (req, res) => {
  res.send("JWT TOKEN GENERATED");
});
// Api endpoint -> /auth/jwt

router.post("/logout", (req, res) => {
  res.send("JWT TOKEN CLEARED");
});
// Api endpoint -> /auth/logout

export default router;

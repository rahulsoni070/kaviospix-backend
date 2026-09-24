const router = require("express").Router();
const passport = require("passport");
const generateToken = require("../utils/generateToken");

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`
  }),
  (req, res) => {
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
  }
);

module.exports = router;
const router = require("express").Router();
const { register, login, me, forgotPassword, resetPassword, verifyResetCode } = require("../controllers/authController");
const { auth } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);

router.use(auth);
router.get("/me", me);

module.exports = router;

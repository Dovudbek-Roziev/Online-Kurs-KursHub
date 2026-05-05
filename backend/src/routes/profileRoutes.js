const router = require("express").Router();
const { auth } = require("../middleware/auth");
const { getProfile, downloadCertificate, getMyPaymentMethods, addPaymentMethod, deleteMyPaymentMethod } = require("../controllers/profileController");

router.use(auth);
router.get("/", getProfile);
router.get("/certificate/:courseId", downloadCertificate);

router.get("/payment-methods", getMyPaymentMethods);
router.post("/payment-methods", addPaymentMethod);
router.delete("/payment-methods/:id", deleteMyPaymentMethod);

module.exports = router;

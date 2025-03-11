const express = require("express");
const {
  getAllPackages,
  postAllPackages,
  getSinglePackage,
  updatePackage,
  deletePackageById,
} = require("../controllers/packageController");
const router = express.Router();

router.get("/", getAllPackages);
router.post("/", postAllPackages);
router.get("/:id", getSinglePackage);
router.put("/:id", updatePackage);
router.delete("/:id", deletePackageById);

module.exports = router;

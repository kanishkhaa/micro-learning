const router = require("express").Router();
const Bite = require("../models/Bite");

// GET bites by category & subcategory
router.get("/", async (req, res) => {
  const { main, sub } = req.query;

  const bites = await Bite.find({
    mainCategory: main,
    subCategory: sub,
  });

  res.json(bites);
});

module.exports = router;

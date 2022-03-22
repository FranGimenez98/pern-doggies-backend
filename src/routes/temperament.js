const { Router } = require("express");
const { Temperament } = require("../db");
const axios = require("axios");
const { API_KEY } = process.env;
require("dotenv").config();

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const temperamentApi = await axios.get(
      `https://api.thedogapi.com/v1/breeds?api_key=${API_KEY}`
    );
    const mappedApi = await temperamentApi.data.map(r => {
      return {
        temperament: r.temperament,
      }
    });

    const temp = mappedApi.map(t => {
      return t.temperament;
    });
    const temperaments = temp.join(", ").split(", ");

    const unique = [...new Set(temperaments)];
    const ordered = [...unique].sort();

    ordered.forEach((t) => {
      if (t) {
        Temperament.findOrCreate({
          where: { name: t },
        });
      }
    });
    const allTemperaments = await Temperament.findAll();
    res.status(200).send(allTemperaments);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

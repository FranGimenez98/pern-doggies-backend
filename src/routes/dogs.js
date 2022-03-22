const { Router } = require("express");
const { Op } = require("sequelize");
const axios = require("axios");
const { Dog, Temperament } = require("../db");
const { API_KEY } = process.env;
require("dotenv").config();

const router = Router();

const getApiData = async () => {
  const apiData = await axios.get(
    `https://api.thedogapi.com/v1/breeds?api_key=${API_KEY}`
  );

  const apiInfo = await apiData.data.map((res) => {
    return {
      id: res.id,
      name: res.name,
      height: res.height.metric,
      weight: res.weight.metric,
      life_span: res.life_span,
      image_url: res.image.url,
      temperament: res.temperament,
      breed_group: res.breed_group,
    };
  });
  return apiInfo;
};

const getDbInfo = async () => {
  return await Dog.findAll({
    include: {
      model: Temperament,
      attributes: ["name"],
      through: {
        attributes: [],
      },
    },
  });
};

const allDogs = async () => {
  const dogsApi = await getApiData();
  const dogsDb = await getDbInfo();
  const allDogsInfo = [...dogsApi, ...dogsDb];

  return allDogsInfo;
};

router.get("/", async (req, res, next) => {
  const { name } = req.query;
  allDogs()
    .then((dogs) => {
      if (name) {
        let dogName = dogs.filter((res) =>
          res.name.toLowerCase().includes(name.toLowerCase())
        );
        dogName.length
          ? res.status(200).send(dogName)
          : res.status(400).send({ error: "Dog not found" });
      } else {
        res.status(200).send(dogs);
      }
    })
    .catch((error) => {
      next(error);
    });
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  allDogs()
    .then((dogs) => {
      if (id) {
        let breed = dogs.filter((res) => res.id == id);
        breed.length
          ? res.status(200).send(breed)
          : res.status(400).send({ error: "Breed not found" });
      }
    })
    .catch((error) => {
      next(error);
    });
});

router.post("/", async (req, res, next) => {
  try {
    let {
      name,
      height,
      weight,
      life_span,
      image_url,
      temperament,
      createdInDb,
    } = req.body;

    // Dog.create({
    //   name,
    //   height,
    //   weight,
    //   life_span,
    //   image_url,
    //   createdInDb,
    // })
    //   .then((createDog) => {
    //     Temperament.findAll({
    //       where: {
    //         name: temperament,
    //       },
    //     }).then((temp) => createDog.addTemperament(temp.id));
    //   })
    //   .then(() => res.json("Breed added correctly"));

    let createDog = await Dog.create({
      name,
      height,
      weight,
      life_span,
      image_url,
      createdInDb,
    });

    let temperamentDb = await Temperament.findAll({
      where: {name: temperament},
    })
    console.log(temperamentDb);
    createDog.addTemperament(temperamentDb);
    res.send("dog created successfully");
  } catch (error) {
    next(error);
  }
});

module.exports = router;

const { Router } = require('express');
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const dogsRouter = require('./dogs')
const dogsTemperament = require('./temperament');


const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);
router.use('/dogs', dogsRouter);
router.use('/temperament', dogsTemperament);

module.exports = router;

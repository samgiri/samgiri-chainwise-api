import express from 'express';
import swaggerUi from 'swagger-ui-express';
import openapiSpec from '../openapi.json';

const router = express.Router();

router.get('/openapi.json', (req, res) => {
  res.json(openapiSpec);
});

router.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

export default router;

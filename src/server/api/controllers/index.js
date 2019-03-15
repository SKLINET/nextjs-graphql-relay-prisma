import express from 'express';
import cacheController from './cache';

const router = express.Router();
router.use('/', cacheController);

export default router;

import express from 'express';
import moment from 'moment';

const router = express.Router();

router.get('/', (req, res) => res.send({ version: process.env.npm_package_version, now: moment().format() }));

export default router;

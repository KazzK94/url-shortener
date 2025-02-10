var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import { findUrl, insertUrl } from './urls.db';
const router = express.Router();
router.get('/', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ message: 'Please refer to GitHub documentation in order to learn how to use this API.' });
}));
router.post('/shorten', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({
            error: 'URL is required'
        });
    }
    try {
        const result = yield insertUrl(url);
        res.json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
}));
router.get('/:shortKey', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shortKey } = req.params;
        const url = yield findUrl(shortKey);
        res.redirect(url);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
}));
export default router;

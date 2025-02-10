var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { nanoid } from 'nanoid';
import { dbClient } from '../lib/mongodb.js';
export function insertUrl(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const shortKey = nanoid(7).replace(/\s/g, "");
            const data = {
                shortKey,
                targetUrl: url
            };
            const result = yield dbClient.db("url-shortener").collection("urls").insertOne(data);
            return {
                success: result.acknowledged,
                shortKey,
                targetUrl: url,
                shortUrl: `http://localhost:3000/${shortKey}`
            };
        }
        catch (error) {
            console.error(error);
            throw new Error('Something went wrong');
        }
    });
}
export function findUrl(shortKey) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield dbClient.db("url-shortener").collection("urls").findOne({ shortKey });
            return result === null || result === void 0 ? void 0 : result.targetUrl;
        }
        catch (error) {
            console.error(error);
            throw new Error('Something went wrong');
        }
    });
}

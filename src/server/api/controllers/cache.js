/* Clear cache */
import express from 'express';
import { prefetchData, clearCache } from '../lib/cache/CacheManager';

const router = express.Router();

router.get('/clear-cache/:origin', async (req, res) => {
    console.log('REQ /clear-cache/' + req.params.origin);
    console.time('CLEAR CACHE');
    await clearCache(req.params.origin);
    await prefetchData(req.params.origin);
    console.timeEnd('CLEAR CACHE');
    res.send('OK');
});

router.post('/webhooks/update-cache', async (req, res) => {
    try {
        if (req.body.secret === process.env.PRISMIC_WEBHOOK_SECRET && req.body.type === 'api-update') {
            console.time('UPDATE HOOK');
            await clearCache('prismic');
            await prefetchData('prismic');
            console.timeEnd('UPDATE HOOK');
        }
        res.send('OK');
    } catch (e) {
        if (!res.finished) {
            res.send('ERROR');
        }
    }
});

export default router;

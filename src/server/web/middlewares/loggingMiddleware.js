import { parseIpAddress } from '../../_utils/parseIpAddress';

export default (req, res, next) => {
    const oldWrite = res.write;
    const oldEnd = res.end;

    const chunks = [];

    res.write = (...restArgs) => {
        chunks.push(new Buffer(restArgs[0]));
        oldWrite.apply(res, restArgs);
    };

    res.end = (...restArgs) => {
        if (restArgs[0]) {
            chunks.push(new Buffer(restArgs[0]));
        }
        const body = Buffer.concat(chunks).toString('utf8');

        console.log('REQUEST / RESPONSE:\n', {
            time: new Date().toUTCString(),
            fromIP: parseIpAddress(req.clientIp),
            method: req.method,
            originalUri: req.originalUrl,
            uri: req.url,
            requestHeaders: req.headers,
            requestData: req.body,
            responseStatusCode: res.statusCode,
            responseHeaders: res.getHeaders(),
            responseData: body,
            referer: req.headers.referer || '',
            ua: req.headers['user-agent'],
        });

        oldEnd.apply(res, restArgs);
    };

    next();
};

export const basicAuthHandlerHandler = app => {
    let status = 401,
        message = 'Invalid credentials';

    const handle = function(req, res) {
        res.status(status);
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');

        return res.send({ message: message });
    };

    const middleware = function(req, res, next) {
        const auth = req.headers['authorization'];
        if (!auth) {
            return handle(req, res);
        } else {
            const tmp = auth.split(' ');
            const buf = new Buffer(tmp[1], 'base64');
            const plain_auth = buf.toString();

            const [username, password] = plain_auth.split(':');

            if (username !== 'bf' || password !== 'bot-factory2018') {
                return handle(req, res);
            }
        }
        next();
    };

    const inject = function(app) {
        app.use(middleware);
        return app;
    };

    return inject(app);
};

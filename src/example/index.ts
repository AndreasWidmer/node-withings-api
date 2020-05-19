import { WithingsApi } from '../index';

const app = require('express')();

const port = 3999;

module.exports = (cb) => {
    const callbackUrl = 'http://localhost:3999/oauth_callback';

    app.listen(port, (err) => {
        if (err) return console.error(err);

        console.log(`Express server listening at http://localhost:${port}`);

        return cb({
            app,
            callbackUrl,
        });
    });


    const withingsApi = new WithingsApi();

    app.get('/auth', (req, res) => {
        res.redirect(withingsApi.getAuthorizationUri());
    });


    app.get('/oauth_callback', async (req, res) => {
        await withingsApi.handleCallback(req.body.code);
    });


    app.get('/', (req, res) => {
        res.send('<a href="/auth">Log in with Withings</a>');
    });

};

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



    app.get('/auth', (req, res) => {
        res.redirect(authorizationUri);
    });


    app.get('/', (req, res) => {
        res.send('<a href="/auth">Log in with Withings</a>');
    });

};

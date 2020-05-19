const oauth = require('simple-oauth2');
const createApplication = require('./example');
import axios from 'axios';


export class WithingsApi {

    private config = {
        redirect_uri: 'http://localhost:3999/oauth_callback',
        scope: 'user.info,user.metrics',
        state: 'super',
    }

    private credentials = {
        client: {
            id: '244d6b75e57c240698647daa6a0075e87080b1f90b9247eaf9e477f98343a068',
            secret: 'aeb543a8f1c770ed82cd4388ebc7361ff576aec6abe2539242eced5eecf6ca19',
        },
        auth: {
            tokenHost: 'https://account.withings.com/',
            tokenPath: 'oauth2/token',
            authorizePath: 'oauth2_user/authorize2',
        },
        options: {
            authorizationMethod: 'body',
        },
    };

    public withingsApi = oauth.create(this.credentials);


    public getAuthorizationUri = () => {
        return this.withingsApi.authorizationCode.authorizeURL(this.config);
    }

}




createApplication(({app, callbackUrl}) => {




    app.get('/oauth_callback', async (req, res) => {
        const {code} = req.query;
        const options = {
            code,
            redirect_uri: callbackUrl,
        };
        console.log('Got the code: ', code);

        try {
            const result = await oauth2.authorizationCode.getToken(options);

            console.log('The resulting token: ', result);

            let token = oauth2.accessToken.create(result);
            if (token.expired()) {
                try {
                    const params = {
                        scope: 'user.info,user.metrics',
                    };

                    token = await token.refresh(params);
                } catch (error) {
                    console.log('Error refreshing access token: ', error.message);
                }
            }
            const bearer = {
                headers: {Authorization: `Bearer ${result.access_token}`},
            };

            const user = await axios.get('https://wbsapi.withings.net/v2/user?action=getdevice', bearer);
            const meas = await axios.get('https://wbsapi.withings.net/measure?action=getmeas', bearer);

            return res.status(200).json({user: user.data.body.devices, meas: meas.data.body});
        } catch (error) {
            console.error('Access Token Error');
            console.error(error);
            return res.status(500).json('Authentication failed');
        }
    });

});

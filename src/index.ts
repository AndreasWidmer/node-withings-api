const oauth = require('simple-oauth2');
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

    public handleCallback = async (code) => {

        // check if token in localstorage
        // if, check if refresh is needed


        // else, get a new token

        const options = {
            code,
            redirect_uri: this.config.redirect_uri,
        };
        console.log('Got the code: ', code);

        try {
            const result = await this.withingsApi.authorizationCode.getToken(options);

            console.log('The resulting token: ', result);

            let token = this.withingsApi.accessToken.create(result);

            axios.defaults.headers.common = {'Authorization': `Bearer ${token}`}

            const meas = await axios.get('https://wbsapi.withings.net/measure?action=getmeas');

            return meas.data.body;
        } catch (error) {
            console.error('Access Token Error');
            console.error(error);
            return Promise.reject(error);
        }
    }

    public getDevices = async () => {
        const user = await axios.get('https://wbsapi.withings.net/v2/user?action=getdevice');

    }

    private checkTokenExpiry = async (token) => {
        if (token.expired()) {
            try {
                const params = {
                    scope: 'user.info,user.metrics',
                };

                return await token.refresh(params);
            } catch (error) {
                console.log('Error refreshing access token: ', error.message);
            }
        }
    }

}

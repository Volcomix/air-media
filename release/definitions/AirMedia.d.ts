declare module "air-media" {
    
    import Q = require('q');    
    class AirMedia {    
        private _appId;    
        private _appName;    
        private _appVersion;    
        private static freeboxHost;    
        private static tokensDir;    
        private _baseUrl;    
        private _appToken;    
        private _trackId;    
        private _challenge;    
        private _sessionToken;    
        private _permissions;    
        appId: string;    
        appName: string;    
        appVersion: string;    
        baseUrl: string;    
        appTokenFile: string;    
        appToken: string;    
        trackId: number;    
        challenge: string;    
        sessionToken: string;    
        permissions: any;    
        constructor(_appId: string, _appName: string, _appVersion: string);    
        openSession(password: string, algorithm?: string): Q.Promise<AirMedia>;    
        closeSession(): Q.Promise<AirMedia>;    
        private discover();    
        private authorize(password, algorithm);    
        private trackAuthorization();    
        private getChallenge();    
        private getResult(response, body);    
    }    
    export = AirMedia;    
    
}
declare module "air-media" {
    
    import Q = require('q');    
    class AirMedia {    
        private appId;    
        private appName;    
        private appVersion;    
        private static freeboxHost;    
        private _baseUrl;    
        private _appToken;    
        private _trackId;    
        private _challenge;    
        private _sessionToken;    
        private _permissions;    
        baseUrl: string;    
        appToken: string;    
        trackId: number;    
        challenge: string;    
        sessionToken: string;    
        permissions: any;    
        constructor(appId: string, appName: string, appVersion: string);    
        discover(): Q.Promise<AirMedia>;    
        authorize(): Q.Promise<AirMedia>;    
        trackAuthorization(): Q.Promise<AirMedia>;    
        openSession(): Q.Promise<AirMedia>;    
        closeSession(): Q.Promise<AirMedia>;    
        private getResult(response, body);    
    }    
    export = AirMedia;    
    
}
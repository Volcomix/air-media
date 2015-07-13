declare module "air-media" {
    
    import Q = require('q');    
    class AirMedia {    
        private static freeboxHost;    
        private _baseUrl;    
        private _appToken;    
        private _trackId;    
        private _challenge;    
        baseUrl: string;    
        appToken: string;    
        trackId: number;    
        challenge: string;    
        discover(): Q.Promise<AirMedia>;    
        authorize(): Q.Promise<AirMedia>;    
    }    
    export = AirMedia;    
    
}
declare module "air-media" {
    
    import Q = require('q');    
    import Login = require('./Login');    
    class AirMedia extends Login {    
        getReceivers(): Q.Promise<AirMedia.Receivers>;    
        startVideo(url: string): Q.Promise<AirMedia>;    
        stopVideo(): Q.Promise<AirMedia>;    
    }    
    module AirMedia {    
        interface Receivers {    
            [index: number]: {    
                name: string;    
                capabilities: {    
                    photo: boolean;    
                    audio: boolean;    
                    video: boolean;    
                    screen: boolean;    
                };    
                passwordProtected: boolean;    
            };    
        }    
    }    
    export = AirMedia;    
    
}
export type Touch={source:string;medium:string;campaign:string;content:string;term:string;referrer:string;landingPage:string;timestamp:string;fbclid:string;gclid:string;wbraid:string;gbraid:string;ttclid:string};
export type TrafficType='paid'|'organic'|'direct'|'referral'|'unknown';
export type TrafficChannel='meta_ads'|'google_ads'|'tiktok_ads'|'organic_search'|'organic_social'|'direct'|'referral'|'other';
export type Stored={v:1;firstTouch:Touch;lastTouch:Touch};

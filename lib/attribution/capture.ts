import type {Touch} from './types';
import {hostOf} from './classify';
export function capture(url:string,referrer:string,now=new Date()):Touch{
 const u=new URL(url),g=(k:string)=>(u.searchParams.get(k)||'').slice(0,200);
 const own=u.hostname.replace(/^www\./,'');const rh=hostOf(referrer);
 return {source:g('utm_source'),medium:g('utm_medium'),campaign:g('utm_campaign'),content:g('utm_content'),term:g('utm_term'),
  referrer:rh&&rh!==own?referrer.slice(0,500):'',landingPage:(u.pathname+u.search).slice(0,500),timestamp:now.toISOString(),
  fbclid:g('fbclid'),gclid:g('gclid'),wbraid:g('wbraid'),gbraid:g('gbraid'),ttclid:g('ttclid')};
}
export function hasSignal(t:Touch){return !!(t.source||t.medium||t.campaign||t.fbclid||t.gclid||t.wbraid||t.gbraid||t.ttclid||t.referrer)}

import type {Touch,TrafficChannel,TrafficType} from './types';
const PAID=/(cpc|ppc|paid|cpm|cpv|display|paidsocial|paid_social|ads?$)/i;
const SEARCH=/(^|\.)(google|bing|yahoo|duckduckgo|baidu|coccoc|yandex|ecosia)\./i;
const SOCIAL=/(facebook|fb|instagram|ig|meta|tiktok|youtube|twitter|x\.com|t\.co|linkedin|pinterest|zalo|threads|reddit)/i;
const META=/^(facebook|fb|instagram|ig|meta|m\.facebook|l\.facebook)/i;
export function hostOf(ref:string){try{return new URL(ref).hostname.replace(/^www\./,'')}catch{return ''}}
export function classify(t:Partial<Touch>):{trafficType:TrafficType;trafficChannel:TrafficChannel}{
 const src=(t.source||'').toLowerCase(),med=(t.medium||'').toLowerCase(),host=hostOf(t.referrer||'');
 const paidUtm=PAID.test(med)||!!(t.campaign&&PAID.test(med));
 const r=(type:TrafficType,ch:TrafficChannel)=>({trafficType:type,trafficChannel:ch});
 if(t.gclid||t.wbraid||t.gbraid) return r('paid','google_ads');
 if(t.ttclid) return r('paid','tiktok_ads');
 if(paidUtm){
  if(META.test(src)||t.fbclid) return r('paid','meta_ads');
  if(src.startsWith('google')) return r('paid','google_ads');
  if(src.startsWith('tiktok')) return r('paid','tiktok_ads');
  return r('paid','other');
 }
 if(t.fbclid&&t.campaign&&/(paid|ads?|cpc)/i.test(t.campaign)) return r('paid','meta_ads');
 if(src||med){
  if(/organic|seo/.test(med)||SEARCH.test(src+'.')&&!med) return r('organic','organic_search');
  if(/social/.test(med)||SOCIAL.test(src)) return r('organic','organic_social');
  if(/email|referral/.test(med)) return r('referral','referral');
  return r('unknown','other');
 }
 if(t.fbclid) return r('organic','organic_social');
 if(host){
  if(SEARCH.test(host)) return r('organic','organic_search');
  if(SOCIAL.test(host)) return r('organic','organic_social');
  return r('referral','referral');
 }
 return r('direct','direct');
}

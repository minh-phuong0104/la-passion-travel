declare global{interface Window{gtag?:(...a:unknown[])=>void;fbq?:(...a:unknown[])=>void}}
const fired=new Set<string>();
export function track(name:string,params:Record<string,string|number|boolean>={},once?:string){
 if(typeof window==='undefined') return;
 if(once){if(fired.has(once)) return;fired.add(once)}
 window.gtag?.('event',name,params);
}
/** Call ONLY after the backend confirmed the lead. Deduped per submission. */
export function trackLeadSuccess(submissionId:string,p:{traffic_type:string;traffic_channel:string;journey_duration:string;companion_type:string}){
 if(fired.has('lead:'+submissionId)) return;fired.add('lead:'+submissionId);
 window.gtag?.('event','generate_lead',p);window.gtag?.('event','lead_submit_success',p);window.gtag?.('event','journey_completed',p);
 window.fbq?.('track','Lead');
}

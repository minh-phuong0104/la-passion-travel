import {NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
import {normalize,validateLead,classifyPayload} from '@/lib/leads/validate';
export const runtime='nodejs';
const fail=(error:string,status:number,extra:object={})=>NextResponse.json({success:false,error,...extra},{status});
export async function POST(req:Request){
 let body:unknown;try{body=await req.json()}catch{return fail('Invalid request data.',400)}
 const p=normalize(body);const errs=validateLead(p);
 if(Object.keys(errs).length) return fail('Please check the information you entered.',422,{fields:errs});
 const url =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const key =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key){console.error('[leads] Supabase env missing');return fail('We could not submit your request right now. Please try again shortly.',503)}
 const db=createClient(url,key,{auth:{persistSession:false}});
 const c=classifyPayload(p),f=p.firstTouch,l=p.lastTouch;
 const row={submission_id:p.submissionId,full_name:p.fullName,email:p.email||null,phone:p.phone,country_code:p.countryCode,
  destinations:p.destinations,duration:p.duration,travel_date:p.travelDate,custom_duration:p.customDuration,companion_type:p.companion,traveler_count:p.travelerCount,
  experiences:p.experiences,travel_pace:p.pace,budget:p.budget,special_requests:p.specialRequests,traffic_type:c.trafficType,traffic_channel:c.trafficChannel,
  utm_source:f.source,utm_medium:f.medium,utm_campaign:f.campaign,utm_content:f.content,utm_term:f.term,fbclid:f.fbclid,gclid:f.gclid,wbraid:f.wbraid,gbraid:f.gbraid,ttclid:f.ttclid,
  first_touch:f,last_touch:l,first_touch_source:f.source,first_touch_medium:f.medium,first_touch_campaign:f.campaign,first_touch_content:f.content,first_touch_term:f.term,
  first_touch_landing_page:f.landingPage,first_touch_referrer:f.referrer,first_touch_timestamp:f.timestamp,
  last_touch_source:l.source,last_touch_medium:l.medium,last_touch_campaign:l.campaign,last_touch_content:l.content,last_touch_term:l.term,last_touch_referrer:l.referrer,last_touch_timestamp:l.timestamp,
  landing_page:f.landingPage,referrer:f.referrer,user_agent:(req.headers.get('user-agent')||'').slice(0,300)};
 const {data,error}=await db.from('leads').insert(row).select('id').single();
 let leadId=data?.id as string|undefined;
 if(error){
  if(error.code==='23505'){ // duplicate submission_id -> idempotent success
   const ex=await db.from('leads').select('id').eq('submission_id',p.submissionId).single();
   if(ex.data) return NextResponse.json({success:true,leadId:ex.data.id,submissionId:p.submissionId,duplicate:true});
  }
  console.error('[leads] insert failed',error.code,error.message);
  return fail('We could not submit your request right now. Please try again shortly.',500);
 }
 const hook=process.env.LEAD_WEBHOOK_URL;
 if(hook){try{const r=await fetch(hook,{method:'POST',headers:{'content-type':'application/json','x-webhook-secret':process.env.LEAD_WEBHOOK_SECRET||''},body:JSON.stringify({leadId,...row}),signal:AbortSignal.timeout(5000)});
  if(!r.ok) console.error('[leads] webhook status',r.status)}catch(e){console.error('[leads] webhook failed',String(e))}}
 return NextResponse.json({success:true,leadId,submissionId:p.submissionId});
}

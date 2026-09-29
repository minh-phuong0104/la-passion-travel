import {describe,it,expect} from 'vitest';
import {capture} from '@/lib/attribution/capture';import {classify} from '@/lib/attribution/classify';import {merge} from '@/lib/attribution/storage';
import {normalize,validateLead} from '@/lib/leads/validate';
const B='https://lapassion.travel/';const t=(q:string,ref='')=>capture(B+q,ref);
describe('classification',()=>{
 it('meta paid',()=>{const x=t('?utm_source=facebook&utm_medium=paid_social&utm_campaign=vietnam_2026&utm_content=halong_video&fbclid=test123');expect(classify(x)).toEqual({trafficType:'paid',trafficChannel:'meta_ads'});expect(x.campaign).toBe('vietnam_2026')});
 it('google paid',()=>expect(classify(t('?utm_source=google&utm_medium=cpc&utm_campaign=vietnam_search&gclid=test456'))).toEqual({trafficType:'paid',trafficChannel:'google_ads'}));
 it('gclid only',()=>expect(classify(t('?gclid=x')).trafficChannel).toBe('google_ads'));
 it('tiktok paid',()=>expect(classify(t('?utm_source=tiktok&utm_medium=paid&ttclid=1')).trafficChannel).toBe('tiktok_ads'));
 it('google organic',()=>expect(classify(t('','https://www.google.com/'))).toEqual({trafficType:'organic',trafficChannel:'organic_search'}));
 it('facebook organic',()=>expect(classify(t('','https://l.facebook.com/'))).toEqual({trafficType:'organic',trafficChannel:'organic_social'}));
 it('direct',()=>expect(classify(t(''))).toEqual({trafficType:'direct',trafficChannel:'direct'}));
 it('referral',()=>expect(classify(t('','https://blog.example.org/x'))).toEqual({trafficType:'referral',trafficChannel:'referral'}));
 it('internal referrer ignored',()=>expect(t('journey','https://lapassion.travel/').referrer).toBe(''));
});
describe('first touch',()=>{
 it('stays Meta Paid after internal navigation',()=>{
  const s1=merge(null,t('?utm_source=facebook&utm_medium=paid_social&fbclid=a'));
  const s2=merge(s1,t('journey','https://lapassion.travel/'));const s3=merge(s2,t('journey'));
  expect(classify(s3.firstTouch).trafficChannel).toBe('meta_ads');expect(classify(s3.lastTouch).trafficChannel).toBe('meta_ads');});
 it('last touch updates on new campaign, first does not',()=>{
  const s1=merge(null,t('?utm_source=facebook&utm_medium=paid_social'));const s2=merge(s1,t('?utm_source=google&utm_medium=cpc'));
  expect(s2.firstTouch.source).toBe('facebook');expect(s2.lastTouch.source).toBe('google');});
});
describe('validation',()=>{
 it('rejects invalid',()=>expect(Object.keys(validateLead(normalize({phone:'111'}))).length).toBeGreaterThan(3));
 it('accepts valid',()=>expect(validateLead(normalize({submissionId:'abcdefgh1',fullName:'Nguyen Van A',phone:'912345678',countryCode:'+84',consent:true}))).toEqual({}));
});

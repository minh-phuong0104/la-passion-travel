import type {Stored,Touch} from './types';
import {capture,hasSignal} from './capture';
export const KEY='lp_attribution_v1';
/** Pure merge: first touch is write-once; last touch only changes on a visit that carries a marketing signal. */
export function merge(stored:Stored|null,incoming:Touch):Stored{
 if(!stored) return {v:1,firstTouch:incoming,lastTouch:incoming};
 return {v:1,firstTouch:stored.firstTouch,lastTouch:hasSignal(incoming)?incoming:stored.lastTouch};
}
export function load():Stored|null{try{const s=JSON.parse(localStorage.getItem(KEY)||'null');return s?.v===1?s:null}catch{return null}}
export function initAttribution():Stored{
 const m=merge(load(),capture(location.href,document.referrer));
 try{localStorage.setItem(KEY,JSON.stringify(m))}catch{}
 return m;
}

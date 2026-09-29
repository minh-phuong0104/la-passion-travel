'use client';
import {useEffect} from 'react';
import {initAttribution} from '@/lib/attribution/storage';
import {track} from '@/lib/analytics/events';
export default function AnalyticsInit(){useEffect(()=>{initAttribution();track('landing_view',{},'landing')},[]);return null}

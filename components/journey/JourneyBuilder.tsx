"use client";

import Image from "next/image";

import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import {

  DEST,

  DUR,

  COMP,

  EXP,

  PACE,

  BUDGET,

} from "@/lib/journey-config";

import { initAttribution } from "@/lib/attribution/storage";

import { classify } from "@/lib/attribution/classify";

import { track, trackLeadSuccess } from "@/lib/analytics/events";

import { normalize, validateLead } from "@/lib/leads/validate";

/* =========================================================

   CONFIG

========================================================= */

const KEY = "lp_journey_en_v2";

const TOTAL = 5;

/* =========================================================

   JOURNEY STATE

========================================================= */

const init = {

  destinations: [] as string[],

  duration: "",

  travelDate: "",

  customDuration: "",

  companion: "",

  travelerCount: 1,

  experiences: [] as string[],

  pace: "",

  budget: "",

  specialRequests: "",

  submissionId: "",

};

type J = typeof init;

/* =========================================================

   DESTINATION IMAGES

========================================================= */

const DESTINATION_IMAGES: Record<string, string> = {

  "Northern Vietnam": "/images/journey/mien-bac.jpg",

  "Central Vietnam": "/images/journey/mien-trung.jpg",

  "Northwestern Vietnam": "/images/journey/mien-tay-bac.jpg",

  "Southern Vietnam": "/images/journey/mien-nam.jpg",

  "Across Vietnam": "/images/journey/xuyen-viet.jpg",

};

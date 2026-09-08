"use client";

import { useSearchParams } from "next/navigation";

export function useUtmParams() {
  const searchParams = useSearchParams();
  return {
    utmSource: searchParams.get("utm_source") || null,
    utmMedium: searchParams.get("utm_medium") || null,
    utmCampaign: searchParams.get("utm_campaign") || null,
  };
}
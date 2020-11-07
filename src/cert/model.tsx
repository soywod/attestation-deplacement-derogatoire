import {DateTime} from "luxon";

import {Profile, emptyPrimaryProfile} from "../profile";
import {ReasonKey} from "../reasons";

export type Certificate = {
  profile: Profile;
  reasons: ReasonKey[];
  path?: string;
  createdAt: string;
  leaveAt: string;
};

export const emptyCert: () => Certificate = () => {
  const now = DateTime.local().set({millisecond: 0}).toISO();

  return {
    profile: emptyPrimaryProfile(),
    reasons: [],
    createdAt: now,
    leaveAt: now,
  };
};

export function stringifyReasons(cert: Certificate): string {
  return cert.reasons.join(", ").replace("_", "/");
}

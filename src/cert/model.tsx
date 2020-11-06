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

export const emptyCert: () => Certificate = () => ({
  profile: emptyPrimaryProfile(),
  reasons: [],
  createdAt: DateTime.local().toISO(),
  leaveAt: DateTime.local().toISO(),
});

export function stringifyReasons(cert: Certificate): string {
  return cert.reasons.join(", ").replace("_", "/");
}

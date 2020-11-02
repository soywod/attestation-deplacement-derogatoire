type ProfileBase = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  address: string;
  city: string;
  zip: string;
};

export type PrimaryProfile = ProfileBase & {
  isReady: boolean;
};

export type SecondaryProfile = ProfileBase & {
  label: string;
};

export type Profile = PrimaryProfile | SecondaryProfile;

export const emptyPrimaryProfile: () => PrimaryProfile = () => ({
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  placeOfBirth: "",
  address: "",
  city: "",
  zip: "",
  isReady: false,
});

export const emptySecondaryProfile: () => SecondaryProfile = () => ({
  label: "",
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  placeOfBirth: "",
  address: "",
  city: "",
  zip: "",
});

export function isPrimaryProfile(profile: Profile): profile is PrimaryProfile {
  return "isReady" in profile && typeof profile.isReady === "boolean";
}

export function isSecondaryProfile(profile: Profile): profile is SecondaryProfile {
  return !isPrimaryProfile(profile);
}

export function isProfileValid(profile?: Profile) {
  if (!profile) return false;
  if (isSecondaryProfile(profile) && !profile.label) return false;
  if (!profile.firstName) return false;
  if (!profile.lastName) return false;
  if (!profile.dateOfBirth) return false;
  if (!profile.placeOfBirth) return false;
  if (!profile.address) return false;
  if (!profile.city) return false;
  if (!profile.zip) return false;

  return true;
}

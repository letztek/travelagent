export interface GooglePlaceLocation {
  latitude: number;
  longitude: number;
}

export interface GooglePlaceLocalizedText {
  text: string;
  languageCode: string;
}

export interface GooglePlacePeriod {
  open: {
    day: number;
    hour: number;
    minute: number;
  };
  close?: {
    day: number;
    hour: number;
    minute: number;
  };
}

export interface GooglePlaceOpeningHours {
  openNow?: boolean;
  periods?: GooglePlacePeriod[];
  weekdayDescriptions?: string[];
}

export interface GooglePlaceResult {
  id: string;
  formattedAddress?: string;
  location?: GooglePlaceLocation;
  regularOpeningHours?: GooglePlaceOpeningHours;
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  displayName?: GooglePlaceLocalizedText;
  types?: string[];
  primaryType?: string;
}

export interface GoogleDistanceMatrixResponse {
  status: string;
  origin_addresses: string[];
  destination_addresses: string[];
  rows: {
    elements: {
      status: string;
      duration: {
        value: number;
        text: string;
      };
      distance: {
        value: number;
        text: string;
      };
    }[];
  }[];
}

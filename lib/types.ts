export interface NewsItem {
  title: string;
  url: string;
  source: string;
  time: string;
  category: string;
  image?: string;
}

export interface ApodData {
  date: string;
  explanation: string;
  media_type: "image" | "video" | string;
  title: string;
  url: string;
  hdurl?: string;
  thumbnail_url?: string;
  copyright?: string;
}

export interface NasaNeoFeedResponse {
  near_earth_objects?: Record<string, NasaNeoObject[]>;
}

export interface NasaNeoObject {
  id: string;
  name: string;
  is_potentially_hazardous_asteroid: boolean;
  estimated_diameter?: {
    meters?: {
      estimated_diameter_max?: number;
    };
  };
  close_approach_data?: Array<{
    miss_distance?: {
      kilometers?: string;
    };
    relative_velocity?: {
      kilometers_per_hour?: string;
    };
  }>;
}

export interface DonkiFlareEvent {
  flrID: string;
  classType?: string;
  beginTime?: string;
  link?: string;
}

export interface DonkiGeomagneticStormEvent {
  gstID: string;
  startTime?: string;
  link?: string;
  allKpIndex?: Array<{
    kpIndex?: number;
    observedTime?: string;
  }>;
}

export interface MarsPhoto {
  id: number;
  img_src: string;
  earth_date: string;
  sol: number;
  camera: {
    name: string;
    full_name: string;
  };
  rover: {
    name: string;
  };
}

export interface PeopleInSpaceResponse {
  message: string;
  number: number;
  people: Array<{
    craft: string;
    name: string;
  }>;
}

export interface LaunchStatus {
  abbrev?: string;
}

export interface LaunchProvider {
  name?: string;
}

export interface LaunchRocket {
  configuration?: {
    name?: string;
  };
}

export interface LaunchPad {
  location?: {
    name?: string;
  };
}

export interface LaunchMission {
  description?: string;
}

export interface LaunchVideo {
  url?: string;
}

export interface LaunchItem {
  id: string;
  name: string;
  net?: string;
  status?: LaunchStatus;
  launch_service_provider?: LaunchProvider;
  rocket?: LaunchRocket;
  pad?: LaunchPad;
  mission?: LaunchMission;
  webcast_live?: boolean;
  vidURLs?: LaunchVideo[];
}

export interface LaunchResponse {
  results?: LaunchItem[];
}

export interface StockApiQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  previousClose: number;
  sparkline: number[];
}

export interface VideoFeedItem {
  id: string;
  channel: string;
  title: string;
  url: string;
  thumbnail: string;
  publishedAt: string;
  topic?: string;
}

export interface GitHubActivityItem {
  id: string;
  type: string;
  repo: string;
  action: string;
  url: string;
  createdAt: string;
  icon: string;
  detail?: string;
}

export interface GitHubProfileSummary {
  login: string;
  publicRepos: number;
  followers: number;
  following: number;
  htmlUrl: string;
}

export interface IssPosition {
  latitude: number;
  longitude: number;
  velocity: number;
  altitude: number;
}

export interface RainViewerFrame {
  path: string;
  time: number;
}

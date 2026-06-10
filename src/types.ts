export type OifCountryId =
  | "france"
  | "canada"
  | "belgique"
  | "roumanie"
  | "suisse"
  | "maroc"
  | "senegal"
  | "madagascar"
  | "tunisie"
  | "vietnam";

export interface CountryMetadata {
  id: OifCountryId;
  nameVi: string;
  nameFr: string;
  flag: string;
  capital: string;
  language: string;
  population: string;
  monuments: string;
  funFact: string;
  descriptionVi: string;
  descriptionFr: string;
  coordinates: { top: string; left: string }; // Position on our visual world map
  imageBackground: string;
  challengeTitle: string;
  challengeScenarioVi: string;
  challengeScenarioFr: string;
}

export interface PlayerCharacter {
  name: string;
  avatarUrl: string;
  title: string; // e.g. "Ambassadeur Culturel", "Attaché d'Espoir", "Explorateur de Paix"
  gender: "ambassador" | "attaché" | "explorer";
  userId?: number; // DB user ID (0 if offline/DB unavailable)
}

export interface StampProgress {
  countryId: OifCountryId;
  unlocked: boolean;
  score: number; // 0 to 100, if completed perfectly they get max score
  completedAt?: string;
  bonusEarned: boolean;
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

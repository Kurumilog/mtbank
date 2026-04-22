export type AuthMode = "login" | "register";

export type Profile = {
  id: string;
  login: string;
  full_name: string;
  avatar_seed: string;
};

export type Account = {
  id: string;
  title: string;
  balance: number;
  currency: string;
};

export type Card = {
  id: string;
  title: string;
  masked_pan: string;
  expires_at: string;
  balance: number;
  currency: string;
};

export type Transaction = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  currency: string;
  icon_key: string;
};

export type PromoBanner = {
  id: string;
  title: string;
  subtitle: string;
  tone: "primary" | "neutral";
  sort_order: number;
};

export type HomeData = {
  profile: Profile;
  account: Account;
  cards: Card[];
  transactions: Transaction[];
  promoBanners: PromoBanner[];
};

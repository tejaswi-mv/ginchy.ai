export interface GINCHYPackage {
  id: string;
  name: string;
  tier: 'standard' | 'pro' | 'premium';
  price: number; // in cents
  monthlyCredits: number;
  maxModels: number;
  maxVideos: number;
  features: {
    hasUpscaling: boolean;
    hasBatchProcessing: boolean;
    hasAPI: boolean;
    hasPrioritySupport: boolean;
    hasClothingAI: boolean;
    hasVideoGeneration: boolean;
    hasCharacterTraining: boolean;
  };
  limits: {
    maxImageGenerations: number;
    maxVideoGenerations: number;
    maxUpscales: number;
    maxClothingApplications: number;
  };
}

export const GINCHY_PACKAGES: Record<string, GINCHYPackage> = {
  standard: {
    id: 'standard',
    name: 'Standard',
    tier: 'standard',
    price: 2900, // $29/month
    monthlyCredits: 100,
    maxModels: 5,
    maxVideos: 10,
    features: {
      hasUpscaling: false,
      hasBatchProcessing: false,
      hasAPI: false,
      hasPrioritySupport: false,
      hasClothingAI: true,
      hasVideoGeneration: true,
      hasCharacterTraining: true,
    },
    limits: {
      maxImageGenerations: 100,
      maxVideoGenerations: 10,
      maxUpscales: 0,
      maxClothingApplications: 50,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    tier: 'pro',
    price: 7900, // $79/month
    monthlyCredits: 300,
    maxModels: 20,
    maxVideos: 50,
    features: {
      hasUpscaling: true,
      hasBatchProcessing: true,
      hasAPI: false,
      hasPrioritySupport: true,
      hasClothingAI: true,
      hasVideoGeneration: true,
      hasCharacterTraining: true,
    },
    limits: {
      maxImageGenerations: 300,
      maxVideoGenerations: 50,
      maxUpscales: 100,
      maxClothingApplications: 150,
    },
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    tier: 'premium',
    price: 19900, // $199/month
    monthlyCredits: 1000,
    maxModels: 100,
    maxVideos: 200,
    features: {
      hasUpscaling: true,
      hasBatchProcessing: true,
      hasAPI: true,
      hasPrioritySupport: true,
      hasClothingAI: true,
      hasVideoGeneration: true,
      hasCharacterTraining: true,
    },
    limits: {
      maxImageGenerations: 1000,
      maxVideoGenerations: 200,
      maxUpscales: 500,
      maxClothingApplications: 500,
    },
  },
};

export function getPackageByTier(tier: string): GINCHYPackage | null {
  return GINCHY_PACKAGES[tier] || null;
}

export function getAllPackages(): GINCHYPackage[] {
  return Object.values(GINCHY_PACKAGES);
}

export function canUserAccessFeature(
  userPackage: GINCHYPackage,
  feature: keyof GINCHYPackage['features']
): boolean {
  return userPackage.features[feature];
}

export function getRemainingCredits(
  userPackage: GINCHYPackage,
  usedCredits: number
): number {
  return Math.max(0, userPackage.monthlyCredits - usedCredits);
}

export function canUserPerformAction(
  userPackage: GINCHYPackage,
  action: keyof GINCHYPackage['limits'],
  currentUsage: number
): boolean {
  const limit = userPackage.limits[action];
  return currentUsage < limit;
}
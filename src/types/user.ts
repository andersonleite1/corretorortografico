export interface Subscription {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  stripeCurrentPeriodEnd?: Date | null;
  status: string;
  plan: string;
}

export interface User {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  clerkId: string;
  email: string;
  name?: string | null;
  imageUrl?: string | null;
  stripeCustomerId?: string | null;
  subscription?: Subscription | null;
}

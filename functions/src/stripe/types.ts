/**
 * Tipos e interfaces para integração Stripe
 */

import * as admin from 'firebase-admin';

export interface DoctorPlanData {
  plan: 'free' | 'pro';
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripeSubscriptionStatus?: string | null;
  subscriptionCancelAt?: admin.firestore.Timestamp | null;
  planUpdatedAt?: admin.firestore.FieldValue | admin.firestore.Timestamp;
  lastPaymentAt?: admin.firestore.FieldValue | admin.firestore.Timestamp;
}

export type PlanStatus = 'free' | 'pro';
export type SubscriptionStatus = 'active' | 'cancel_at_period_end' | 'canceled' | 'past_due' | 'unpaid';

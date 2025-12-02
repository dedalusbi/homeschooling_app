export interface User {
    id: string;
    email: string;
    full_name: string;
    subscription_tier: 'essential' | 'family' | 'educator';
    avatar_id?: string;
    cancel_at_period_end: boolean;
    stripe_subscription_id: string;
    current_period_end: Date;
}
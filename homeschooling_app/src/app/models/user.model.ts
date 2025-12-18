export interface User {
    id: string;
    email: string;
    full_name: string;
    subscription_tier: 'essential' | 'family' | 'educator';
    upcoming_subscription_tier?: 'essential' | 'family' | 'educator';
    upcoming_tier_date?: string;
    avatar_id?: string;
    cancel_at_period_end: boolean;
    payment_gateway_customer_id: string;
    current_period_end: Date;
}
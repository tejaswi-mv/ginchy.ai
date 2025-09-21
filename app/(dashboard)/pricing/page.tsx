// Replaced orange brand colors with theme variables.
import { checkoutAction } from '@/lib/payments/actions';
import { Check } from 'lucide-react';
import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import { SubmitButton } from './submit-button';

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function PricingPage() {
  const [prices, products] = await Promise.all([
    getStripePrices(),
    getStripeProducts(),
  ]);

  const basePlan = products.find((product) => product.name === 'Base');
  const plusPlan = products.find((product) => product.name === 'Plus');

  const basePrice = prices.find((price) => price.productId === basePlan?.id);
  const plusPrice = prices.find((price) => price.productId === plusPlan?.id);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section - Compact */}
      <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-[var(--font-display)] text-[36px] sm:text-[48px] lg:text-[56px] font-extrabold leading-[0.95] tracking-tight mb-4">
            <span className="text-white">Choose Your</span>
            <br />
            <span className="text-[#009AFF] drop-shadow-[0_0_22px_rgba(0,154,255,0.25)]">Plan</span>
          </h1>
          <p className="text-[16px] sm:text-[18px] text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Select the perfect plan for your AI-powered fashion content creation needs.
          </p>
        </div>
      </section>

      {/* Pricing Cards - Compact */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <PricingCard
              name={basePlan?.name || 'Base'}
              price={basePrice?.unitAmount || 800}
              interval={basePrice?.interval || 'month'}
              trialDays={basePrice?.trialPeriodDays || 7}
              features={[
                'Unlimited AI Model Generation',
                '50+ Virtual Models',
                'Unlimited Background Replacements',
                '720p Resolution Exports',
                'Email Support',
                'Community Access'
              ]}
              priceId={basePrice?.id}
              isPopular={false}
            />
            <PricingCard
              name={plusPlan?.name || 'Plus'}
              price={plusPrice?.unitAmount || 1200}
              interval={plusPrice?.interval || 'month'}
              trialDays={plusPrice?.trialPeriodDays || 7}
              features={[
                'Everything in Base, and:',
                '100+ Premium Virtual Models',
                '4K Resolution Exports',
                'Unlimited Brand Style Presets',
                'Priority Email Support',
                'Early Access to New Features',
                '24/7 Slack Community Access'
              ]}
              priceId={plusPrice?.id}
              isPopular={true}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function PricingCard({
  name,
  price,
  interval,
  trialDays,
  features,
  priceId,
  isPopular = false,
}: {
  name: string;
  price: number;
  interval: string;
  trialDays: number;
  features: string[];
  priceId?: string;
  isPopular?: boolean;
}) {
  return (
    <div className={`relative rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${
      isPopular 
        ? 'bg-gradient-to-br from-neutral-900 to-black border-2 border-[#009AFF] shadow-[0_0_30px_rgba(0,154,255,0.3)]' 
        : 'bg-neutral-900 border border-neutral-700 hover:border-neutral-600'
    }`}>
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="bg-[#009AFF] text-black px-4 py-1 rounded-full text-xs font-bold tracking-wide">
            MOST POPULAR
          </div>
        </div>
      )}

      {/* Plan Name */}
      <div className="text-center mb-4">
        <h3 className="font-[var(--font-display)] text-[24px] font-extrabold text-white mb-1">
          {name}
        </h3>
        <p className="text-neutral-400 text-xs">
          {trialDays} day free trial
        </p>
      </div>

      {/* Price */}
      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center">
          <span className="font-[var(--font-display)] text-[36px] font-extrabold text-white">
            ${price / 100}
          </span>
          <span className="text-neutral-400 text-sm ml-2">
            /{interval}
          </span>
        </div>
        <p className="text-neutral-400 text-xs mt-1">
          per user
        </p>
      </div>

      {/* Features */}
      <ul className="space-y-2 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-4 w-4 text-[#009AFF] mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-neutral-200 text-[13px] leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <form action={checkoutAction}>
        <input type="hidden" name="priceId" value={priceId} />
        <SubmitButton />
      </form>
    </div>
  );
}
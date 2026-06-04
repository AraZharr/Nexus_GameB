<template>
  <div class="min-h-screen bg-slate-950 text-slate-50">
    <div class="max-w-4xl mx-auto p-4 md:p-8">
      <!-- Header -->
      <div class="mb-8">
        <router-link to="/" class="text-primary-400 hover:text-primary-300 text-sm mb-4 inline-block">
          ← Back
        </router-link>
        <h1 class="text-4xl font-bold mb-2">Terms of Service</h1>
        <p class="text-slate-400">Last updated: {{ lastUpdated }}</p>
      </div>

      <!-- Content -->
      <Card class="space-y-8 mb-8">
        <!-- Age Requirement -->
        <section class="border-b border-slate-700 pb-8 last:border-b-0 last:pb-0">
          <h2 class="text-2xl font-bold mb-3 text-primary-400">Age Requirement</h2>
          <p class="text-slate-300 leading-relaxed">
            You must be at least 13 years old to use this platform. We comply with the Children's Online Privacy Protection Act (COPPA) and do not knowingly collect data from children under 13. If you are under 13, please do not use our services.
          </p>
        </section>

        <!-- No Cheating -->
        <section class="border-b border-slate-700 pb-8 last:border-b-0 last:pb-0">
          <h2 class="text-2xl font-bold mb-3 text-primary-400">Cheating & Fair Play</h2>
          <p class="text-slate-300 leading-relaxed mb-3">
            Players are strictly prohibited from:
          </p>
          <ul class="list-disc list-inside text-slate-300 space-y-2">
            <li>Using bots, scripts, or automated tools</li>
            <li>Exploiting game glitches or bugs</li>
            <li>Sharing accounts or using others' accounts</li>
            <li>Abusing in-game systems to gain unfair advantages</li>
            <li>Colluding with other players to manipulate rankings</li>
          </ul>
          <p class="text-slate-300 leading-relaxed mt-3">
            Violations may result in account suspension or permanent ban.
          </p>
        </section>

        <!-- Content Policy -->
        <section class="border-b border-slate-700 pb-8 last:border-b-0 last:pb-0">
          <h2 class="text-2xl font-bold mb-3 text-primary-400">Content & Conduct Policy</h2>
          <p class="text-slate-300 leading-relaxed mb-3">
            All user-generated content and conduct must comply with our standards:
          </p>
          <ul class="list-disc list-inside text-slate-300 space-y-2">
            <li>No NSFW or adult content</li>
            <li>No hate speech or discrimination</li>
            <li>No harassment or bullying</li>
            <li>No spam or excessive self-promotion</li>
            <li>No sharing personal information of others</li>
          </ul>
        </section>

        <!-- Refund Policy -->
        <section class="border-b border-slate-700 pb-8 last:border-b-0 last:pb-0">
          <h2 class="text-2xl font-bold mb-3 text-primary-400">Refund Policy</h2>
          <p class="text-slate-300 leading-relaxed mb-3">
            In-game purchases of virtual currency and cosmetic items are non-refundable once purchased. We do not offer refunds for:
          </p>
          <ul class="list-disc list-inside text-slate-300 space-y-2">
            <li>Virtual currency (gold, gems, tokens, etc.)</li>
            <li>Cosmetic items and skins</li>
            <li>Battle pass or seasonal content</li>
            <li>Mistake purchases made by the player</li>
          </ul>
          <p class="text-slate-300 leading-relaxed mt-3">
            In cases of unauthorized transactions, we will investigate and may issue refunds at our discretion.
          </p>
        </section>

        <!-- Data & Privacy -->
        <section class="border-b border-slate-700 pb-8 last:border-b-0 last:pb-0">
          <h2 class="text-2xl font-bold mb-3 text-primary-400">Data & Privacy</h2>
          <p class="text-slate-300 leading-relaxed mb-3">
            We collect and process user data as described in our
            <router-link to="/privacy" class="text-primary-400 hover:text-primary-300 underline">
              Privacy Policy
            </router-link>
            . By using our services, you consent to our data practices.
          </p>
          <p class="text-slate-300 leading-relaxed">
            Your data is protected using industry-standard encryption and security measures. We do not sell your personal data to third parties.
          </p>
        </section>

        <!-- Admin Rights -->
        <section class="border-b border-slate-700 pb-8 last:border-b-0 last:pb-0">
          <h2 class="text-2xl font-bold mb-3 text-primary-400">Admin Rights & Suspension</h2>
          <p class="text-slate-300 leading-relaxed mb-3">
            Our admin team reserves the right to:
          </p>
          <ul class="list-disc list-inside text-slate-300 space-y-2">
            <li>Suspend or terminate accounts that violate these terms</li>
            <li>Remove content that violates our policies</li>
            <li>Investigate suspected fraud or violations</li>
            <li>Modify or suspend services as needed</li>
            <li>Issue temporary or permanent bans</li>
          </ul>
          <p class="text-slate-300 leading-relaxed mt-3">
            Suspensions will be communicated with an explanation. Players may appeal suspensions through our support system.
          </p>
        </section>

        <!-- Betting Disclaimer -->
        <section class="border-b border-slate-700 pb-8 last:border-b-0 last:pb-0">
          <h2 class="text-2xl font-bold mb-3 text-primary-400">Betting & Virtual Currency Disclaimer</h2>
          <p class="text-slate-300 leading-relaxed mb-3">
            Virtual currency used in this game has no real-world value:
          </p>
          <ul class="list-disc list-inside text-slate-300 space-y-2">
            <li>Virtual currency cannot be converted to real money</li>
            <li>In-game betting is purely for entertainment</li>
            <li>Outcomes are determined by gameplay skill and game mechanics</li>
            <li>This platform is not a gambling service</li>
          </ul>
        </section>

        <!-- Skill Disclaimer -->
        <section class="border-b border-slate-700 pb-8 last:border-b-0 last:pb-0">
          <h2 class="text-2xl font-bold mb-3 text-primary-400">Cosmetic Items Disclaimer</h2>
          <p class="text-slate-300 leading-relaxed">
            All cosmetic items (skins, accessories, effects) are purely decorative and do not provide gameplay advantages. Cosmetics do not affect skill, performance, or competitive balance. Players with and without cosmetic items have equal gameplay capabilities.
          </p>
        </section>

        <!-- Classic Mode -->
        <section>
          <h2 class="text-2xl font-bold mb-3 text-primary-400">Classic Mode Guarantee</h2>
          <p class="text-slate-300 leading-relaxed mb-3">
            We guarantee that Classic Mode will:
          </p>
          <ul class="list-disc list-inside text-slate-300 space-y-2">
            <li>Remain free and accessible to all players</li>
            <li>Never include pay-to-win mechanics</li>
            <li>Not feature cosmetic-exclusive content</li>
            <li>Be regularly updated with new features</li>
            <li>Maintain the same core gameplay experience</li>
          </ul>
        </section>
      </Card>

      <!-- Acceptance -->
      <div class="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
        <p class="text-slate-300 mb-4">
          By using our platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
        </p>
        <router-link
          to="/register"
          class="inline-block bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2 rounded-lg transition"
        >
          Accept & Continue
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import Card from '@/components/ui/Card.vue'

const lastUpdated = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})
</script>

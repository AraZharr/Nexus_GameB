<template>
  <div class="min-h-screen bg-slate-950 text-slate-50">
    <div class="max-w-4xl mx-auto p-4 md:p-8">
      <!-- Header -->
      <div class="mb-8">
        <router-link to="/" class="text-primary-400 hover:text-primary-300 text-sm mb-4 inline-block">
          ← Back
        </router-link>
        <h1 class="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p class="text-slate-400">Last updated: {{ lastUpdated }}</p>
      </div>

      <!-- Content -->
      <Card class="space-y-8 mb-8">
        <!-- Introduction -->
        <section class="border-b border-slate-700 pb-8">
          <h2 class="text-2xl font-bold mb-3 text-primary-400">Overview</h2>
          <p class="text-slate-300 leading-relaxed">
            We are committed to protecting your privacy. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data. By using our platform, you consent to our data practices as described in this policy.
          </p>
        </section>

        <!-- Data Collection -->
        <section class="border-b border-slate-700 pb-8">
          <h2 class="text-2xl font-bold mb-3 text-primary-400">Information We Collect</h2>

          <h3 class="text-lg font-semibold text-slate-200 mb-2 mt-4">Authentication Data</h3>
          <ul class="list-disc list-inside text-slate-300 space-y-1 ml-2">
            <li>Email address</li>
            <li>Password (encrypted)</li>
            <li>Display name / username</li>
            <li>Profile photo (optional)</li>
          </ul>

          <h3 class="text-lg font-semibold text-slate-200 mb-2 mt-4">Gameplay Data</h3>
          <ul class="list-disc list-inside text-slate-300 space-y-1 ml-2">
            <li>Game statistics and scores</li>
            <li>Achievements and progress</li>
            <li>Playtime and session logs</li>
            <li>In-game purchases and inventory</li>
            <li>Room and match history</li>
          </ul>

          <h3 class="text-lg font-semibold text-slate-200 mb-2 mt-4">Technical Data</h3>
          <ul class="list-disc list-inside text-slate-300 space-y-1 ml-2">
            <li>IP address</li>
            <li>Device information (type, OS, browser)</li>
            <li>Crash reports and error logs</li>
            <li>Cookie and local storage data</li>
          </ul>

          <h3 class="text-lg font-semibold text-slate-200 mb-2 mt-4">Analytics Data</h3>
          <ul class="list-disc list-inside text-slate-300 space-y-1 ml-2">
            <li>Page views and interactions</li>
            <li>Feature usage patterns</li>
            <li>Session duration and frequency</li>
            <li>Referral sources</li>
          </ul>
        </section>

        <!-- Data Usage -->
        <section class="border-b border-slate-700 pb-8">
          <h2 class="text-2xl font-bold mb-3 text-primary-400">How We Use Your Data</h2>
          <ul class="list-disc list-inside text-slate-300 space-y-2 ml-2">
            <li><strong>Account Management:</strong> Creating and maintaining your account</li>
            <li><strong>Service Delivery:</strong> Providing game features and functionality</li>
            <li><strong>Analytics:</strong> Improving our platform and user experience</li>
            <li><strong>Communication:</strong> Sending important updates, support, and announcements</li>
            <li><strong>Security:</strong> Detecting fraud, abuse, and unauthorized access</li>
            <li><strong>Compliance:</strong> Meeting legal and regulatory requirements</li>
          </ul>
        </section>

        <!-- Third-Party Services -->
        <section class="border-b border-slate-700 pb-8">
          <h2 class="text-2xl font-bold mb-3 text-primary-400">Third-Party Services</h2>
          <p class="text-slate-300 leading-relaxed mb-3">
            We use third-party services that may collect data:
          </p>

          <h3 class="text-lg font-semibold text-slate-200 mb-2">Supabase (Backend & Auth)</h3>
          <p class="text-slate-300 leading-relaxed">
            We use Supabase for database and authentication services. Your data is stored in Supabase's secure infrastructure. Visit their
            <a href="https://supabase.com/privacy" target="_blank" class="text-primary-400 hover:text-primary-300 underline">
              Privacy Policy
            </a>
            for details.
          </p>

          <h3 class="text-lg font-semibold text-slate-200 mb-2 mt-3">Google OAuth</h3>
          <p class="text-slate-300 leading-relaxed">
            If you sign in with Google, Google processes your authentication data. Review Google's
            <a href="https://policies.google.com/privacy" target="_blank" class="text-primary-400 hover:text-primary-300 underline">
              Privacy Policy
            </a>
            .
          </p>

          <h3 class="text-lg font-semibold text-slate-200 mb-2 mt-3">Analytics</h3>
          <p class="text-slate-300 leading-relaxed">
            We may use analytics tools (such as Google Analytics) to understand usage patterns. These services may set cookies on your device.
          </p>
        </section>

        <!-- Data Security -->
        <section class="border-b border-slate-700 pb-8">
          <h2 class="text-2xl font-bold mb-3 text-primary-400">Data Security</h2>
          <p class="text-slate-300 leading-relaxed mb-3">
            We implement industry-standard security measures:
          </p>
          <ul class="list-disc list-inside text-slate-300 space-y-2 ml-2">
            <li>End-to-end encryption for sensitive data</li>
            <li>Secure HTTPS connections</li>
            <li>Regular security audits and testing</li>
            <li>Limited access to personal data by authorized personnel only</li>
            <li>Password hashing using bcrypt</li>
          </ul>
          <p class="text-slate-300 leading-relaxed mt-3">
            No method of transmission or storage is completely secure. While we implement strong security measures, we cannot guarantee absolute security.
          </p>
        </section>

        <!-- User Rights -->
        <section class="border-b border-slate-700 pb-8">
          <h2 class="text-2xl font-bold mb-3 text-primary-400">Your Rights & Choices</h2>

          <h3 class="text-lg font-semibold text-slate-200 mb-2">Access Your Data</h3>
          <p class="text-slate-300 leading-relaxed">
            You can access your profile and account data at any time from your account settings.
          </p>

          <h3 class="text-lg font-semibold text-slate-200 mb-2 mt-3">Update Your Information</h3>
          <p class="text-slate-300 leading-relaxed">
            You can update your display name, email, and other profile information in your account settings.
          </p>

          <h3 class="text-lg font-semibold text-slate-200 mb-2 mt-3">Delete Your Account</h3>
          <p class="text-slate-300 leading-relaxed">
            You can request to delete your account and all associated data. This action is permanent and cannot be undone. Contact our support team for account deletion.
          </p>

          <h3 class="text-lg font-semibold text-slate-200 mb-2 mt-3">Export Your Data</h3>
          <p class="text-slate-300 leading-relaxed">
            You can request a copy of your personal data in a portable format. Contact us at support@example.com to request an export.
          </p>

          <h3 class="text-lg font-semibold text-slate-200 mb-2 mt-3">Opt-Out of Communications</h3>
          <p class="text-slate-300 leading-relaxed">
            You can unsubscribe from promotional emails. Note: We will still send critical service updates and account notifications.
          </p>
        </section>

        <!-- Cookies -->
        <section class="border-b border-slate-700 pb-8">
          <h2 class="text-2xl font-bold mb-3 text-primary-400">Cookies & Tracking</h2>
          <p class="text-slate-300 leading-relaxed mb-3">
            We use cookies and similar technologies for:
          </p>
          <ul class="list-disc list-inside text-slate-300 space-y-2 ml-2">
            <li><strong>Essential Cookies:</strong> Session management and authentication</li>
            <li><strong>Analytics Cookies:</strong> Understanding how you use our platform</li>
            <li><strong>Preference Cookies:</strong> Remembering your settings and choices</li>
          </ul>
          <p class="text-slate-300 leading-relaxed mt-3">
            You can manage cookie preferences in your browser settings. Disabling cookies may affect some features.
          </p>
        </section>

        <!-- Children's Privacy (COPPA) -->
        <section class="border-b border-slate-700 pb-8">
          <h2 class="text-2xl font-bold mb-3 text-primary-400">Children's Privacy (COPPA)</h2>
          <p class="text-slate-300 leading-relaxed mb-3">
            Our service is designed for users 13 years and older. We comply with the Children's Online Privacy Protection Act (COPPA):
          </p>
          <ul class="list-disc list-inside text-slate-300 space-y-2 ml-2">
            <li>We do not knowingly collect personal information from children under 13</li>
            <li>Parents/guardians can request deletion of their child's data</li>
            <li>We do not use children's data for marketing or advertising</li>
            <li>We do not share children's data with third parties</li>
          </ul>
          <p class="text-slate-300 leading-relaxed mt-3">
            If you believe a child under 13 has created an account, please contact us immediately at privacy@example.com.
          </p>
        </section>

        <!-- Data Retention -->
        <section class="border-b border-slate-700 pb-8">
          <h2 class="text-2xl font-bold mb-3 text-primary-400">Data Retention</h2>
          <p class="text-slate-300 leading-relaxed">
            We retain your data for as long as your account is active. When you delete your account, we remove personal data within 30 days, except where required by law. Game statistics and analytics data may be retained in anonymized form for product improvement.
          </p>
        </section>

        <!-- Contact Information -->
        <section>
          <h2 class="text-2xl font-bold mb-3 text-primary-400">Contact Us</h2>
          <p class="text-slate-300 leading-relaxed mb-3">
            If you have questions about this Privacy Policy or your data:
          </p>
          <ul class="list-none text-slate-300 space-y-2 ml-2">
            <li><strong>Email:</strong> privacy@example.com</li>
            <li><strong>Support:</strong> support@example.com</li>
            <li><strong>Mailing Address:</strong> [Company Address]</li>
          </ul>
          <p class="text-slate-300 leading-relaxed mt-3">
            We will respond to all data requests within 30 days.
          </p>
        </section>
      </Card>

      <!-- Acceptance -->
      <div class="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
        <p class="text-slate-300 mb-4">
          By using our platform, you acknowledge that you have read and understand this Privacy Policy.
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

export default function Terms() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using SkaiLinker ("the Service"), you accept and agree to be bound by these Terms of 
              Service. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">2. Description of Service</h2>
            <p className="text-muted-foreground">
              SkaiLinker is an AI-powered flight search and price prediction platform that helps users:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Search for flights across multiple airlines</li>
              <li>Predict future flight prices using AI algorithms</li>
              <li>Receive personalized deal alerts</li>
              <li>Compare and book flights</li>
            </ul>
            <p className="text-muted-foreground">
              We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. User Accounts</h2>
            <h3 className="text-xl font-semibold">Account Creation</h3>
            <p className="text-muted-foreground">
              To use certain features, you must create an account by signing in with Google. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4">Account Termination</h3>
            <p className="text-muted-foreground">
              We reserve the right to suspend or terminate your account if you violate these terms or engage in 
              fraudulent, abusive, or illegal activities.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. User Conduct</h2>
            <p className="text-muted-foreground">
              You agree NOT to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Use the Service for any illegal purpose</li>
              <li>Violate any laws or regulations</li>
              <li>Impersonate any person or entity</li>
              <li>Upload viruses or malicious code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Scrape, crawl, or harvest data from the Service</li>
              <li>Use automated tools to access the Service</li>
              <li>Interfere with or disrupt the Service</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. Price Predictions and Accuracy</h2>
            <p className="text-muted-foreground">
              <strong>Important:</strong> Our AI price predictions are estimates based on historical data and 
              algorithms. They are NOT guarantees of future prices.
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Flight prices can change at any time without notice</li>
              <li>Predictions may not always be accurate</li>
              <li>We are not responsible for price changes or booking errors</li>
              <li>Always verify prices before booking</li>
            </ul>
            <p className="text-muted-foreground">
              By using our prediction features, you acknowledge these limitations and agree that SkaiLinker is not 
              liable for any losses resulting from price predictions.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">6. Bookings and Transactions</h2>
            <p className="text-muted-foreground">
              When you book flights through our platform:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>You are entering into a contract with the airline or travel provider, not with SkaiLinker</li>
              <li>Airline terms and conditions apply to your booking</li>
              <li>Cancellations and refunds are subject to airline policies</li>
              <li>We act as an intermediary and are not responsible for airline services</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">7. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content, features, and functionality of SkaiLinker are owned by us and protected by copyright, 
              trademark, and other intellectual property laws.
            </p>
            <p className="text-muted-foreground">
              You may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Copy, modify, or distribute our content without permission</li>
              <li>Use our trademarks or branding without authorization</li>
              <li>Reverse engineer or attempt to extract our source code</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">8. Third-Party Services</h2>
            <p className="text-muted-foreground">
              Our Service may contain links to third-party websites or integrate with third-party services. We are 
              not responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>The content or practices of third-party sites</li>
              <li>Transactions with third-party providers</li>
              <li>Third-party terms and policies</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">9. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
            </p>
            <p className="text-muted-foreground">
              We do not warrant that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>The Service will be uninterrupted or error-free</li>
              <li>Results will be accurate or reliable</li>
              <li>Defects will be corrected</li>
              <li>The Service will meet your requirements</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">10. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, SKAILINKER SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Indirect, incidental, or consequential damages</li>
              <li>Loss of profits, data, or use</li>
              <li>Errors in price predictions or flight information</li>
              <li>Issues with third-party airlines or services</li>
              <li>Any damages exceeding the amount you paid us (if any)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">11. Indemnification</h2>
            <p className="text-muted-foreground">
              You agree to indemnify and hold SkaiLinker harmless from any claims, damages, or expenses arising from:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">12. Privacy</h2>
            <p className="text-muted-foreground">
              Your use of the Service is also governed by our Privacy Policy. Please review our{' '}
              <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> to understand our 
              practices.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">13. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these Terms at any time. Changes will be effective when posted. 
              Continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">14. Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms are governed by and construed in accordance with the laws of [Your Jurisdiction], without 
              regard to conflict of law principles.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">15. Dispute Resolution</h2>
            <p className="text-muted-foreground">
              Any disputes arising from these Terms or the Service shall be resolved through binding arbitration, 
              except where prohibited by law.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">16. Contact Information</h2>
            <p className="text-muted-foreground">
              For questions about these Terms, please contact us:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-muted-foreground">
                <strong>Email:</strong> contact@skailinker.org<br />
                <strong>Website:</strong> https://www.skailinker.org<br />
                <strong>Address:</strong> [Your Business Address]
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">17. Severability</h2>
            <p className="text-muted-foreground">
              If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions 
              shall remain in full force and effect.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">18. Entire Agreement</h2>
            <p className="text-muted-foreground">
              These Terms constitute the entire agreement between you and SkaiLinker regarding the Service and 
              supersede all prior agreements.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
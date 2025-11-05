export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Introduction</h2>
            <p className="text-muted-foreground">
              Welcome to SkaiLinker. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and safeguard your information when you use our flight 
              booking and prediction service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Information We Collect</h2>
            <h3 className="text-xl font-semibold">Personal Information</h3>
            <p className="text-muted-foreground">
              When you sign in with Google, we collect:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Your name</li>
              <li>Your email address</li>
              <li>Your profile picture</li>
              <li>Your Google account ID</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4">Usage Information</h3>
            <p className="text-muted-foreground">
              We automatically collect information about how you use our service:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Flight searches and preferences</li>
              <li>Pages visited and features used</li>
              <li>Device and browser information</li>
              <li>IP address and location data</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
            <p className="text-muted-foreground">
              We use your information to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Provide and maintain our service</li>
              <li>Personalize your flight search experience</li>
              <li>Send you price alerts and notifications</li>
              <li>Improve and optimize our AI predictions</li>
              <li>Analyze usage patterns and trends</li>
              <li>Detect and prevent fraud or security issues</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Data Storage and Security</h2>
            <p className="text-muted-foreground">
              We store your data securely using industry-standard encryption and security practices. Your personal 
              information is stored on secure servers and protected against unauthorized access, alteration, or 
              disclosure.
            </p>
            <p className="text-muted-foreground">
              However, no method of transmission over the internet is 100% secure. While we strive to protect your 
              personal information, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Sharing Your Information</h2>
            <p className="text-muted-foreground">
              We do NOT sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Service Providers:</strong> Third-party companies that help us operate our service</li>
              <li><strong>Airlines & Travel Partners:</strong> When you book flights through our platform</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Google Sign-In</h2>
            <p className="text-muted-foreground">
              When you use Google Sign-In, your authentication is handled by Google. We receive only the basic 
              profile information you authorize. We do not have access to your Google password.
            </p>
            <p className="text-muted-foreground">
              Please review Google's Privacy Policy at:{' '}
              <a 
                href="https://policies.google.com/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://policies.google.com/privacy
              </a>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Cookies and Tracking</h2>
            <p className="text-muted-foreground">
              We use cookies and similar tracking technologies to enhance your experience. These help us:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Remember your preferences and settings</li>
              <li>Keep you signed in</li>
              <li>Analyze site traffic and usage patterns</li>
              <li>Provide personalized content and recommendations</li>
            </ul>
            <p className="text-muted-foreground">
              You can control cookies through your browser settings.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Your Rights</h2>
            <p className="text-muted-foreground">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct your information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Data Portability:</strong> Receive your data in a portable format</li>
            </ul>
            <p className="text-muted-foreground">
              To exercise these rights, contact us at: <strong>contact@skailinker.org</strong>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Children's Privacy</h2>
            <p className="text-muted-foreground">
              Our service is not intended for children under 13. We do not knowingly collect personal information 
              from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">International Data Transfers</h2>
            <p className="text-muted-foreground">
              Your information may be transferred to and processed in countries other than your own. We ensure 
              appropriate safeguards are in place to protect your data in accordance with this privacy policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this privacy policy from time to time. We will notify you of significant changes by 
              posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this privacy policy or our data practices, please contact us:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-muted-foreground">
                <strong>Email:</strong> contact@skailinker.org<br />
                <strong>Website:</strong> https://www.skailinker.org<br />
                <strong>Address:</strong> [Your Business Address]
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
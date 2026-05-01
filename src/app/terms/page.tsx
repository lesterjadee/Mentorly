import Link from 'next/link'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#080C14] text-white">
      <nav className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#26619C] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L12 4V10L7 13L2 10V4L7 1Z" stroke="white" strokeWidth="1.2" fill="none"/>
              <circle cx="7" cy="7" r="2" fill="white"/>
            </svg>
          </div>
          <span className="font-semibold text-[15px]">Mentorly</span>
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 md:px-8 py-16">
        <h1 className="text-3xl font-bold mb-2">Terms and Conditions</h1>
        <p className="text-white/30 text-sm mb-12">Last updated: May 2025</p>

        <div className="space-y-10 text-white/60 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-semibold text-base mb-3">1. Acceptance of Terms</h2>
            <p>By creating an account and using Mentorly, you agree to be bound by these Terms and Conditions. If you do not agree to any part of these terms, you may not access or use the platform. Mentorly reserves the right to update these terms at any time, and continued use of the platform constitutes acceptance of any changes.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">2. Eligibility</h2>
            <p>Mentorly is intended for currently enrolled college and university students. By registering, you confirm that you are a student at an accredited academic institution. Misrepresentation of your academic status may result in immediate account suspension.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate, current, and complete information during registration. Mentorly is not liable for any loss or damage arising from unauthorized access to your account due to your failure to keep your login information secure.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">4. Tutor and Learner Responsibilities</h2>
            <p className="mb-3">As a tutor, you agree to provide honest and accurate descriptions of your skills, qualifications, and services. You commit to fulfilling accepted bookings in a professional and timely manner.</p>
            <p>As a learner, you agree to treat tutors with respect and to honor scheduled sessions. Repeated no-shows or abusive behavior may result in account restrictions.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">5. Session Bookings and Cancellations</h2>
            <p>Sessions are arranged directly between tutors and learners through the platform. Both parties are expected to communicate promptly regarding scheduling changes. Mentorly is not responsible for disputes arising from cancelled or missed sessions, but may intervene in cases of reported misconduct.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">6. Payments and Pricing</h2>
            <p>Tutors set their own rates on the platform. All financial transactions between users are the sole responsibility of those involved. Mentorly does not process, hold, or guarantee payments between users at this time. Users are encouraged to agree on payment terms before a session begins.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">7. Reviews and Trust Scores</h2>
            <p>Users may leave honest reviews after completed sessions. Reviews must be truthful and based on actual experience. Fake, malicious, or retaliatory reviews are prohibited and may be removed. Trust scores are calculated automatically based on submitted ratings.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">8. Prohibited Conduct</h2>
            <p>Users may not use Mentorly to engage in academic dishonesty, harassment, discrimination, or any unlawful activity. Sharing false information, impersonating others, or attempting to manipulate the review system is strictly prohibited and may result in permanent account termination.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">9. Privacy and Data</h2>
            <p>Mentorly collects basic profile information to facilitate connections between students. Your data will not be sold to third parties. By using the platform, you consent to the storage and processing of your information as necessary to provide our services.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">10. Limitation of Liability</h2>
            <p>Mentorly is a student-to-student marketplace and does not guarantee the quality, accuracy, or outcomes of any tutoring session. The platform is provided on an "as is" basis. Mentorly shall not be held liable for any direct, indirect, or consequential damages arising from use of the platform.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">11. Termination</h2>
            <p>Mentorly reserves the right to suspend or permanently terminate any account that violates these Terms and Conditions without prior notice. Users may also delete their accounts at any time by contacting support.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">12. Contact</h2>
            <p>If you have questions about these terms, please reach out to us through the platform's messaging system or contact your institution's student services office.</p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <Link href="/register" className="inline-flex items-center gap-2 bg-[#26619C] hover:bg-[#1e4f82] transition-all px-6 py-3 rounded-xl font-medium text-sm">
            Back to registration
          </Link>
        </div>
      </div>
    </main>
  )
}
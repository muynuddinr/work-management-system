'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ArrowLeft, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
                <p className="text-gray-600 mt-1">Last updated: November 7, 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Quick Summary */}
        <Card className="border-0 shadow-lg mb-6 bg-blue-50">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Terms Summary</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Authorized Use</p>
                  <p className="text-xs text-gray-600">Use system for work purposes only</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">No Misuse</p>
                  <p className="text-xs text-gray-600">Don't share credentials or abuse system</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Data Protection</p>
                  <p className="text-xs text-gray-600">Keep company information confidential</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms Content */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6 prose prose-sm max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  By accessing and using the Office Management System (OMS) provided by Lovosis Technology Pvt. Ltd., 
                  you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not 
                  access or use the service. Your organization's administrator has authorized your access to this system.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Account Registration and Security</h2>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Account Creation</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Your account is created by your organization's administrator</li>
                  <li>You must provide accurate and complete information</li>
                  <li>You are responsible for maintaining the confidentiality of your credentials</li>
                  <li>You must notify us immediately of any unauthorized account access</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">Password Security</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Use strong, unique passwords for your account</li>
                  <li>Never share your password with anyone</li>
                  <li>Change your password if you suspect compromise</li>
                  <li>Use the "Forgot Password" feature if you lose access</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Acceptable Use Policy</h2>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">You May:</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Use the system for legitimate work-related purposes</li>
                  <li>Upload and share work-related documents</li>
                  <li>Create and manage tasks within your permissions</li>
                  <li>Communicate with colleagues through the system</li>
                  <li>Access documents and information you're authorized to view</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">You May NOT:</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Share your account credentials with others</li>
                  <li>Upload malicious software, viruses, or harmful code</li>
                  <li>Attempt to gain unauthorized access to other accounts or systems</li>
                  <li>Use the system for illegal, fraudulent, or malicious purposes</li>
                  <li>Upload offensive, inappropriate, or non-work-related content</li>
                  <li>Attempt to reverse engineer, modify, or tamper with the system</li>
                  <li>Scrape, mine, or extract data without authorization</li>
                  <li>Impersonate other users or falsify information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">4. User Roles and Permissions</h2>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Administrator Role</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Full access to all system features and data</li>
                  <li>Can create, modify, and delete user accounts</li>
                  <li>Can manage documents, tasks, and evaluations</li>
                  <li>Can configure system settings and permissions</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">Employee Role</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Limited access based on administrator permissions</li>
                  <li>Can view and download shared documents</li>
                  <li>Can view and update assigned tasks</li>
                  <li>Can view their own evaluations</li>
                  <li>Cannot access other users' private information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Intellectual Property Rights</h2>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">System Ownership</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  The OMS software, including its design, code, features, and functionality, is owned by 
                  Lovosis Technology Pvt. Ltd. and is protected by copyright, trademark, and other intellectual 
                  property laws.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">User Content</h3>
                <p className="text-gray-700 leading-relaxed">
                  You retain ownership of documents and content you upload. By uploading content, you grant 
                  Lovosis Technology and your organization a license to store, process, and display this content 
                  as necessary to provide the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Data and Privacy</h2>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Your use of the system is subject to our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link></li>
                  <li>We collect and process data as described in the Privacy Policy</li>
                  <li>You are responsible for ensuring uploaded content complies with privacy laws</li>
                  <li>Do not upload sensitive personal data without proper authorization</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Service Availability</h2>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Uptime and Maintenance</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service</li>
                  <li>Scheduled maintenance will be announced in advance when possible</li>
                  <li>Emergency maintenance may occur without notice</li>
                  <li>We are not liable for service interruptions beyond our control</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">Service Modifications</h3>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify, suspend, or discontinue any part of the service at any time 
                  with or without notice. We will make reasonable efforts to notify users of significant changes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Limitation of Liability</h2>
                <p className="text-gray-700 leading-relaxed mb-2">
                  To the maximum extent permitted by law:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>The service is provided "as is" without warranties of any kind</li>
                  <li>We are not liable for data loss, business interruption, or other damages</li>
                  <li>Our total liability shall not exceed the fees paid by your organization</li>
                  <li>We are not responsible for user-generated content or user actions</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Termination</h2>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">By Administrator</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  Your organization's administrator can deactivate your account at any time for any reason.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">By Lovosis Technology</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  We may suspend or terminate accounts that violate these Terms of Service, including:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Violation of acceptable use policies</li>
                  <li>Fraudulent or illegal activities</li>
                  <li>Security threats or system abuse</li>
                  <li>Non-payment by your organization</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">Effect of Termination</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Your access to the system will be immediately revoked</li>
                  <li>Your organization may retain access to your work-related data</li>
                  <li>Provisions regarding confidentiality and liability survive termination</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">10. Confidentiality</h2>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>All information accessed through the system is confidential</li>
                  <li>You must not disclose company information to unauthorized parties</li>
                  <li>This obligation continues after your account termination</li>
                  <li>Breaches may result in legal action and damages</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">11. Indemnification</h2>
                <p className="text-gray-700 leading-relaxed">
                  You agree to indemnify and hold harmless Lovosis Technology Pvt. Ltd., its officers, directors, 
                  employees, and agents from any claims, damages, or expenses arising from your use of the service, 
                  violation of these terms, or infringement of any rights of another party.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">12. Governing Law</h2>
                <p className="text-gray-700 leading-relaxed">
                  These Terms of Service are governed by the laws of India. Any disputes shall be subject to 
                  the exclusive jurisdiction of the courts in Bangalore, Karnataka, India.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">13. Changes to Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify these Terms of Service at any time. Users will be notified of 
                  significant changes via email or in-app notification. Continued use of the service after changes 
                  constitutes acceptance of the modified terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">14. Contact Information</h2>
                <p className="text-gray-700 leading-relaxed mb-2">
                  For questions about these Terms of Service, contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700"><strong>Lovosis Technology Pvt. Ltd.</strong></p>
                  <p className="text-gray-700">Email: <a href="mailto:legal@lovosis.com" className="text-blue-600 hover:underline">legal@lovosis.com</a></p>
                  <p className="text-gray-700">Phone: +91 98765 43210</p>
                  <p className="text-gray-700">Address: 4-72/2, Swathi Building, 3rd Floor, Opp Singapura Garden, 1st Main, Lakshmipura Main Rd, Abbigere, Bengaluru, Karnataka 560013, India</p>
                  <p className="text-gray-700">Hours: Monday - Saturday, 9:00 AM - 6:00 PM</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">15. Severability</h2>
                <p className="text-gray-700 leading-relaxed">
                  If any provision of these Terms of Service is found to be unenforceable or invalid, that provision 
                  shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall 
                  remain in full force and effect.
                </p>
              </section>

              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600 mt-8">
                <p className="text-sm text-gray-700">
                  <strong>Acknowledgment:</strong> By using the Office Management System, you acknowledge that you 
                  have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

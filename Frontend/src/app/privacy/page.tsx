'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft, Lock, Eye, Database, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
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
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
                <p className="text-gray-600 mt-1">Last updated: November 7, 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Quick Overview */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div>
                <Lock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-semibold">Data Encrypted</p>
              </div>
              <div>
                <Eye className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-semibold">Transparent</p>
              </div>
              <div>
                <Database className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-semibold">Secure Storage</p>
              </div>
              <div>
                <UserCheck className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-semibold">Your Control</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Policy Content */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6 prose prose-sm max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Introduction</h2>
                <p className="text-gray-700 leading-relaxed">
                  Welcome to the Office Management System (OMS) operated by Lovosis Technology Pvt. Ltd. 
                  We are committed to protecting your personal information and your right to privacy. This 
                  Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
                  you use our application.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Personal Information</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  We collect the following personal information that you provide to us:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Name and contact information (email, phone number)</li>
                  <li>Login credentials (username and encrypted password)</li>
                  <li>Profile information (role, department, avatar)</li>
                  <li>Work-related information (tasks, documents, evaluations)</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">Automatically Collected Information</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Device information (IP address, browser type)</li>
                  <li>Usage data (pages visited, features used)</li>
                  <li>Log information (access times, error logs)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
                <p className="text-gray-700 leading-relaxed mb-2">
                  We use your personal information for the following purposes:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li><strong>Account Management:</strong> To create and manage your user account</li>
                  <li><strong>Service Delivery:</strong> To provide core OMS functionalities (document management, task tracking, evaluations)</li>
                  <li><strong>Communication:</strong> To send notifications, updates, and support messages</li>
                  <li><strong>Security:</strong> To protect against unauthorized access and fraud</li>
                  <li><strong>Improvement:</strong> To analyze usage patterns and improve our services</li>
                  <li><strong>Compliance:</strong> To comply with legal obligations and internal policies</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Data Storage and Security</h2>
                <p className="text-gray-700 leading-relaxed mb-2">
                  We implement robust security measures to protect your information:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li><strong>Encryption:</strong> All data is encrypted in transit (HTTPS/SSL) and at rest</li>
                  <li><strong>Access Control:</strong> Role-based access controls limit data access</li>
                  <li><strong>Authentication:</strong> JWT-based authentication with secure password hashing</li>
                  <li><strong>Cloud Storage:</strong> Documents stored on secure Cloudinary servers</li>
                  <li><strong>Database Security:</strong> MongoDB Atlas with enterprise-grade security</li>
                  <li><strong>Regular Backups:</strong> Automated daily backups of all data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Data Sharing and Disclosure</h2>
                <p className="text-gray-700 leading-relaxed mb-2">
                  We do not sell or rent your personal information. We may share your information in the following circumstances:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li><strong>Within Organization:</strong> With authorized team members based on role permissions</li>
                  <li><strong>Service Providers:</strong> With trusted third-party services (hosting, email, cloud storage)</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our legal rights</li>
                  <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Your Privacy Rights</h2>
                <p className="text-gray-700 leading-relaxed mb-2">You have the following rights regarding your personal data:</p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li><strong>Access:</strong> Request a copy of your personal information</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                  <li><strong>Objection:</strong> Object to certain data processing activities</li>
                  <li><strong>Portability:</strong> Receive your data in a portable format</li>
                  <li><strong>Withdrawal:</strong> Withdraw consent at any time</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3">
                  To exercise these rights, contact us at <a href="mailto:privacy@lovosis.com" className="text-blue-600 hover:underline">privacy@lovosis.com</a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Data Retention</h2>
                <p className="text-gray-700 leading-relaxed">
                  We retain your personal information for as long as necessary to fulfill the purposes outlined in 
                  this policy, unless a longer retention period is required by law. When data is no longer needed, 
                  we securely delete or anonymize it.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Cookies and Tracking</h2>
                <p className="text-gray-700 leading-relaxed">
                  We use essential cookies and local storage to maintain your session and preferences. We do not 
                  use third-party advertising or tracking cookies. You can control cookie settings through your 
                  browser preferences.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Children's Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  Our service is not intended for users under 18 years of age. We do not knowingly collect 
                  personal information from children. If you believe we have collected data from a child, 
                  please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">10. Changes to This Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy periodically. We will notify you of significant changes via 
                  email or in-app notification. Your continued use of the service after changes constitutes 
                  acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">11. Contact Us</h2>
                <p className="text-gray-700 leading-relaxed mb-2">
                  If you have questions or concerns about this Privacy Policy, please contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700"><strong>Lovosis Technology Pvt. Ltd.</strong></p>
                  <p className="text-gray-700">Email: <a href="mailto:privacy@lovosis.com" className="text-blue-600 hover:underline">privacy@lovosis.com</a></p>
                  <p className="text-gray-700">Phone: +91 98765 43210</p>
                  <p className="text-gray-700">Address: 4-72/2, Swathi Building, 3rd Floor, Opp Singapura Garden, 1st Main, Lakshmipura Main Rd, Abbigere, Bengaluru, Karnataka 560013, India</p>
                  <p className="text-gray-700">Hours: Monday - Saturday, 9:00 AM - 6:00 PM</p>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

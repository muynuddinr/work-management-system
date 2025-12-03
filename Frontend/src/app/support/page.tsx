'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  HelpCircle, 
  Send,
  Clock,
  MapPin,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement support ticket submission
    alert('Support request submitted! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
              <p className="text-gray-600 mt-1">We're here to help you</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Contact Cards */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Email Support</h3>
              <p className="text-gray-600 text-sm mb-3">Get help via email</p>
              <a href="mailto:support@lovosis.com" className="text-blue-600 hover:underline">
                support@lovosis.com
              </a>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Phone className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Phone Support</h3>
              <p className="text-gray-600 text-sm mb-3">Call us directly</p>
              <a href="tel:+919876543210" className="text-green-600 hover:underline">
                +91 98765 43210
              </a>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">WhatsApp</h3>
              <p className="text-gray-600 text-sm mb-3">Chat with us</p>
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                Start Chat
              </a>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Contact Form */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-linear-to-r from-blue-600 to-blue-700 text-white">
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send us a Message
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="What do you need help with?"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your issue or question in detail..."
                  />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* FAQ & Info */}
          <div className="space-y-6">
            {/* FAQ */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-linear-to-r from-purple-600 to-purple-700 text-white">
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">How do I reset my password?</h4>
                  <p className="text-sm text-gray-600">
                    Click on "Forgot Password" on the login page and follow the instructions sent to your email.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">How do I upload documents?</h4>
                  <p className="text-sm text-gray-600">
                    Navigate to Documents section and click "Upload Document" button. Fill in the required details and select your file.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">How do I share documents with employees?</h4>
                  <p className="text-sm text-gray-600">
                    Click the share icon on any document, select the employee and access level, then click "Share Document".
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Can I access the system on mobile?</h4>
                  <p className="text-sm text-gray-600">
                    Yes! Our system is fully responsive and works on all devices including smartphones and tablets.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Office Hours */}
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Office Hours</h4>
                    <p className="text-sm text-gray-600">Monday - Saturday: 9:00 AM - 6:00 PM</p>
                    <p className="text-sm text-gray-600">Sunday: Closed</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Office Location</h4>
                    <p className="text-sm text-gray-600">
                      Lovosis Technology Pvt. Ltd.<br />
                      4-72/2, Swathi Building, 3rd Floor<br />
                      Opp Singapura Garden, 1st Main<br />
                      Lakshmipura Main Rd, Abbigere<br />
                      Bengaluru, Karnataka 560013<br />
                      India
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

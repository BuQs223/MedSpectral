"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Phone, MapPin, MessageSquare, Calendar, HelpCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Header from "../components/Header"

// Reset scroll position when component mounts

export default function ContactPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    userType: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, userType: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)

    // Show success toast
    toast({
      title: "Message Sent",
      description: "We've received your message and will get back to you soon.",
    })

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      userType: "",
    })
  }

  return (
    <div>
      <Header/>
      <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 py-20">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-blue-600 dark:text-blue-400 mb-6">
              Contact Us
            </h1>
            <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 max-w-[800px] mb-8">
              Have questions about our platform? Want to schedule a demo? We're here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Get in Touch</CardTitle>
                  <CardDescription>We're here to answer any questions you may have about our services.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">Email</h3>
                      <p className="text-slate-600 dark:text-slate-300">info@medspectra.com</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">Phone</h3>
                      <p className="text-slate-600 dark:text-slate-300">(555) 123-4567</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">Address</h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        123 Healthcare Ave
                        <br />
                        Suite 200
                        <br />
                        San Francisco, CA 94107
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Support Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">Live Chat</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">Available 9am-5pm PT, Mon-Fri</p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">Schedule a Demo</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">See our platform in action</p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <HelpCircle className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">Help Center</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">Browse our knowledge base</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Send Us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Full Name
                        </label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Email Address
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Phone Number (Optional)
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="(555) 123-4567"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="userType" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          I am a
                        </label>
                        <Select value={formData.userType} onValueChange={handleSelectChange}>
                          <SelectTrigger id="userType">
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="patient">Patient</SelectItem>
                            <SelectItem value="doctor">Doctor</SelectItem>
                            <SelectItem value="healthcare-admin">Healthcare Administrator</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Subject
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="How can we help you?"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Please provide details about your inquiry..."
                        rows={5}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full sm:w-auto">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Visit Our Office</h2>
            <p className="text-slate-600 dark:text-slate-300 mt-2">We're located in the heart of San Francisco</p>
          </div>

          <div className="relative h-[400px] rounded-lg overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <p className="text-slate-600 dark:text-slate-300">[Map would be displayed here]</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-[800px] mx-auto">
              Find quick answers to common questions about our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                question: "Is my medical data secure on your platform?",
                answer:
                  "Yes, we take data security very seriously. Our platform is HIPAA-compliant and uses end-to-end encryption to protect your sensitive medical information.",
              },
              {
                question: "How do I connect with my healthcare provider?",
                answer:
                  "Once you create an account, you can search for your healthcare provider and send a connection request. If they're already on our platform, they'll receive a notification to approve the connection.",
              },
              {
                question: "Can I access my medical records from my phone?",
                answer:
                  "Yes, our platform is fully mobile-responsive and we also offer dedicated iOS and Android apps for a seamless mobile experience.",
              },
              {
                question: "How quickly will I receive feedback from my doctor?",
                answer:
                  "Response times vary by healthcare provider, but our platform encourages timely communication. Many providers respond within 24-48 hours for non-urgent matters.",
              },
            ].map((faq, index) => (
              <Card key={index} className="border-blue-100 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-300">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
    </div>
  )
}


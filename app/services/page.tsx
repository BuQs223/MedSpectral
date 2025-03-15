"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  FileText,
  MessageSquare,
  Calendar,
  BarChart,
  Lock,
  Bell,
  Smartphone,
  Users,
  ClipboardList,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"

// Reset scroll position when component mounts
import { useEffect } from "react"
import Header from "../components/Header"

export default function ServicesPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
   <div>
    <Header/>
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 py-20 overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          className="absolute top-20 right-0 w-72 h-72 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-20 w-64 h-64 bg-teal-200/30 dark:bg-teal-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />

        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center text-center">
            <motion.h1
              className="text-3xl md:text-5xl font-bold tracking-tighter text-blue-600 dark:text-blue-400 mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              Our Services
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-slate-700 dark:text-slate-300 max-w-[800px] mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Discover how our platform connects patients and medical professionals through innovative features and
              services.
            </motion.p>
          </div>
        </div>
      </section>

      {/* User Tabs */}
      <section className="py-16 bg-white dark:bg-slate-800 overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto">
          <Tabs defaultValue="patients" className="w-full">
            <motion.div
              className="flex justify-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="patients">For Patients</TabsTrigger>
                <TabsTrigger value="professionals">For Medical Professionals</TabsTrigger>
              </TabsList>
            </motion.div>

            <TabsContent value="patients" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <motion.div
                  className="order-2 md:order-1"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7 }}
                >
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Empowering Patients</h2>
                  <div className="space-y-4 text-slate-700 dark:text-slate-300">
                    <p>
                      Our platform puts you in control of your healthcare journey by providing easy access to your
                      medical information and direct communication with your healthcare providers.
                    </p>
                    <p>
                      No more fragmented records or waiting days for test results. With MedSpectra, you can view your
                      complete medical history, receive timely feedback from your doctors, and actively participate in
                      your care decisions.
                    </p>
                  </div>
                </motion.div>
                <motion.div
                  className="order-1 md:order-2 relative h-[400px] rounded-lg overflow-hidden shadow-lg"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Image
                    src="/empowering-pacients.png"
                    alt="Patient features"
                    fill
                    className="object-cover"
                  />
                </motion.div>
              </div>

              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                {[
                  {
                    icon: <FileText className="h-8 w-8 text-blue-500" />,
                    title: "Centralized Medical Records",
                    description:
                      "Access your complete medical history, test results, and prescriptions in one secure location.",
                  },
                  {
                    icon: <MessageSquare className="h-8 w-8 text-blue-500" />,
                    title: "Secure Messaging",
                    description:
                      "Communicate directly with your healthcare providers through our encrypted messaging system.",
                  },
                  {
                    icon: <Calendar className="h-8 w-8 text-blue-500" />,
                    title: "Appointment Management",
                    description: "Schedule, reschedule, or cancel appointments with ease and receive reminders.",
                  },
                  {
                    icon: <Bell className="h-8 w-8 text-blue-500" />,
                    title: "Medication Reminders",
                    description: "Set up personalized reminders for medications and treatment plans.",
                  },
                  {
                    icon: <Smartphone className="h-8 w-8 text-blue-500" />,
                    title: "Mobile Access",
                    description: "Access your health information anytime, anywhere through our mobile app.",
                  },
                  {
                    icon: <Lock className="h-8 w-8 text-blue-500" />,
                    title: "Privacy Controls",
                    description: "Manage who can access your medical information with granular privacy settings.",
                  },
                ].map((feature, index) => (
                  <motion.div key={index} variants={item}>
                    <Card className="border-blue-100 dark:border-slate-700 h-full overflow-hidden group">
                      <CardHeader>
                        <motion.div
                          className="mb-2"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          {feature.icon}
                        </motion.div>
                        <CardTitle>{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-slate-600 dark:text-slate-400">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>

            <TabsContent value="professionals" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <motion.div
                  className="relative h-[400px] rounded-lg overflow-hidden shadow-lg"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Image
                    src="/medical-practice-types.jpg"
                    alt="Professional features"
                    fill
                    className="object-cover"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7 }}
                >
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Enhancing Medical Practice</h2>
                  <div className="space-y-4 text-slate-700 dark:text-slate-300">
                    <p>
                      Our platform streamlines your workflow by providing comprehensive patient information at your
                      fingertips, enabling more informed clinical decisions.
                    </p>
                    <p>
                      With MedSpectra, you can review patient data efficiently, communicate securely with patients, and
                      collaborate with other healthcare providers—all while maintaining HIPAA compliance.
                    </p>
                  </div>
                </motion.div>
              </div>

              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                {[
                  {
                    icon: <ClipboardList className="h-8 w-8 text-green-500" />,
                    title: "Comprehensive Patient Profiles",
                    description:
                      "View complete patient histories, test results, and treatment plans in a unified interface.",
                  },
                  {
                    icon: <MessageSquare className="h-8 w-8 text-green-500" />,
                    title: "Secure Communication",
                    description: "Exchange HIPAA-compliant messages with patients and other healthcare providers.",
                  },
                  {
                    icon: <BarChart className="h-8 w-8 text-green-500" />,
                    title: "Analytics Dashboard",
                    description: "Track patient outcomes and practice metrics with customizable analytics tools.",
                  },
                  {
                    icon: <Users className="h-8 w-8 text-green-500" />,
                    title: "Team Collaboration",
                    description: "Collaborate with specialists and other providers on complex cases.",
                  },
                  {
                    icon: <Calendar className="h-8 w-8 text-green-500" />,
                    title: "Scheduling System",
                    description: "Manage your appointments and patient follow-ups efficiently.",
                  },
                  {
                    icon: <Lock className="h-8 w-8 text-green-500" />,
                    title: "Compliance Tools",
                    description:
                      "Ensure all patient interactions meet regulatory requirements with built-in compliance features.",
                  },
                ].map((feature, index) => (
                  <motion.div key={index} variants={item}>
                    <Card className="border-green-100 dark:border-slate-700 h-full overflow-hidden group">
                      <CardHeader>
                        <motion.div
                          className="mb-2"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          {feature.icon}
                        </motion.div>
                        <CardTitle>{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-slate-600 dark:text-slate-400">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900 overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-[800px] mx-auto">
              Our platform connects patients and medical professionals through a simple, secure process.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: "Patient Data Upload",
                description:
                  "Patients securely upload their medical information or connect existing health records to our platform.",
              },
              {
                step: 2,
                title: "Medical Review",
                description:
                  "Healthcare professionals access and review patient data, providing feedback and recommendations.",
              },
              {
                step: 3,
                title: "Secure Communication",
                description:
                  "Patients and providers communicate through our secure messaging system to discuss findings and next steps.",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm text-center relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{
                  y: -5,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
              >
                <motion.div
                  className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{step.step}</span>
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{step.description}</p>
                {index < 2 && (
                  <motion.div
                    className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-blue-500"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <ArrowRight size={24} />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section (replacing pricing) */}
      <section className="py-16 bg-white dark:bg-slate-800 overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Our Healthcare Partners</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-[800px] mx-auto">
              We collaborate with leading healthcare institutions to provide the best service.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {[
              { name: "AMCR", image: "/amcr.png" },
              { name: "Marie Curie", image: "/ms-curie.png" },
              { name: "Medicover", image: "/medicover.jpg" },
              { name: "Regina Maria", image: "/regina-maria.jpg" }
            ].map((partner) => (
              <motion.div 
                key={partner.name} 
                className="w-40 h-40 relative flex items-center justify-center bg-white dark:bg-slate-700 rounded-lg p-4" 
                variants={item} 
                whileHover={{ scale: 1.05 }}
              >
                <div className="relative w-32 h-32">
                  <Image
                    src={partner.image}
                    alt={`${partner.name} Healthcare Partner`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600 dark:bg-blue-800 overflow-hidden relative">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />

        <div className="container px-4 md:px-6 mx-auto text-center relative z-10">
          <motion.h2
            className="text-3xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            Ready to Transform Your Healthcare Experience?
          </motion.h2>
          <motion.p
            className="text-xl text-blue-100 mb-8 max-w-[800px] mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Join thousands of healthcare professionals and patients who are already using our platform.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <Link href="/signup" passHref>
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 group">
                Get Started
                <motion.span className="ml-2" initial={{ x: 0 }} whileHover={{ x: 5 }}>
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </Button>
            </Link>
            <Link href="/contact" passHref>
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 group">
                Schedule a demo
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
   </div>
  )
}


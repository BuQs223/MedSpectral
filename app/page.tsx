"use client"

import Hero from "./components/Hero"
import WearYourStory from "./components/WearYourStory"
import FeatureCarousel from "./components/FeatureCarousel"
import PortfolioGrid from "./components/PortfolioGrid"
import Timeline from "./components/Timeline"
import Marquee from "./components/Marquee"
import ContactForm from "./components/ContactForm"
import NewsletterSubscribe from "./components/NewsletterSubscribe"
import Header from "./components/Header"

// export default function Home() {
//   return (
//     <>
//       <Header />

//       <Hero />

//       <WearYourStory />
//       <FeatureCarousel />
//       <Marquee />

//       <Timeline />
//       <ContactForm />
//       <NewsletterSubscribe />
//     </>
//   )
// }


import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Shield, Users, FileText, Clock, Star } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"

export default function Home() {
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
      <section className="relative bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 py-20 md:py-28 overflow-hidden">
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
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <motion.div
              className="flex-1 space-y-4"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <motion.h1
                className="text-3xl md:text-5xl font-bold tracking-tighter text-blue-600 dark:text-blue-400"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                Empowering Healthcare, Enhancing Lives
              </motion.h1>
              <motion.p
                className="text-lg md:text-xl text-slate-700 dark:text-slate-300 max-w-[600px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                Centralize patient data, streamline communication, and improve healthcare outcomes with our secure
                platform.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-3 pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
              >
                <Link href="/register" passHref prefetch={true}>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white group">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/services" passHref prefetch={true}>
                  <Button size="lg" variant="outline" className="group">
                    Learn More
                    <motion.span
                      className="ml-1"
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 1 }}
                    >
                      →
                    </motion.span>
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                className="flex items-center gap-4 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.8 }}
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 overflow-hidden bg-slate-200"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.8 + i * 0.1 }}
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    >
                      <Image src={`/placeholder.svg?height=32&width=32&text=${i}`} alt="User" width={32} height={32} />
                    </motion.div>
                  ))}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Trusted by <span className="font-bold">2,000+</span> healthcare professionals
                </p>
              </motion.div>
            </motion.div>
            <motion.div
              className="flex-1 relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <motion.div
                className="relative w-full h-[400px] rounded-lg overflow-hidden shadow-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src="/homepage-photo.jpg"
                  alt="Healthcare platform interface"
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>
              <motion.div
                className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-700 p-4 rounded-lg shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-10 w-10 text-green-500" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">HIPAA Compliant</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Your data is secure</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-slate-800 overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Our vision</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-[800px] mx-auto">
              We envision a platform that offers a comprehensive solution for both patients and medical professionals.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {[
              {
                icon: <FileText className="h-10 w-10 text-blue-500" />,
                title: "Centralized Patient Records",
                description:
                  "Access all patient data in one secure location, including medical history, test results, and medications.",
              },
              {
                icon: <Users className="h-10 w-10 text-blue-500" />,
                title: "Direct Communication",
                description:
                  "Connect patients with their healthcare providers through secure messaging and virtual consultations.",
              },
              {
                icon: <Clock className="h-10 w-10 text-blue-500" />,
                title: "Timely Reviews",
                description:
                  "Medical professionals can quickly review patient data and provide feedback, reducing wait times.",
              },
              {
                icon: <Shield className="h-10 w-10 text-blue-500" />,
                title: "Integrated AI ",
                description:
                  "Our platform integrates AI to enhance the user experience, making processes smarter and more efficient.",
              },
              {
                icon: <CheckCircle className="h-10 w-10 text-blue-500" />,
                title: "Medical tools",
                description:
                  "Medics can securely manage patient records, upload and analyze DICOM images, and collaborate with peers through anonymous case sharing.",
              },
              {
                icon: <Star className="h-10 w-10 text-blue-500" />,
                title: "Patient Empowerment",
                description: "Patients gain better understanding and control over their healthcare journey.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                variants={item}
                whileHover={{
                  y: -5,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
              >
                <motion.div
                  className="mb-4"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Industry Recognition Section (replacing testimonials) */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900 overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Reviews</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-[800px] mx-auto">
              Our users' feedback drives our commitment to excellence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
            >
              <div className="h-32 w-32 mx-auto mb-4 relative">
                <Image
                  src="/adi.jpg"
                  alt="Healthcare Innovation Award"
                  width={128}
                  height={128}
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2">Dr. Adrian B.</h3>
              <p className="text-slate-600 dark:text-slate-300 text-center">
                This platform has completely transformed the way I analyze medical images. The AI-powered DICOM tools
                save me hours of work, and the anonymous case-sharing feature allows me to collaborate with specialists
                worldwide. A must-have for modern healthcare!
              </p>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
            >
              <div className="h-32 w-32 mx-auto mb-4 relative">
                <Image
                  src="/timo.jpg"
                  alt="HIPAA Compliance Certification"
                  width={128}
                  height={128}
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2">Dr. Timothy M.</h3>
              <p className="text-slate-600 dark:text-slate-300 text-center">
                The integration of AI in diagnostics has improved accuracy and efficiency in my practice. I can focus
                more on patient care while the system handles data organization and predictive insights. Highly
                recommended for any medical professional!
              </p>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
            >
              <div className="h-32 w-32 mx-auto mb-4 relative">
                <Image
                  src="/alex.jpg"
                  alt="Health Tech Innovator"
                  width={128}
                  height={128}
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2">Pacient Alex B.</h3>
              <p className="text-slate-600 dark:text-slate-300 text-center">
                Having access to my medical history in one place has made managing my health so much easier. I no longer
                have to worry about losing documents or repeating tests. The platform is user-friendly, secure, and a
                game-changer for patients like me!
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white dark:bg-slate-800 overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Making a Difference in Healthcare</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-[800px] mx-auto">
              Our platform is transforming how healthcare professionals and patients interact.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "94%", label: "Reduction in administrative time" },
              { value: "78%", label: "Faster patient data access" },
              { value: "2,000+", label: "Healthcare professionals" },
              { value: "15,000+", label: "Patients served" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <motion.p
                  className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2"
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 10,
                    delay: 0.3 + index * 0.1,
                  }}
                >
                  {stat.value}
                </motion.p>
                <p className="text-slate-700 dark:text-slate-300">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
            Ready to Transform Healthcare Communication?
          </motion.h2>
          <motion.p
            className="text-xl text-blue-100 mb-8 max-w-[800px] mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Join thousands of healthcare professionals and patients who are already benefiting from our platform.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <Link href="/register" passHref prefetch={true}>
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 group">
                Sign Up Now
                <motion.span className="ml-1" initial={{ x: 0 }} whileHover={{ x: 5 }}>
                  →
                </motion.span>
              </Button>
            </Link>
            <Link href="/contact" passHref prefetch={true}>
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 group">
                Contact Us
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
   </div>
  )
}


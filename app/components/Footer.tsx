import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2" prefetch={true}>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">MedSpectra</span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs">
              Connecting patients and medical professionals through secure, accessible technology for better healthcare
              outcomes.
            </p>
            <div className="flex space-x-4">
              <Link
              prefetch={true}
                href="#"
                className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
              >
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
              prefetch={true}
                href="#"
                className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
              >
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
              prefetch={true}
                href="#"
                className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
              >
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
              prefetch={true}
                href="#"
                className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
              >
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-5 w-5" />
                prefetch={true}
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/about", label: "About Us" },
                { href: "/services", label: "Services" },
                { href: "#", label: "Careers" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                  prefetch={true}
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-2">
              {[
                { href: "#", label: "Privacy Policy" },
                { href: "#", label: "Terms of Service" },
                { href: "#", label: "GDPR Compliance" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Mail className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                <span className="text-sm text-slate-600 dark:text-slate-400">info@medspectra.com</span>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                <span className="text-sm text-slate-600 dark:text-slate-400">(555) 123-4567</span>
              </li>
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Rodnei nr.1
                  <br />
                  
                 Timisoara
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-center text-slate-600 dark:text-slate-400">
            &copy; {new Date().getFullYear()} MedSpectra. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
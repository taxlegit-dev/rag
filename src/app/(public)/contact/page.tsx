import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Users,
  Shield,
  ArrowRight,
} from "lucide-react";
import ContactForm from "@/components/shared/ContactPage";

const ContactPage: React.FC = () => {
  const contactDetails = [
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Email",
      info: "contact@icfr.com",
      description: "General inquiries",
    },
    {
      icon: <Phone className="w-5 h-5" />,
      title: "Phone",
      info: "+1 (555) 123-4567",
      description: "Mon-Fri, 9AM–6PM PST",
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Office",
      info: "San Francisco, CA",
      description: "Headquarters",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Response Time",
      info: "Within 24 hours",
      description: "For all inquiries",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* ================= HERO SECTION ================= */}
      <section className="h-[400px] relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container h-full mx-auto px-4 flex items-center justify-center relative z-10">
          <div className="max-w-3xl text-center">
            {/* Badge */}
            <span className="inline-block mb-4 px-4 py-1 text-sm rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Trusted by 500+ Businesses
            </span>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Get in <span className="text-purple-400">Touch</span> With Our
              Experts
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-300 mb-6">
              Whether you need compliance support, financial reporting, or
              operational guidance — ICFR helps businesses scale securely and
              efficiently.
            </p>

            {/* Points */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-300 mb-6">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                Secure & Confidential
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                Expert Consultation
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                Fast Response Time
              </div>
            </div>

            {/* CTAs */}
            <div className="flex justify-center gap-4">
              <a
                href="#contact-form"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition"
              >
                Talk to an Expert
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="mailto:contact@icfr.com"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition"
              >
                Email Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CONTACT SECTION ================= */}
      <section className=" py-12">
        <div className="container h-full mx-auto px-4">
          <div className="h-full grid lg:grid-cols-2 gap-12">
            {/* Left - Info */}
            <div className="h-full flex flex-col justify-center">
              <h2 className="text-4xl font-bold text-white mb-8">
                Contact Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {contactDetails.map((detail, index) => (
                  <div
                    key={index}
                    className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 hover:border-purple-500/30 transition"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-purple-900/20 rounded-lg text-purple-400">
                        {detail.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">
                          {detail.title}
                        </h3>
                        <p className="text-white text-lg mb-1">{detail.info}</p>
                        <p className="text-gray-400 text-sm">
                          {detail.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4 text-gray-400">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5" />
                  24/7 chat support available
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5" />
                  Dedicated account managers
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5" />
                  Encrypted & secure communication
                </div>
              </div>
            </div>

            {/* Right - Form */}
            <div
              id="contact-form"
              className="h-full flex flex-col justify-center"
            >
              <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Send us a Message
                </h3>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;

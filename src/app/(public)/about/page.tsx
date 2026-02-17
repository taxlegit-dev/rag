import React from "react";
import {
  Target,
  Zap,
  Shield,
  Users,
  CheckCircle,
  FileText,
  CloudLightning,
  BarChart,
  Download,
  Globe,
  ArrowRight,
} from "lucide-react";

interface AboutSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const AboutSection: React.FC<AboutSectionProps> = ({
  title,
  description,
  icon,
}) => (
  <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg hover:shadow-xl hover:border-purple-500/30 transition-all duration-300 hover:translate-y-[-2px]">
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0 p-2 bg-gray-900 rounded-lg border border-gray-700">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  </div>
);

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-5 md:py-10">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />

        <div className="container relative mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            {/* Animated badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-purple-600/20 border border-purple-500/30 rounded-full px-4 py-2 mb-8 animate-fade-in">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping" />
              <span className="text-sm font-medium text-purple-300">
                The Future of SOP Automation
              </span>
            </div>

            {/* Main heading with gradient */}
            <h1 className="text-xl md:text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-300">
                About ICFR
              </span>
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-900 via-purple-200 to-purple-800">
                Intelligent SOP Platform
              </span>
            </h1>

            {/* Subtitle with glow */}
            <p className="text-xl font-medium text-gray-300 mb-8 max-w-3xl mx-auto drop-shadow-lg">
              Transforming{" "}
              <span className="text-purple-400 font-bold">
                Operational Excellence
              </span>{" "}
              Through
              <span className="text-purple-400 font-bold">
                {" "}
                AI-Powered
              </span>{" "}
              Automation
            </p>

            {/* Stats preview */}
            <div className="flex flex-wrap justify-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-white">10x</div>
                <div className="text-gray-400 text-sm">
                  Faster Documentation
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white">99%</div>
                <div className="text-gray-400 text-sm">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white">50+</div>
                <div className="text-gray-400 text-sm">Industries Served</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Problem Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gray-800 border border-gray-700 p-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <Target className="w-8 h-8 text-purple-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">Our Mission</h2>
            </div>
            <p className="text-gray-300 text-lg">
              To empower fast-growing businesses to scale efficiently by
              automating and simplifying their process documentation. We help
              teams turn complex workflows into clear, easy-to-follow playbooks
              that anyone can execute, ensuring consistency, quality, and
              compliance.
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 p-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <Shield className="w-8 h-8 text-red-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">
                The Problem We Solve
              </h2>
            </div>
            <p className="text-gray-300 text-lg">
              Manual SOP creation is slow, inconsistent, and often neglected. It
              can take weeks to document a single process, and the results are
              frequently outdated, hard to understand, or locked away in static
              files. This creates operational risk, stifles growth, and
              demotivates teams who lack clear guidance.
            </p>
          </div>
        </div>

        {/* Solution Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Our Solution: An Intuitive, AI-Powered Platform
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              ICFR is the intuitive SOP platform designed for the modern
              business. We combine advanced AI technology with a user-friendly
              interface to solve this problem.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AboutSection
              title="AI-Powered Generation"
              description="Transform your business processes into comprehensive, step-by-step SOPs in minutes, not weeks."
              icon={<FileText className="w-6 h-6 text-purple-400" />}
            />
            <AboutSection
              title="Comprehensive & Smart"
              description="We go beyond basic steps to document subprocesses, identify potential risks, and suggest mitigation strategies."
              icon={<CheckCircle className="w-6 h-6 text-green-400" />}
            />
            <AboutSection
              title="Built for Speed & Scale"
              description="Generate multiple processes in parallel and export in ready-to-use formats like PDF and Excel."
              icon={<CloudLightning className="w-6 h-6 text-purple-400" />}
            />
            <AboutSection
              title="Universal Application"
              description="Industry-agnostic platform working for manufacturing, services, trading, and any business model."
              icon={<Globe className="w-6 h-6 text-indigo-400" />}
            />
            <AboutSection
              title="Risk Management"
              description="Every step comes with identified risks and proven mitigation strategies."
              icon={<Shield className="w-6 h-6 text-red-400" />}
            />
            <AboutSection
              title="Export Ready"
              description="Download your SOPs in PDF and editable Excel formats with professional watermarking."
              icon={<Download className="w-6 h-6 text-orange-400" />}
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-black border border-gray-700 rounded-2xl p-8 mb-16 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-4">
              Impact in Numbers
            </h2>
            <p className="text-gray-400 text-lg">
              Helping businesses achieve operational excellence
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">10x</div>
              <div className="text-gray-400">Faster SOP Creation</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">100%</div>
              <div className="text-gray-400">Customized Output</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">50+</div>
              <div className="text-gray-400">Business Processes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-400">Access Anytime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="container mx-auto px-4 py-12 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Our Core Values
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            The principles that guide everything we do at ICFR
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg hover:shadow-xl hover:border-yellow-500/30 transition-all duration-300">
            <Zap className="w-8 h-8 text-yellow-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Simplicity First
            </h3>
            <p className="text-gray-400">
              We make complex documentation intuitive and accessible.
            </p>
          </div>
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg hover:shadow-xl hover:border-green-500/30 transition-all duration-300">
            <Users className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Empowerment
            </h3>
            <p className="text-gray-400">
              We equip every team member with the knowledge they need to
              succeed.
            </p>
          </div>
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg hover:shadow-xl hover:border-purple-500/30 transition-all duration-300">
            <BarChart className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Speed & Efficiency
            </h3>
            <p className="text-gray-400">
              We value your time, automating the tedious to free you for
              strategic work.
            </p>
          </div>
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg hover:shadow-xl hover:border-red-500/30 transition-all duration-300">
            <Shield className="w-8 h-8 text-red-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Reliability
            </h3>
            <p className="text-gray-400">
              We build a platform you can trust for accurate and secure
              documentation.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose ICFR Section */}
      <section className="bg-gradient-to-b from-gray-900 to-black border-t border-gray-800 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Why Choose ICFR?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              We are more than just a tool; we are a partner in your operational
              excellence. With ICFR, you keep processes clean, teams motivated,
              and your business scalable. We help you build a living library of
              knowledge that grows with your company.
            </p>
            <div className="text-2xl font-bold text-purple-400 mb-12">
              Let&apos;s build the playbook for your success.
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-all duration-300 font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-purple-500/25">
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="border border-purple-400 text-purple-400 px-8 py-3 rounded-lg hover:bg-purple-400 hover:text-gray-900 transition-all duration-300 font-semibold">
                Schedule a Demo
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

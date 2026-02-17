import React from "react";
import { Sparkles } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";

export const Footer = () => {
  return (
    <footer className="relative z-10 bg-slate-900 border-t border-purple-500/20 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <span className="text-xl font-bold text-white">
                SOP<span className="text-purple-400">AI</span>
              </span>
            </div>
            <p className="text-gray-400">
              AI-powered SOP generation for modern businesses
            </p>
            <p className="text-white font-semibold my-2">Contact Us:</p>
            <p className="text-gray-400">+91-8929218091</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/about" className="hover:text-purple-400 transition">
                  About
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-purple-400 transition">
                  Contact
                </a>
              </li>
              <li>
                <a href="/pricing" className="hover:text-purple-400 transition">
                  Pricing
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a
                  href="/privacypolicy"
                  className="hover:text-purple-400 transition"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/termandcondition"
                  className="hover:text-purple-400 transition"
                >
                  Terms & Condition
                </a>
              </li>
              <li>
                <a
                  href="/refundpolicy"
                  className="hover:text-purple-400 transition"
                >
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Social</h4>
            <div className="flex items-center gap-4 text-gray-400">
              <a
                href="https://www.instagram.com/taxlegit_/"
                className="hover:text-purple-400 transition"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/Taxlegitt/"
                className="hover:text-purple-400 transition"
              >
                <FaFacebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/taxlegitt/"
                className="hover:text-purple-400 transition"
              >
                <FaLinkedin className="w-5 h-5" />
              </a>
              <a
                href="https://www.youtube.com/channel/UC4s7kcn1qt7np_Ccce5hmHA"
                className="hover:text-purple-400 transition"
              >
                <FaYoutube className="w-5 h-5" />
              </a>
            </div>
            <div className="mt-4 text-gray-400 text-sm leading-relaxed">
              <p className="text-white font-semibold mb-2">Address:</p>
              <p>
                1117, Supertech Astralis, Sec-94, Noida, Uttar Pradesh-201301
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-purple-500/20 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 SOPAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

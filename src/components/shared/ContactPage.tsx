"use client";
import React, { useState } from "react";
import { User, Mail, Phone, Building, Send, Loader2 } from "lucide-react";

const SimpleContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    company: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    contact: "",
    company: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: "", contact: "", company: "" };

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!formData.contact.trim()) {
      newErrors.contact = "Email or phone is required";
      isValid = false;
    } else if (
      !isValidEmail(formData.contact) &&
      !isValidPhone(formData.contact)
    ) {
      newErrors.contact = "Enter valid email or phone";
      isValid = false;
    }

    if (!formData.company.trim()) {
      newErrors.company = "Company name is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone: string) => {
    return /^[\+]?[1-9][\d]{9,14}$/.test(phone.replace(/[\s\-\(\)]/g, ""));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Form submitted:", formData);
      alert("Thank you! We will contact you soon.");
      setFormData({ name: "", contact: "", company: "" });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-md mx-auto p-6 bg-gray-900/50 border border-gray-800 rounded-xl"
    >
      {/* Name Field */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.name ? "border-red-500" : "border-gray-700"
            }`}
            placeholder="Enter your name"
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-sm text-red-400">{errors.name}</p>
        )}
      </div>

      {/* Contact Field */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Email or Phone
        </label>
        <div className="relative">
          {formData.contact.includes("@") ? (
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
          ) : (
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
          )}
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.contact ? "border-red-500" : "border-gray-700"
            }`}
            placeholder="Email or phone number"
          />
        </div>
        {errors.contact && (
          <p className="mt-1 text-sm text-red-400">{errors.contact}</p>
        )}
      </div>

      {/* Company Field */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Company Name
        </label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.company ? "border-red-500" : "border-gray-700"
            }`}
            placeholder="Your company"
          />
        </div>
        {errors.company && (
          <p className="mt-1 text-sm text-red-400">{errors.company}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            Submit
          </>
        )}
      </button>
    </form>
  );
};

export default SimpleContactForm;

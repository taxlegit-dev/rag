"use client";
import { useState, ChangeEvent, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Package,
  DollarSign,
  Users,
  FileText,
  ArrowLeft,
  Save,
  Download,
  Star,
  CheckCircle,
  X,
  Plus,
  Sparkles,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

interface PlanForm {
  name: string;
  price: string;
  processLimit: string;
  subprocessLimit: string;
  description: string;
  ctaText: string;
  canDownloadProcess: boolean;
  canDownloadRCM: boolean;
  canDownloadPDF: boolean;
  popular: boolean;
  isActive: boolean;
  isDefault: boolean;
  features: string[];
}

export default function EditPlanPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;

  const [form, setForm] = useState<PlanForm>({
    name: "",
    price: "",
    processLimit: "",
    subprocessLimit: "",
    description: "",
    ctaText: "",
    canDownloadProcess: false,
    canDownloadRCM: false,
    canDownloadPDF: false,
    popular: false,
    isActive: true,
    isDefault: false,
    features: [],
  });
  const [newFeature, setNewFeature] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(async () => {
    if (!planId) return;

    try {
      setFetching(true);
      setError(null);
      const res = await fetch(`/api/plans/${planId}`);

      if (!res.ok) {
        throw new Error("Failed to fetch plan details");
      }

      const plan = await res.json();
      setForm({
        name: plan.name || "",
        price: plan.price?.toString() || "",
        processLimit: plan.processLimit?.toString() || "",
        subprocessLimit: plan.subprocessLimit?.toString() || "",
        description: plan.description || "",
        ctaText: plan.ctaText || "",
        canDownloadProcess: plan.canDownloadProcess || false,
        canDownloadRCM: plan.canDownloadRCM || false,
        canDownloadPDF: plan.canDownloadPDF || false,
        popular: plan.popular || false,
        isActive: plan.isActive !== undefined ? plan.isActive : true,
        isDefault: plan.isDefault || false,
        features: plan.features || [],
      });
    } catch (error) {
      console.error("Error fetching plan:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch plan details"
      );
    } finally {
      setFetching(false);
    }
  }, [planId]);

  useEffect(() => {
    if (planId) {
      fetchPlan();
    } else {
      setFetching(false);
      setError("Plan ID is missing");
    }
  }, [planId, fetchPlan]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim() && !form.features.includes(newFeature.trim())) {
      setForm((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleFeatureKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddFeature();
    }
  };

  const handleSubmit = async () => {
    if (!planId) {
      setError("Plan ID is missing");
      return;
    }

    // Validation
    if (!form.name.trim()) {
      setError("Plan name is required");
      return;
    }
    if (!form.price || Number(form.price) < 0) {
      setError("Price must be a positive number");
      return;
    }
    if (!form.processLimit || Number(form.processLimit) < 0) {
      setError("Process limit must be a non-negative number");
      return;
    }
    if (!form.subprocessLimit || Number(form.subprocessLimit) < 0) {
      setError("Subprocess limit must be a non-negative number");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/plans/${planId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          processLimit: Number(form.processLimit),
          subprocessLimit: Number(form.subprocessLimit),
        }),
      });

      if (res.ok) {
        alert("Plan updated successfully!");
        router.push("/admin/dashboard/pricing");
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update plan");
      }
    } catch (error) {
      console.error("Error updating plan:", error);
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSubmit();
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading plan details...</p>
        </div>
      </div>
    );
  }

  if (error && !form.name) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Error</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={() => router.push("/admin/dashboard/pricing")}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Back to Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div
          className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute -bottom-32 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => router.push("/admin/dashboard/pricing")}
          className="group mb-8 inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-all duration-300"
        >
          <div className="p-2 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:bg-indigo-50">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="font-medium">Back to Plans</span>
        </button>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Edit Plan</h1>
          <p className="text-slate-600">Update {form.name} plan details</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 backdrop-blur-sm">
            <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8 sm:p-10 space-y-8" onKeyDown={handleKeyPress}>
            {/* Plan Name */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <Package className="w-4 h-4 text-white" />
                </div>
                Plan Name *
              </label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g., Premium, Enterprise, Starter"
                className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-300"
                required
              />
            </div>

            {/* Price and Duration Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Price */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <div className="p-1.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  Price (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">
                    ₹
                  </span>
                  <input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="999"
                    min="0"
                    step="1"
                    className="w-full pl-10 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Limits Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Process Limit */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <div className="p-1.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  Process Limit *
                </label>
                <input
                  name="processLimit"
                  type="number"
                  value={form.processLimit}
                  onChange={handleChange}
                  placeholder="10"
                  min="0"
                  step="1"
                  className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300"
                  required
                />
                <p className="text-xs text-slate-500 mt-2">
                  Maximum number of processes
                </p>
              </div>

              {/* Subprocess Limit */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <div className="p-1.5 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  Subprocess Limit *
                </label>
                <input
                  name="subprocessLimit"
                  type="number"
                  value={form.subprocessLimit}
                  onChange={handleChange}
                  placeholder="50"
                  min="0"
                  step="1"
                  className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-100 outline-none transition-all duration-300"
                  required
                />
                <p className="text-xs text-slate-500 mt-2">
                  Maximum subprocesses per process
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <div className="p-1.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                Features
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={handleFeatureKeyPress}
                    placeholder="Add a feature (e.g., PDF downloads, Priority support)"
                    className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    disabled={!newFeature.trim()}
                    className="px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                {/* Features List */}
                {form.features.length > 0 && (
                  <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">
                      Plan Features ({form.features.length})
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {form.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-slate-200"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-slate-700">{feature}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(index)}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Text */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                Button Text
              </label>
              <input
                name="ctaText"
                type="text"
                value={form.ctaText}
                onChange={handleChange}
                placeholder="e.g., Get Started, Choose Plan, Start Free Trial"
                className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 outline-none transition-all duration-300"
              />
              <p className="text-xs text-slate-500 mt-2">
                Text displayed on the plan button
              </p>
            </div>

            {/* Description */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe what's included in this plan..."
                className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 outline-none transition-all duration-300 resize-none"
              />
            </div>

            {/* Toggle Options */}
            <div className="grid md:grid-cols-6 gap-6">
              {/* Download Process Access */}
              <div className="group">
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 mb-3">
                  <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg">
                    <Download className="w-4 h-4 text-white" />
                  </div>
                  Process Download
                </label>
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="canDownloadProcess"
                      checked={form.canDownloadProcess}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                  <span className="text-slate-700 font-medium">
                    {form.canDownloadProcess ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Allow users to download process documents
                </p>
              </div>

              {/* Download RCM Access */}
              <div className="group">
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 mb-3">
                  <div className="p-1.5 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg">
                    <Download className="w-4 h-4 text-white" />
                  </div>
                  RCM Download
                </label>
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="canDownloadRCM"
                      checked={form.canDownloadRCM}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                  </label>
                  <span className="text-slate-700 font-medium">
                    {form.canDownloadRCM ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Allow users to download RCM documents
                </p>
              </div>

              {/* Download PDF Access */}
              <div className="group">
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 mb-3">
                  <div className="p-1.5 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg">
                    <Download className="w-4 h-4 text-white" />
                  </div>
                  PDF Download
                </label>
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="canDownloadPDF"
                      checked={form.canDownloadPDF}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                  </label>
                  <span className="text-slate-700 font-medium">
                    {form.canDownloadPDF ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Allow users to download PDF documents
                </p>
              </div>

              {/* Popular Plan */}
              <div className="group">
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 mb-3">
                  <div className="p-1.5 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  Popular Plan
                </label>
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="popular"
                      checked={form.popular}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                  <span className="text-slate-700 font-medium">
                    {form.popular ? "Featured" : "Standard"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Highlight this as a popular plan
                </p>
              </div>

              {/* Active Status */}
              <div className="group">
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 mb-3">
                  <div className="p-1.5 bg-gradient-to-br from-slate-500 to-slate-700 rounded-lg">
                    {form.isActive ? (
                      <Eye className="w-4 h-4 text-white" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-white" />
                    )}
                  </div>
                  Plan Status
                </label>
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-600"></div>
                  </label>
                  <span className="text-slate-700 font-medium">
                    {form.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Make this plan available to users
                </p>
              </div>

              {/* Default Plan */}
              <div className="group">
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 mb-3">
                  <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  Default Plan
                </label>
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={form.isDefault}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                  <span className="text-slate-700 font-medium">
                    {form.isDefault ? "Default" : "Not Default"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Set this as the default plan for new users
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-8 sm:px-10 py-6 border-t border-slate-200 flex flex-col-reverse sm:flex-row gap-4 sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/admin/dashboard/pricing")}
              disabled={loading}
              className="px-8 py-3.5 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Update Plan
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/40 shadow-sm text-center">
            <div className="text-2xl font-bold text-slate-900">
              ₹{form.price || "0"}
            </div>
            <div className="text-sm text-slate-600">Price</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/40 shadow-sm text-center">
            <div className="text-2xl font-bold text-slate-900">
              {form.processLimit || "0"}
            </div>
            <div className="text-sm text-slate-600">Processes</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/40 shadow-sm text-center">
            <div className="text-2xl font-bold text-slate-900">
              {form.subprocessLimit || "0"}
            </div>
            <div className="text-sm text-slate-600">Subprocesses</div>
          </div>
        </div>
      </div>
    </div>
  );
}

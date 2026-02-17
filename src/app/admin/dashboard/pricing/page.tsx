"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  Users,
  CheckCircle,
  AlertCircle,
  Download,
  Star,
  Package,
  Zap,
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  processLimit: number;
  subprocessLimit: number;
  description?: string;
  ctaText?: string;
  canDownloadProcess: boolean;
  canDownloadRCM: boolean;
  popular: boolean;
  isActive: boolean;
  features: string[];
}

export default function AdminPricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/plans");
      if (!res.ok) throw new Error("Failed to fetch plans");
      const data = await res.json();
      setPlans(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (plan: Plan) => {
    setPlanToDelete(plan);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!planToDelete) return;
    setDeleteLoading(planToDelete.id);

    try {
      const res = await fetch(`/api/plans/${planToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete plan");

      setPlans((prev) => prev.filter((plan) => plan.id !== planToDelete.id));
      setShowDeleteModal(false);
      setPlanToDelete(null);
    } catch {
      setError("Failed to delete plan. Please try again.");
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Pricing Plans
              </h1>
              <p className="text-slate-600">
                Create and manage subscription plans for your users
              </p>
            </div>

            <button
              onClick={() => router.push("/admin/dashboard/pricing/new")}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Plan</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Total Plans
                </p>
                <p className="text-4xl font-bold text-slate-900 mt-1">
                  {plans.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Active Plans
                </p>
                <p className="text-4xl font-bold text-slate-900 mt-1">
                  {plans.filter((plan) => plan.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Popular Plans
                </p>
                <p className="text-4xl font-bold text-slate-900 mt-1">
                  {plans.filter((plan) => plan.popular).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Plans List */}
        {plans.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No plans available
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Create your first pricing plan to start offering subscriptions to
              your users
            </p>
            <button
              onClick={() => router.push("/admin/dashboard/pricing/new")}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your First Plan</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white border-2 rounded-lg p-6 transition-all ${
                  plan.popular
                    ? "border-blue-600 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 shadow-sm"
                } ${!plan.isActive ? "opacity-60" : ""}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Left Section - Plan Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-bold text-slate-900">
                            {plan.name}
                          </h2>
                          {plan.popular && (
                            <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded">
                              <Star className="w-3 h-3" />
                              POPULAR
                            </span>
                          )}
                          {!plan.isActive && (
                            <span className="inline-flex items-center bg-slate-200 text-slate-600 text-xs font-medium px-2 py-1 rounded">
                              Inactive
                            </span>
                          )}
                        </div>

                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-4xl font-bold text-slate-900">
                            ₹{plan.price}
                          </span>
                        </div>

                        {plan.description && (
                          <p className="text-slate-600 text-sm">
                            {plan.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Plan Limits - Horizontal */}
                    <div className="flex flex-wrap gap-6 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Processes</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {plan.processLimit}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-50 rounded flex items-center justify-center">
                          <Users className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Subprocesses</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {plan.subprocessLimit}
                          </p>
                        </div>
                      </div>

                      {(plan.canDownloadProcess || plan.canDownloadRCM) && (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-amber-50 rounded flex items-center justify-center">
                            <Download className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">
                              PDF Downloads
                            </p>
                            <p className="text-sm font-semibold text-slate-900">
                              {plan.canDownloadProcess && plan.canDownloadRCM
                                ? "Process & RCM"
                                : plan.canDownloadProcess
                                ? "Process"
                                : "RCM"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle Section - Features */}
                  {plan.features && plan.features.length > 0 && (
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-slate-600" />
                        Features
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {plan.features.slice(0, 4).map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 text-sm text-slate-600"
                          >
                            <div className="w-1 h-1 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="line-clamp-1">{feature}</span>
                          </div>
                        ))}
                      </div>
                      {plan.features.length > 4 && (
                        <p className="text-xs text-slate-500 mt-2">
                          +{plan.features.length - 4} more features
                        </p>
                      )}
                    </div>
                  )}

                  {/* Right Section - Actions */}
                  <div className="flex lg:flex-col gap-2 lg:w-32 flex-shrink-0">
                    <button
                      onClick={() =>
                        router.push(`/admin/dashboard/pricing/edit/${plan.id}`)
                      }
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="lg:hidden">Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteClick(plan)}
                      disabled={deleteLoading === plan.id}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="lg:hidden">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && planToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Delete Plan
                </h3>
                <p className="text-slate-600 text-sm mt-1">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
              <p className="font-semibold text-slate-900">
                {planToDelete.name}
              </p>

              {planToDelete.features && planToDelete.features.length > 0 && (
                <p className="text-xs text-slate-500 mt-2">
                  Includes {planToDelete.features.length} features
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading === planToDelete.id}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading === planToDelete.id ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </div>
                ) : (
                  "Delete Plan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

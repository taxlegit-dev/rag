"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import DepartmentForm from "@/components/userdashboard/DepartmentForm";
import DepartmentSection from "@/components/userdashboard/DepartmentSection";
import DeleteConfirmationModal from "@/components/userdashboard/DeleteConfirmationModal";

interface Department {
  id: string;
  name: string;
  createdAt: string;
}

export default function DepartmentsPage() {
  const { data: session } = useSession();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [deletingDepartment, setDeletingDepartment] =
    useState<Department | null>(null);

  const fetchDepartments = useCallback(async () => {
    if (!session?.user) return;

    try {
      const response = await fetch("/api/departments");
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session?.user) {
      fetchDepartments();
    }
  }, [fetchDepartments, session?.user]);

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isSubUser = session.user.role === "subuser";
  // const user = session.user;

  const handleDeleteDepartment = async (departmentId: string) => {
    try {
      const response = await fetch(`/api/departments/${departmentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDepartments((prev) => prev.filter((d) => d.id !== departmentId));
        // Also remove associated sub-users
        // Note: This might need adjustment based on your API
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete department");
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      alert("Something went wrong");
    }
  };

  return (
    <>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-white break-words">
          Departments
        </h1>
        <p className="text-gray-300 mt-2 text-sm md:text-base">
          Manage your departments
        </p>
      </div>

      {!isSubUser && (
        <DepartmentSection
          departments={departments}
          isSubUser={isSubUser}
          onAddDepartment={() => setShowDepartmentForm(true)}
          onDeleteDepartment={(dept) => setDeletingDepartment(dept)}
        />
      )}

      {showDepartmentForm && (
        <DepartmentForm
          onSuccess={() => {
            setShowDepartmentForm(false);
            fetchDepartments();
          }}
          onCancel={() => setShowDepartmentForm(false)}
        />
      )}

      <DeleteConfirmationModal
        isOpen={!!deletingDepartment}
        title="Delete Department"
        message={`Are you sure you want to delete ${deletingDepartment?.name}? This action cannot be undone and will remove all associated sub-users.`}
        onCancel={() => setDeletingDepartment(null)}
        onConfirm={() => {
          if (deletingDepartment) {
            handleDeleteDepartment(deletingDepartment.id);
            setDeletingDepartment(null);
          }
        }}
      />
    </>
  );
}

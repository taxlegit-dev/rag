"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import SubUserForm from "@/components/userdashboard/SubUserForm";
import EditSubUserForm from "@/components/userdashboard/EditSubUserForm";
import SubUserSection from "@/components/userdashboard/SubUserSection";
import DeleteConfirmationModal from "@/components/userdashboard/DeleteConfirmationModal";

interface Department {
  id: string;
  name: string;
  createdAt: string;
}

import { SubUser } from "../../../../types/index";

export default function SubUsersPage() {
  const { data: session } = useSession();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subUsers, setSubUsers] = useState<SubUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubUserForm, setShowSubUserForm] = useState(false);
  const [editingSubUser, setEditingSubUser] = useState<SubUser | null>(null);
  const [deletingSubUser, setDeletingSubUser] = useState<SubUser | null>(null);

  const fetchData = useCallback(async () => {
    if (!session?.user) return;

    try {
      const [departmentsRes, subUsersRes] = await Promise.all([
        fetch("/api/departments"),
        session.user.role !== "subuser"
          ? fetch("/api/subusers")
          : Promise.resolve(null),
      ]);

      const departmentsData = await departmentsRes.json();
      setDepartments(departmentsData);

      if (subUsersRes) {
        const subUsersData = await subUsersRes.json();
        setSubUsers(subUsersData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [fetchData, session?.user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

  const handleDeleteSubUser = async (subUserId: string) => {
    try {
      const response = await fetch(`/api/subusers/${subUserId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSubUsers((prev) => prev.filter((su) => su.id !== subUserId));
      } else {
        alert("Failed to delete sub-user");
      }
    } catch (error) {
      console.error("Error deleting sub-user:", error);
      alert("Something went wrong");
    }
  };

  return (
    <>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-white break-words">
          Sub-users
        </h1>
        <p className="text-gray-300 mt-2 text-sm md:text-base">
          Manage your sub-users
        </p>
      </div>

      {!isSubUser && (
        <SubUserSection
          subUsers={subUsers}
          isSubUser={isSubUser}
          onAddSubUser={() => setShowSubUserForm(true)}
          onEditSubUser={(subUser) => setEditingSubUser(subUser)}
          onDeleteSubUser={(subUser) => setDeletingSubUser(subUser)}
        />
      )}

      {showSubUserForm && (
        <SubUserForm
          onSuccess={() => {
            setShowSubUserForm(false);
            fetchData();
          }}
          onCancel={() => setShowSubUserForm(false)}
        />
      )}

      {editingSubUser && (
        <EditSubUserForm
          subUser={editingSubUser}
          departments={departments}
          onSuccess={() => {
            setEditingSubUser(null);
            fetchData();
          }}
          onCancel={() => setEditingSubUser(null)}
        />
      )}

      <DeleteConfirmationModal
        isOpen={!!deletingSubUser}
        title="Delete Sub-user"
        message={`Are you sure you want to delete ${deletingSubUser?.name}? This action cannot be undone.`}
        onCancel={() => setDeletingSubUser(null)}
        onConfirm={() => {
          if (deletingSubUser) {
            handleDeleteSubUser(deletingSubUser.id);
            setDeletingSubUser(null);
          }
        }}
      />
    </>
  );
}

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import DashboardOverview from "@/components/userdashboard/DashboardOverview";

interface Department {
  id: string;
  name: string;
  createdAt: string;
}

import { SubUser } from "../../../types/index";

export default function DashboardOverviewPage() {
  const { data: session } = useSession();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subUsers, setSubUsers] = useState<SubUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [remainingProcesses, setRemainingProcesses] = useState<number | null>(
    null
  );
  const [remainingSubprocesses, setRemainingSubprocesses] = useState<
    number | null
  >(null);
  const [isAdminPlan, setIsAdminPlan] = useState(false);

  const fetchData = useCallback(async () => {
    if (!session?.user) return;

    try {
      const [departmentsRes, subUsersRes, planRes] = await Promise.all([
        fetch("/api/departments"),
        session.user.role !== "subuser"
          ? fetch("/api/subusers")
          : Promise.resolve(null),
        fetch("/api/user/plan"),
      ]);

      const departmentsData = await departmentsRes.json();
      setDepartments(departmentsData);

      if (subUsersRes) {
        const subUsersData = await subUsersRes.json();
        setSubUsers(subUsersData);
      }

      const planData = await planRes.json();
      setRemainingProcesses(planData.remainingProcesses);
      setRemainingSubprocesses(planData.remainingSubprocesses);
      setIsAdminPlan(planData.isAdmin ?? false);
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
  const user = session.user;

  return (
    <>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-white break-words">
          Welcome, {user.firstName} {user.lastName}
        </h1>
        <p className="text-gray-300 mt-2 text-sm md:text-base">
          {isSubUser
            ? `Department: ${departments[0]?.name || "N/A"}`
            : "Manage your departments and sub-users"}
        </p>
      </div>

      <DashboardOverview
        departments={departments}
        subUsers={subUsers}
        isSubUser={isSubUser}
        isAdmin={isAdminPlan}
        remainingProcesses={remainingProcesses}
        remainingSubprocesses={remainingSubprocesses}
      />
    </>
  );
}

"use client";
import { useEffect, useState, useMemo } from "react";
import { User, Shield, Clock, Search, Trash2 } from "lucide-react";

interface AppUser {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role: "ADMIN" | "USER" | string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // async function fetchUsers() {
  //   try {
  //     const res = await fetch("/api/users");
  //     if (!res.ok) throw new Error(`Error: ${res.status}`);
  //     const data = await res.json();
  //     setUsers(data);
  //   } catch (err: any) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  const getRoleBadgeColor = (role: string) =>
    role === "ADMIN"
      ? "bg-purple-100 text-purple-800"
      : "bg-blue-100 text-blue-800";

  const filteredUsers = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return users.filter((user) =>
      [user.firstName, user.lastName, user.email, user.phone]
        .filter((f): f is string => typeof f === "string")
        .some((field) => field.toLowerCase().includes(query))
    );
  }, [users, searchTerm]);

  const handleDeleteClick = (user: AppUser) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setDeleteLoading(userToDelete.id);

    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userToDelete.id }),
      });

      if (!res.ok) throw new Error("Failed to delete user");

      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch {
      setError("Failed to delete user");
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 border-b pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <User className="w-7 h-7 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-semibold text-gray-900">
                  Users Management
                </h1>
                <p className="text-sm text-gray-500">
                  Manage user accounts, roles, and access permissions
                </p>
              </div>
            </div>

            <div className="bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-2 rounded-full shadow-sm">
              Total Users:{" "}
              <span className="font-semibold">{filteredUsers.length}</span>
            </div>
          </div>

          {/* Search */}
          <div className="mt-6 relative max-w-sm">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm text-gray-500 placeholder-gray-400"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Role
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50"
                      } hover:bg-indigo-50 transition-colors duration-150`}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {user.email || (
                          <span className="text-gray-400 italic">
                            Not provided
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {user.phone || (
                          <span className="text-gray-400 italic">
                            Not provided
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          <Shield className="w-3 h-3" />
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteClick(user)}
                          disabled={deleteLoading === user.id}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-6 text-gray-500 italic"
                    >
                      No users found matching &quot;{searchTerm}&quot;
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this user? This action cannot
                  be undone.
                </p>
                <p className="mt-2 text-sm font-medium text-gray-900">
                  {userToDelete.firstName} {userToDelete.lastName} (
                  {userToDelete.email || "No email"})
                </p>
              </div>
              <div className="flex items-center px-4 py-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-900 text-base font-medium rounded-md w-full mr-2 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading === userToDelete.id}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full ml-2 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading === userToDelete.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

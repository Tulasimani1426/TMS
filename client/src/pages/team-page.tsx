import React, { useEffect, useState } from "react";
import axios from "axios";
import { NotificationToast } from "@/components//dashboard/notification-toast";

type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

const TeamPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    axios
      .get("/api/users")
      .then((res) => {
        setUsers(res.data);
        setToastMessage("Team members loaded successfully!");
        setToastOpen(true);
      })
      .catch(() => {
        setToastMessage("Failed to load team members");
        setToastOpen(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-4">Loading team members...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Team Members</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="p-4 border rounded-lg shadow bg-white dark:bg-gray-900"
          >
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-gray-600 text-sm">{user.email}</p>
            {user.role && (
              <span className="mt-1 inline-block text-xs text-blue-500">
                {user.role}
              </span>
            )}
          </div>
        ))}
      </div>

      <NotificationToast
        message={toastMessage}
        isOpen={toastOpen}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
};

export default TeamPage;

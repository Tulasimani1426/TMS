import { useEffect, useState } from "react";
import './tasks.css';
import { NotificationToast } from "@/components/dashboard/notification-toast";

// Define a simple task type
interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  dueDate: string;
}

const MyTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Toast state
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");

  // Fetch the tasks for the logged-in user
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/tasks/assigned"); // API endpoint to fetch tasks for the logged-in user
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await response.json();
        setTasks(data);
        setToastMessage("Tasks fetched successfully!");
        setToastOpen(true);
      } catch (err) {
        setError("Failed to fetch tasks");
        setToastMessage("Error fetching tasks");
        setToastOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div className="my-tasks-container">
      <h2>My Tasks</h2>

      {loading && <div>Loading tasks...</div>}
      {!loading && error && <div>{error}</div>}

      <div className="tasks-list">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className="task-item">
              <h3 className="task-title">{task.title}</h3>
              <p className="task-description">{task.description}</p>
              <p className="task-status">{task.status}</p>
              <p className="task-due-date">
                Due Date: {new Date(task.dueDate).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          !loading && <p>No tasks available</p>
        )}
      </div>

      {/* Notification Toast */}
      <NotificationToast
        message={toastMessage}
        isOpen={toastOpen}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
};

export default MyTasks;

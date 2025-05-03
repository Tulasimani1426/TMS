import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Required styles
import { NotificationToast } from "@/components/dashboard/notification-toast"; // Import the NotificationToast component

interface Task {
  id: number;
  title: string;
  status: string;
  dueDate: string; // Format: 'YYYY-MM-DD'
}

const CalendarComponent: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState<Task[]>([]);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Fetch user-specific tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/tasks/assigned");
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const data = await response.json();
        setTasks(data);
        setToastMessage("Your tasks for the selected date are ready!");
        setToastOpen(true);
      } catch (err) {
        setToastMessage("Error fetching tasks. Try again..");
        setToastOpen(true);
      }
    };

    fetchTasks();
  }, []);

  // Filter tasks for selected date
  useEffect(() => {
    const filteredTasks = tasks.filter((task) => {
      const taskDueDate = new Date(task.dueDate);
      return (
        taskDueDate.getFullYear() === selectedDate.getFullYear() &&
        taskDueDate.getMonth() === selectedDate.getMonth() &&
        taskDueDate.getDate() === selectedDate.getDate()
      );
    });
    setTasksForSelectedDate(filteredTasks);
  }, [selectedDate, tasks]);

  // Type-safe date change handler
  const handleDateChange = (value: Date | Date[] | null) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    } else if (Array.isArray(value) && value[0] instanceof Date) {
      setSelectedDate(value[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Task Calendar</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            selectRange={false}
            tileClassName={({ date }) => {
              const hasTask = tasks.some(
                (task) =>
                  new Date(task.dueDate).toDateString() === date.toDateString()
              );
              return hasTask ? "bg-green-100 text-green-800 font-semibold" : "";
            }}
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">
            Tasks for {selectedDate.toLocaleDateString()}
          </h3>
          {tasksForSelectedDate.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2">
              {tasksForSelectedDate.map((task) => (
                <li key={task.id}>
                  <span className="font-medium">{task.title}</span> -{" "}
                  <span className="text-sm text-gray-600">{task.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No tasks due on this date.</p>
          )}
        </div>
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

export default CalendarComponent;

import { useState } from "react";
import { NotificationToast} from "@/components/dashboard/notification-toast"; // Ensure the correct path

const SettingsPage: React.FC = () => {
  const [isNotificationVisible, setNotificationVisible] = useState(false);
  const [userName, setUserName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [theme, setTheme] = useState("light");

  // Function to show notification when settings are saved
  const handleSave = () => {
    console.log("Saving settings...");
    setNotificationVisible(true); // Show success message
    setTimeout(() => {
      console.log("Hiding toast...");
      setNotificationVisible(false);
    }, 3000); // Hide notification after 3 seconds
  };

  // Function to handle theme change
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value);
  };

  return (
    <div className="settings-page p-6">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>

      {/* User Profile Section */}
      <div className="user-profile mb-6">
        <h3 className="text-xl font-semibold mb-2">User Profile</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Theme Settings Section */}
      <div className="theme-settings mb-6">
        <h3 className="text-xl font-semibold mb-2">Theme Settings</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Choose Theme</label>
          <select
            value={theme}
            onChange={handleThemeChange} // Theme change handler
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave} // Button triggers the save function
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Save Changes
      </button>

      {/* Notification Toast */}
      {isNotificationVisible && (
        <NotificationToast message="Settings saved successfully!" type="success" />
      )}
    </div>
  );
};

export default SettingsPage;

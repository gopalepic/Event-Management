import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function Home() {
  const [activeTab, setActiveTab] = useState('connect');
  const [isConnected, setIsConnected] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    time: '',
    duration: '' // User must select duration
  });

  // Check connection status on load
  useEffect(() => {
    checkConnectionStatus();
    
    // Check for error from OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error === 'auth_failed') {
      alert('Authentication failed. Please try again.');
      // Clear the error from URL
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  const checkConnectionStatus = async () => {
    // In a real app, you'd check if user is authenticated
    // For now, we'll check localStorage for user data
    const userData = localStorage.getItem('calendarUser');
    if (userData) {
      const user = JSON.parse(userData);
      setIsConnected(true);
      setUserEmail(user.email);
    }
  };

  const handleConnectCalendar = () => {
    setLoading(true);
    // Redirect to backend OAuth endpoint
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      alert('Please connect your calendar first!');
      return;
    }

    setLoading(true);

    try {
      // Combine date and time
      const startDateTime = new Date(`${eventForm.date}T${eventForm.time}`);
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + parseInt(eventForm.duration));

      const userData = JSON.parse(localStorage.getItem('calendarUser') || '{}');

      const response = await axios.post(`${API_BASE_URL}/calendar/event`, {
        title: eventForm.title,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString()
      }, {
        headers: {
          'X-User-ID': userData.id
        }
      });

      alert('Event created successfully! Check your Google Calendar.');
      
      // Reset form (but keep duration as user's preference)
      setEventForm({
        title: '',
        date: '',
        time: '',
        duration: eventForm.duration // Keep the user's selected duration
      });

    } catch (error: any) {
      console.error('Error creating event:', error);
      alert(error.response?.data?.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📅 Calendar Integration
          </h1>
          <p className="text-gray-600">
            Connect your Google Calendar and create events
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('connect')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'connect'
                  ? 'bg-blue-500 text-white border-b-2 border-blue-500'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              🔗 Connect Calendar
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'create'
                  ? 'bg-blue-500 text-white border-b-2 border-blue-500'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              ➕ Create Events
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'connect' && (
              <div className="text-center">
                {isConnected ? (
                  <div className="space-y-4">
                    <div className="text-green-600 text-6xl">✅</div>
                    <h3 className="text-xl font-semibold text-green-700">
                      Calendar Connected
                    </h3>
                    <p className="text-gray-600">
                      Connected as: <span className="font-medium">{userEmail}</span>
                    </p>
                    <button
                      onClick={() => {
                        localStorage.removeItem('calendarUser');
                        setIsConnected(false);
                        setUserEmail('');
                      }}
                      className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-gray-400 text-6xl">📅</div>
                    <h3 className="text-xl font-semibold text-gray-700">
                      Connect Your Google Calendar
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Authenticate with Google to start creating calendar events
                    </p>
                    <button
                      onClick={handleConnectCalendar}
                      disabled={loading}
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Connecting...' : 'Connect Google Calendar'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'create' && (
              <div>
                {!isConnected && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-yellow-800">
                      ⚠️ Please connect your calendar first before creating events.
                    </p>
                  </div>
                )}

                <form onSubmit={handleCreateEvent} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Name
                    </label>
                    <input
                      type="text"
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="Enter event name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={eventForm.time}
                      onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <select
                      value={eventForm.duration}
                      onChange={(e) => setEventForm({ ...eventForm, duration: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      required
                    >
                      <option value="">Please select duration</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !isConnected}
                    className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating Event...' : 'Create Event'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

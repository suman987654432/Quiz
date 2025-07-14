 import { useState } from 'react';
import { API_URL } from '../../config/config';
import { toast } from 'react-toastify';

const QuizSettings = ({ settings, quizDuration, setQuizDuration }) => {
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [newDuration, setNewDuration] = useState(quizDuration);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateDuration = async () => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/quiz/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ duration: newDuration })
      });

      if (!response.ok) {
        throw new Error('Failed to update quiz duration');
      }

      setQuizDuration(newDuration);
      setShowDurationModal(false);
      toast.success('Quiz duration updated successfully');
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to update quiz duration');
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleQuizStatus = async () => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/quiz/toggle-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isLive: !settings?.isLive })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle quiz status');
      }

      toast.success(settings?.isLive ? 'Quiz deactivated' : 'Quiz activated');
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to toggle quiz status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="mb-8 p-5 bg-indigo-50 rounded-xl border border-indigo-100 shadow-sm">
        <h2 className="text-lg font-semibold mb-2 text-indigo-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          Quiz Duration
        </h2>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Current quiz duration: <span className="font-semibold text-indigo-700">{quizDuration} minutes</span>
          </p>
          <button 
            onClick={() => {
              setNewDuration(quizDuration);
              setShowDurationModal(true);
            }}
            className="px-3 py-1 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors duration-200 flex items-center"
          >
            Change
          </button>
        </div>
      </div>

      <div className="mb-8 p-5 bg-indigo-50 rounded-xl border border-indigo-100 shadow-sm">
        <h2 className="text-lg font-semibold mb-2 text-indigo-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
          Quiz Status
        </h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${settings?.isLive ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
            <p className="text-sm text-gray-600">
              Quiz is currently <span className={`font-semibold ${settings?.isLive ? 'text-green-700' : 'text-red-700'}`}>
                {settings?.isLive ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </p>
          </div>
          <button 
            onClick={toggleQuizStatus}
            disabled={isUpdating}
            className={`px-3 py-1 text-sm ${settings?.isLive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} 
              text-white rounded transition-colors duration-200 flex items-center ${isUpdating ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isUpdating ? 'Updating...' : settings?.isLive ? 'Deactivate Quiz' : 'Activate Quiz'}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          {settings?.isLive 
            ? 'When active, users can submit their quiz answers.' 
            : 'When inactive, users can view questions but cannot submit answers.'}
        </p>
      </div>

      {/* Duration Update Modal */}
      {showDurationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Update Quiz Duration</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="180"
                value={newDuration}
                onChange={(e) => setNewDuration(parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Set a duration between 1 and 180 minutes
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDurationModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateDuration}
                disabled={isUpdating || newDuration < 1 || newDuration > 180}
                className={`px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 
                  ${(isUpdating || newDuration < 1 || newDuration > 180) ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isUpdating ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuizSettings;

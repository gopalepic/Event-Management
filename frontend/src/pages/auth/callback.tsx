import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      const { userId, email, name, error } = router.query;

      if (error) {
        alert('Authentication failed. Please try again.');
        router.push('/');
        return;
      }

      if (userId && email) {
        // Store user data in localStorage
        const userData = {
          id: userId as string,
          email: email as string,
          name: name as string || ''
        };

        localStorage.setItem('calendarUser', JSON.stringify(userData));

        // Redirect back to home page
        router.push('/');
      }
    }
  }, [router.isReady, router.query, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🔄</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Connecting your calendar...
        </h2>
        <p className="text-gray-500">
          Please wait while we complete the authentication process.
        </p>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { getServerSession } from '@/lib/auth-helpers';

export default async function Home() {
  const session = await getServerSession();

  const features = [
    {
      title: 'Drug Verification',
      description: 'Verify drugs using NAFDAC code, image, or text search',
      href: '/drug-verification',
      icon: '💊',
    },
    {
      title: 'AI Chat Diagnosis',
      description: 'Get preliminary diagnosis based on your symptoms',
      href: '/chat',
      icon: '💬',
    },
    {
      title: 'Find Hospitals',
      description: 'Get recommendations for nearby hospitals based on symptoms',
      href: '/hospitals',
      icon: '🏥',
    },
    {
      title: 'Diagnosis History',
      description: 'View your past diagnoses and chat history',
      href: '/history',
      icon: '📋',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Welcome to Delphi Health
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your comprehensive healthcare platform for drug verification, AI-powered
            diagnosis, and hospital recommendations.
          </p>
        </div>

        {!session && (
          <div className="text-center mb-12">
            <Link
              href="/auth/signin"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors mr-4"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="inline-block px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            About Delphi Health
          </h2>
          <p className="text-gray-600 mb-4">
            Delphi Health is a comprehensive healthcare platform designed to help
            users verify medications, get preliminary health information, and find
            appropriate medical facilities. Our AI-powered chat system provides
            preliminary diagnoses based on symptoms, while our drug verification
            system helps ensure medication safety.
          </p>
          <p className="text-gray-600">
            <strong>Important:</strong> This platform provides preliminary
            information only. Always consult with qualified healthcare
            professionals for proper diagnosis and treatment.
          </p>
        </div>
      </div>
    </div>
  );
}

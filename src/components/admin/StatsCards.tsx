'use client';

export interface StatsCardsProps {
  stats: {
    users: {
      total: number;
      recentSignups: number;
    };
    diagnoses: {
      total: number;
      last30Days: number;
    };
    drugVerifications: {
      total: number;
      verified: number;
    };
    sos: {
      total: number;
      active: number;
    };
    hospitalRecommendations: {
      total: number;
    };
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Users',
      value: stats.users.total,
      change: `+${stats.users.recentSignups} this month`,
      color: 'blue',
    },
    {
      title: 'Total Diagnoses',
      value: stats.diagnoses.total,
      change: `+${stats.diagnoses.last30Days} this month`,
      color: 'green',
    },
    {
      title: 'Drug Verifications',
      value: stats.drugVerifications.total,
      change: `${stats.drugVerifications.verified} verified`,
      color: 'purple',
    },
    {
      title: 'SOS Events',
      value: stats.sos.total,
      change: `${stats.sos.active} active`,
      color: 'red',
    },
    {
      title: 'Hospital Recommendations',
      value: stats.hospitalRecommendations.total,
      change: 'Total requests',
      color: 'yellow',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
            <div
              className={`w-3 h-3 rounded-full ${colorClasses[card.color as keyof typeof colorClasses]}`}
            />
          </div>
          <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          <p className="text-xs text-gray-500 mt-1">{card.change}</p>
        </div>
      ))}
    </div>
  );
}


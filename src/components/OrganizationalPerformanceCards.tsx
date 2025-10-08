import { Card, CardContent } from "./ui/card";
import { LineChart, Line, ResponsiveContainer } from "recharts";

export function OrganizationalPerformanceCards() {
  // Sample data for the mini charts
  const chartData = [
    { value: 20 },
    { value: 25 },
    { value: 22 },
    { value: 30 },
    { value: 28 },
    { value: 35 },
    { value: 32 }
  ];

  const performanceCards = [
    {
      title: "Mean Time To Resolution",
      date: "Jan 02",
      score: "4.2 hours",
      trend: "up",
      color: "text-green-600"
    },
    {
      title: "First Call Resolution",
      date: "Jan 04", 
      score: "78%",
      trend: "up",
      color: "text-blue-600"
    },
    {
      title: "Customer Satisfaction",
      date: "Jan 05",
      score: "4.6/5.0",
      trend: "up", 
      color: "text-purple-600"
    }
  ];

  return (
    <div>
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium">Organizational Performance</h3>
      </div>
      <div className="p-4 space-y-4">
        {performanceCards.map((card, index) => (
          <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow rounded-none">
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 mb-2">{card.title}</div>
              <div className="border-t border-gray-200 pt-2">
                <div className="text-xs text-gray-500 mb-1">{card.date}</div>
                <div className={`text-xl font-semibold mb-3`} style={{ color: '#3C59E7' }}>
                  {card.score}
                </div>
                <div className="h-12">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke={card.color.includes('green') ? '#16a34a' : card.color.includes('blue') ? '#2563eb' : '#9333ea'}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
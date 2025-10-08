import { Card, CardContent } from "./ui/card";

export function HappeningNowCards() {
  const cards = [
    { title: "Open P1 Incidents", count: 3 },
    { title: "Incidents SLA Breached", count: 12 },
    { title: "Incidents Not Updated in 24 hours", count: 8 },
    { title: "Incidents SLA at Risk", count: 15 },
    { title: "My incidents", count: 24 },
    { title: "Unassigned Incidents", count: 18 }
  ];

  return (
    <div>
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium">Happening Now</h3>
      </div>
      <div className="p-4 grid grid-cols-2 gap-4">
        {cards.map((card, index) => (
          <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer rounded-none">
            <CardContent className="p-4">
              <div className="text-xs text-gray-600 mb-2">{card.title}</div>
              <div className="border-t border-gray-200 pt-2">
                <div className='text-2xl font-semibold' style={{ color: '#3C59E7' }}>
                  {card.count}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
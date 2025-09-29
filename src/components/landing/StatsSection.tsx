import { MapPin, Route, Building, Calendar, IndianRupee, Clock } from "lucide-react";

const StatsSection = () => {
  const stats = [
    {
      icon: <MapPin className="h-12 w-12" />,
      title: "Total Stations",
      value: "25",
      unit: "nos.",
    },
    {
      icon: <Route className="h-12 w-12" />,
      title: "Metro Route",
      value: "25.6",
      unit: "km",
    },
    {
      icon: <Building className="h-12 w-12" />,
      title: "Elevated Route",
      value: "22.5",
      unit: "km",
    },
    {
      icon: <IndianRupee className="h-12 w-12" />,
      title: "Project Cost",
      value: "5181",
      unit: "Cr.",
    },
    {
      icon: <Calendar className="h-12 w-12" />,
      title: "Operational Since",
      value: "2017",
      unit: "",
    },
    {
      icon: <Clock className="h-12 w-12" />,
      title: "Travel Time",
      value: "47",
      unit: "min",
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-accent/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center group hover:scale-105 transition-all duration-300"
            >
              <div className="mx-auto mb-4 p-4 rounded-full bg-metro-teal/10 text-metro-teal-dark group-hover:bg-metro-teal-dark group-hover:text-white transition-all duration-300 w-fit">
                {stat.icon}
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                {stat.title}
              </h3>
              <div className="flex items-baseline justify-center space-x-1">
                <span className="text-3xl font-bold text-metro-teal-dark">
                  {stat.value}
                </span>
                {stat.unit && (
                  <span className="text-lg text-metro-teal">
                    {stat.unit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
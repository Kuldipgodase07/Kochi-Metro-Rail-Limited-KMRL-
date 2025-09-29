import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Target, Trophy } from "lucide-react";

const VisionMissionGoals = () => {
  const content = [
    {
      title: "Vision",
      icon: <Eye className="w-6 h-6" />,
      description: "To enrich the quality of life for everyone in Kochi by facilitating better connectivity between people, places, and prosperity."
    },
    {
      title: "Mission", 
      icon: <Target className="w-6 h-6" />,
      description: "To make Kochi a more liveable and pleasant city where public transportation connects people and places safely, seamlessly, and comfortably."
    },
    {
      title: "Strategic Goals",
      icon: <Trophy className="w-6 h-6" />,
      description: "Introduce world-class metro system in Cochin with stakeholder approach for connectivity improvement. Connect metro with Cochin International Airport and extend to Fort Cochin while creating integrated transport hubs to boost regional economic vitality and maintain accountability."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {content.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            className="group h-full"
          >
            <Card className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              {/* Card Header */}
              <CardHeader className="bg-metro-teal-dark text-white p-4 relative">
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                <div className="relative z-10 flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
                    {item.icon}
                  </div>
                  <CardTitle className="text-lg font-bold">
                    {item.title}
                  </CardTitle>
                </div>
              </CardHeader>

              {/* Card Content */}
              <CardContent className="p-4">
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 + 0.2 }}
                  className="text-gray-700 leading-relaxed text-sm"
                >
                  {item.description}
                </motion.p>
              </CardContent>

              {/* Hover Border Effect */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-metro-teal/30 rounded-lg transition-all duration-300 pointer-events-none"></div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default VisionMissionGoals;
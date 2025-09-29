import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Train, MapPin, ExternalLink, Navigation } from "lucide-react";

const RouteSection = () => {
  const stations = [
    "Aluva", "Pulinchode", "Companypady", "Ambattukavu", "Muttom",
    "Kalamassery", "Cusat", "Pathadipalam", "Edapally", "Changampuzha Park",
    "Palarivattom", "JLN Stadium", "Kaloor", "Town Hall", "MG Road",
    "Maharaja's College", "Ernakulam South", "Kadavanthra", "Elamkulam", "Vyttila",
    "Thaikoodam", "Petta", "SN Junction", "Vadakkekotta", "Thripunithura"
  ];

  // Split stations into two columns
  const firstColumn = stations.slice(0, Math.ceil(stations.length / 2));
  const secondColumn = stations.slice(Math.ceil(stations.length / 2));

  // Google Maps URL for Kochi Metro route
  const openInGoogleMaps = () => {
    // This URL will show the Kochi Metro route from Aluva to Thripunithura
    const googleMapsUrl = "https://www.google.com/maps/dir/Aluva+Metro+Station,+Aluva,+Kerala/Thripunithura+Metro+Station,+Thripunithura,+Kerala/@10.0473,76.3162,12z/data=!3m1!4b1!4m14!4m13!1m5!1m1!1s0x3b080d9f34d92ef7:0x8d5a3c4b8f2c7a1d!2m2!1d76.3525!2d10.1081!1m5!1m1!1s0x3b080c1f6b8f9f5d:0x7c8d4a5b9e3f6e2a!2m2!1d76.3267!2d9.9473!3e3";
    window.open(googleMapsUrl, '_blank');
  };

  // Google Maps embed URL for Kochi Metro line
  const mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d125488.85449389847!2d76.24620267265625!3d10.047295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e3!4m5!1s0x3b080d9f34d92ef7%3A0x8d5a3c4b8f2c7a1d!2sAluva%20Metro%20Station%2C%20Aluva%2C%20Kerala!3m2!1d10.1081!2d76.3525!4m5!1s0x3b080c1f6b8f9f5d%3A0x7c8d4a5b9e3f6e2a!2sThripunithura%20Metro%20Station%2C%20Thripunithura%2C%20Kerala!3m2!1d9.9473!2d76.3267!5e0!3m2!1sen!2sin!4v1632825600000!5m2!1sen!2sin";

  return (
    <section className="py-20 bg-gradient-to-b from-metro-teal/5 via-metro-teal/3 to-background/95">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Route Map */}
          <div className="animate-fade-in">
            <h2 className="text-5xl font-bold text-metro-teal-dark mb-12 tracking-wide">ROUTE MAP</h2>
            <Card className="shadow-metro bg-metro-teal/5 border border-metro-teal/10 overflow-hidden group hover:shadow-xl transition-all duration-500 h-[600px]">
              <CardContent className="p-0 relative h-full flex flex-col">
                <div className="relative flex-1">
                  {/* Dynamic Google Maps Embed */}
                  <iframe
                    src={mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: '400px' }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Kochi Metro Route - Live Map"
                    className="rounded-t-lg"
                  ></iframe>
                  
                  {/* Floating Legend */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10">
                    <h3 className="font-bold text-metro-teal-dark text-sm mb-2 flex items-center">
                      <Navigation className="mr-1 h-4 w-4" />
                      LIVE MAP
                    </h3>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-0.5 bg-blue-600 rounded"></div>
                        <span>Metro Route</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        <span>Stations</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bottom Info Section */}
                <div className="p-4 bg-white/90 backdrop-blur-sm">
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-metro-teal-dark mb-1">
                      Kochi Metro Line
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      Aluva ↔ Thripunithura
                    </p>
                    <div className="flex justify-center items-center space-x-3 text-xs text-metro-teal-dark font-semibold mb-3">
                      <span>25.6 km</span>
                      <span>•</span>
                      <span>25 Stations</span>
                      <span>•</span>
                      <span>47 min</span>
                    </div>
                    <Button 
                      onClick={openInGoogleMaps}
                      size="sm"
                      className="bg-metro-teal-dark hover:bg-metro-teal-darker text-white"
                    >
                      <ExternalLink className="mr-2 h-3 w-3" />
                      Open in Google Maps
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stations List */}
          <div className="animate-fade-in">
            <h2 className="text-5xl font-bold text-metro-teal-dark mb-12 tracking-wide">STATIONS</h2>
            <Card className="shadow-metro bg-metro-teal/5 border border-metro-teal/10 overflow-hidden hover:shadow-xl transition-all duration-500 h-[600px]">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 h-full">
                    {/* First Column */}
                    <div className="space-y-1">
                      {firstColumn.map((station, index) => (
                        <div 
                          key={station}
                          className="flex items-center space-x-3 group cursor-pointer hover:bg-metro-teal/5 py-2 px-3 rounded-lg transition-all duration-300 hover:shadow-md animate-scale-in"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="p-2 bg-metro-teal/10 rounded-full group-hover:bg-metro-teal-dark group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                            <Train className="h-4 w-4 text-metro-teal-dark group-hover:text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-metro-teal-dark group-hover:text-metro-teal transition-colors duration-300">
                              {station}
                            </h4>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Second Column */}
                    <div className="space-y-1">
                      {secondColumn.map((station, index) => (
                        <div 
                          key={station}
                          className="flex items-center space-x-3 group cursor-pointer hover:bg-metro-teal/5 py-2 px-3 rounded-lg transition-all duration-300 hover:shadow-md animate-scale-in"
                          style={{ animationDelay: `${(firstColumn.length + index) * 0.1}s` }}
                        >
                          <div className="p-2 bg-metro-teal/10 rounded-full group-hover:bg-metro-teal-dark group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                            <Train className="h-4 w-4 text-metro-teal-dark group-hover:text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-metro-teal-dark group-hover:text-metro-teal transition-colors duration-300">
                              {station}
                            </h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Bottom Summary */}
                <div className="pt-4 border-t border-metro-teal/20 mt-4">
                  <div className="text-center">
                    <p className="text-sm text-metro-teal-dark font-semibold">
                      Total: {stations.length} Metro Stations
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Click any station for details
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RouteSection;
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Camera, Video, Film, Twitter, Facebook, ExternalLink, Clock, Image, Zap, Play, X } from "lucide-react";
import { useState, useEffect } from "react";

// Extend Window interface for social media APIs
declare global {
  interface Window {
    twttr: {
      widgets: {
        load: () => void;
      };
    };
    FB: {
      init: (config: { appId: string; xfbml: boolean; version: string }) => void;
      XFBML: {
        parse: () => void;
      };
    };
    fbAsyncInit: () => void;
  }
}

const MediaSection = () => {
  const [activeTab, setActiveTab] = useState('twitter');
  const [mediaTab, setMediaTab] = useState('photos');
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);

  const latestNews = [
    {
      date: "October 08, 2024",
      title: "The cost of the corridor, due to be completed by 2029.",
      excerpt: ""
    },
    {
      date: "August 17, 2024", 
      title: "By an uncanny coincidence, even as political corridors were abuzz with speculation about Maharashtra Assembly elections.",
      excerpt: ""
    },
    {
      date: "August 17, 2024",
      title: "१२ हजार कोटींची प्रकल्प; २०२९ पर्यंत पूर्ण माननान्वी घडेली महत्वाची कामे; महाराष्ट्र मेट्रो गिणत;",
      excerpt: ""
    },
    {
      date: "August 17, 2024",
      title: "केंद्रीय मंत्रिमंडळाची मंजुरी: महाराष्ट्र मेट्रो गिणत;",
      excerpt: ""
    }
  ];

  const photosContent = [
    {
      id: 1,
      title: "Metro Station Construction",
      description: "Latest progress at Aluva Metro Station",
      date: "2 days ago"
    },
    {
      id: 2,
      title: "Train Interior Design",
      description: "Modern eco-friendly train interiors",
      date: "5 days ago"
    },
    {
      id: 3,
      title: "Solar Panel Installation",
      description: "Green energy initiative across all stations",
      date: "1 week ago"
    }
  ];

  const videosContent = [
    {
      id: 1,
      title: "Metro Operations Behind the Scenes",
      description: "How Kochi Metro ensures smooth daily operations",
      duration: "3:45",
      date: "3 days ago",
      embedId: "dQw4w9WgXcQ" // Example YouTube video ID
    },
    {
      id: 2,
      title: "Safety Protocols Training",
      description: "Staff training for passenger safety",
      duration: "2:30",
      date: "1 week ago",
      embedId: "dQw4w9WgXcQ" // Example YouTube video ID
    },
    {
      id: 3,
      title: "Environmental Impact",
      description: "Kochi Metro's contribution to reducing carbon footprint",
      duration: "4:12",
      date: "2 weeks ago",
      embedId: "dQw4w9WgXcQ" // Example YouTube video ID
    }
  ];

  const reelsContent = [
    {
      id: 1,
      title: "Quick Metro Facts",
      description: "25 stations, 25.6km, 47 minutes",
      date: "1 day ago"
    },
    {
      id: 2,
      title: "Rush Hour Time-lapse",
      description: "Peak hours at MG Road Station",
      date: "3 days ago"
    },
    {
      id: 3,
      title: "Green Initiative Highlight",
      description: "100% solar powered metro system",
      date: "5 days ago"
    }
  ];

  const handleVideoClick = (videoId: number) => {
    setSelectedVideo(videoId);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  // Load Twitter widget script
  useEffect(() => {
    if (activeTab === 'twitter') {
      if (!window.twttr) {
        const script = document.createElement('script');
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true;
        script.charset = 'utf-8';
        document.body.appendChild(script);
      } else {
        window.twttr.widgets.load();
      }
    }
  }, [activeTab]);

  // Load Facebook SDK
  useEffect(() => {
    if (activeTab === 'facebook') {
      if (!window.FB) {
        const script = document.createElement('script');
        script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0';
        script.async = true;
        script.defer = true;
        script.crossOrigin = 'anonymous';
        document.body.appendChild(script);
        
        window.fbAsyncInit = function() {
          window.FB.init({
            appId: 'your-app-id',
            xfbml: true,
            version: 'v18.0'
          });
        };
      } else {
        window.FB.XFBML.parse();
      }
    }
  }, [activeTab]);

  const openTwitter = () => {
    window.open('https://twitter.com/KochiMetroRail', '_blank');
  };

  const openFacebook = () => {
    window.open('https://www.facebook.com/KochiMetroRailLimited', '_blank');
  };

  return (
    <section className="py-20 bg-gradient-to-b from-background to-accent/10">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Latest News Card - Matching exact height */}
          <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-[520px]">
            <CardContent className="p-0 h-full flex flex-col">
              {/* Header */}
              <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-gray-100 rounded">
                    <Calendar className="h-4 w-4 text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Latest News</h3>
                </div>
              </div>
              
              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                {latestNews.map((news, index) => (
                  <div 
                    key={index}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-1.5 bg-gray-100 rounded-full flex-shrink-0 mt-1">
                          <Clock className="h-3 w-3 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-1">
                            {news.date}
                          </p>
                          <p className="text-sm text-gray-800 leading-relaxed">
                            {news.title}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
                <button className="text-metro-teal text-sm font-medium hover:text-metro-teal-dark transition-colors flex items-center justify-center w-full">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View All
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Media Gallery Card - Matching exact height */}
          <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-[520px]">
            <CardContent className="p-0 h-full flex flex-col">
              {/* Tab Headers */}
              <div className="flex bg-white border-b border-gray-200 flex-shrink-0">
                <button 
                  className={`flex-1 p-3 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                    mediaTab === 'photos' 
                      ? 'text-white bg-metro-teal-dark' 
                      : 'text-gray-600 bg-metro-teal/20 hover:bg-metro-teal/30'
                  }`}
                  onClick={() => setMediaTab('photos')}
                >
                  <Image className="h-4 w-4" />
                  <span>Photos</span>
                </button>
                <button 
                  className={`flex-1 p-3 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                    mediaTab === 'videos' 
                      ? 'text-white bg-metro-teal-dark' 
                      : 'text-gray-600 bg-metro-teal/20 hover:bg-metro-teal/30'
                  }`}
                  onClick={() => setMediaTab('videos')}
                >
                  <Video className="h-4 w-4" />
                  <span>Videos</span>
                </button>
                <button 
                  className={`flex-1 p-3 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                    mediaTab === 'reels' 
                      ? 'text-white bg-metro-teal-dark' 
                      : 'text-gray-600 bg-metro-teal/20 hover:bg-metro-teal/30'
                  }`}
                  onClick={() => setMediaTab('reels')}
                >
                  <Zap className="h-4 w-4" />
                  <span>Reels</span>
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto">
                {mediaTab === 'photos' ? (
                  /* Photos Content */
                  <div className="space-y-3 p-4">
                    {photosContent.map((photo) => (
                      <div key={photo.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        {/* Photo Preview */}
                        <div className="h-32 bg-gradient-to-br from-metro-teal/40 to-metro-teal-dark/50 flex items-center justify-center cursor-pointer hover:from-metro-teal/50 hover:to-metro-teal-dark/60 transition-colors">
                          <div className="text-center text-white">
                            <Camera className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-xs font-medium">View Photo</p>
                          </div>
                        </div>
                        {/* Photo Info */}
                        <div className="p-3">
                          <h4 className="font-semibold text-gray-800 text-sm mb-1">{photo.title}</h4>
                          <p className="text-xs text-gray-600 mb-1">{photo.description}</p>
                          <p className="text-xs text-gray-500">{photo.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : mediaTab === 'videos' ? (
                  /* Videos Content */
                  <div className="space-y-3 p-4">
                    {videosContent.map((video) => (
                      <div key={video.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        {/* Video Preview */}
                        <div 
                          onClick={() => handleVideoClick(video.id)}
                          className="h-32 bg-gradient-to-br from-metro-teal/40 to-metro-teal-dark/50 flex items-center justify-center relative cursor-pointer hover:from-metro-teal/50 hover:to-metro-teal-dark/60 transition-colors group"
                        >
                          <div className="text-center text-white">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-white/30 transition-colors">
                              <Play className="h-8 w-8 text-white ml-1" />
                            </div>
                            <p className="text-xs font-medium">Play Video</p>
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {video.duration}
                          </div>
                        </div>
                        {/* Video Info */}
                        <div className="p-3">
                          <h4 className="font-semibold text-gray-800 text-sm mb-1">{video.title}</h4>
                          <p className="text-xs text-gray-600 mb-1">{video.description}</p>
                          <p className="text-xs text-gray-500">{video.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Reels Content */
                  <div className="space-y-3 p-4">
                    {reelsContent.map((reel) => (
                      <div key={reel.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        {/* Reel Preview */}
                        <div className="h-32 bg-gradient-to-br from-metro-teal/40 to-metro-teal-dark/50 flex items-center justify-center cursor-pointer hover:from-metro-teal/50 hover:to-metro-teal-dark/60 transition-colors group">
                          <div className="text-center text-white">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-white/30 transition-colors">
                              <Zap className="h-8 w-8 text-white" />
                            </div>
                            <p className="text-xs font-medium">Watch Reel</p>
                          </div>
                        </div>
                        {/* Reel Info */}
                        <div className="p-3">
                          <h4 className="font-semibold text-gray-800 text-sm mb-1">{reel.title}</h4>
                          <p className="text-xs text-gray-600 mb-1">{reel.description}</p>
                          <p className="text-xs text-gray-500">{reel.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
                <button className="text-metro-teal text-sm font-medium hover:text-metro-teal-dark transition-colors flex items-center justify-center w-full">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View All
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Card - Matching exact height */}
          <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-[520px]">
            <CardContent className="p-0 h-full flex flex-col">
              {/* Tab Headers */}
              <div className="flex bg-white border-b border-gray-200 flex-shrink-0">
                <button 
                  className={`flex-1 p-3 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                    activeTab === 'twitter' 
                      ? 'text-white bg-[#1DA1F2]' 
                      : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveTab('twitter')}
                >
                  <Twitter className="h-4 w-4" />
                  <span>Tweets</span>
                </button>
                <button 
                  className={`flex-1 p-3 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                    activeTab === 'facebook' 
                      ? 'text-white bg-[#1877F2]' 
                      : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveTab('facebook')}
                >
                  <Facebook className="h-4 w-4" />
                  <span>FB Post</span>
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === 'twitter' ? (
                  /* Twitter Timeline Format - Like Reference Image */
                  <div className="space-y-3 p-4">
                    <div className="border-b border-gray-100 pb-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-metro-teal to-metro-teal-dark rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-white">KM</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-bold text-gray-900 text-sm">Thane Metro</h4>
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                            <span className="text-gray-500 text-sm">@MetroRailThane • Follow</span>
                          </div>
                          <p className="text-gray-900 text-sm leading-relaxed mb-2">
                            29 km of smarter & smoother city travel that will connect every corner of Thane
                          </p>
                          <div className="text-[#1DA1F2] text-sm mb-3">
                            #Thane #Thanemetro #thanemetrocity #Route #Thanecity
                          </div>
                          
                          {/* Route Map Card */}
                          <div className="border border-gray-200 rounded-lg overflow-hidden mt-2 mb-2">
                            <div className="bg-gradient-to-br from-metro-teal to-metro-teal-dark p-4 text-white text-center relative">
                              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                <span className="text-sm font-bold">TM</span>
                              </div>
                              <h5 className="font-bold text-sm mb-1">Thane Metro</h5>
                              <p className="text-xs opacity-90">A full-circle route for a future-ready city</p>
                              <div className="absolute bottom-2 right-2">
                                <div className="w-4 h-4 bg-white/30 rounded flex items-center justify-center">
                                  <span className="text-xs">↓</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-gray-500 text-sm mt-3">
                            <div className="flex items-center space-x-6">
                              <button className="hover:text-gray-700 transition-colors">💬 12</button>
                              <button className="hover:text-green-600 transition-colors">🔄 45</button>
                              <button className="hover:text-red-500 transition-colors">❤️ 156</button>
                              <button className="hover:text-gray-700 transition-colors">📤</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Second Tweet */}
                    <div className="border-b border-gray-100 pb-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-metro-teal to-metro-teal-dark rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-white">KM</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-bold text-gray-900 text-sm">Kochi Metro</h4>
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                            <span className="text-gray-500 text-sm">@KochiMetroRail • 2h</span>
                          </div>
                          <p className="text-gray-900 text-sm leading-relaxed mb-2">
                            🚇 Experience seamless connectivity! Our metro services achieve 99.2% punctuality. Thank you for choosing sustainable transport.
                          </p>
                          <div className="text-[#1DA1F2] text-sm mb-3">
                            #KochiMetro #SustainableTransport #GreenCommute
                          </div>
                          <div className="flex items-center justify-between text-gray-500 text-sm mt-3">
                            <div className="flex items-center space-x-6">
                              <button className="hover:text-gray-700 transition-colors">💬 23</button>
                              <button className="hover:text-green-600 transition-colors">🔄 87</button>
                              <button className="hover:text-red-500 transition-colors">❤️ 342</button>
                              <button className="hover:text-gray-700 transition-colors">📤</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Third Tweet */}
                    <div className="pb-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-metro-teal to-metro-teal-dark rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-white">KM</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-bold text-gray-900 text-sm">Kochi Metro</h4>
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                            <span className="text-gray-500 text-sm">@KochiMetroRail • 6h</span>
                          </div>
                          <p className="text-gray-900 text-sm leading-relaxed mb-2">
                            🌱 Going Green! Solar panel installation complete across all 25 stations. Kochi Metro is now 100% powered by renewable energy!
                          </p>
                          <div className="text-[#1DA1F2] text-sm mb-3">
                            #GreenEnergy #SolarPowered #EcoFriendly #SustainableFuture
                          </div>
                          <div className="flex items-center justify-between text-gray-500 text-sm mt-3">
                            <div className="flex items-center space-x-6">
                              <button className="hover:text-gray-700 transition-colors">💬 89</button>
                              <button className="hover:text-green-600 transition-colors">🔄 456</button>
                              <button className="hover:text-red-500 transition-colors">❤️ 1.2K</button>
                              <button className="hover:text-gray-700 transition-colors">📤</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Facebook Posts Timeline Format */
                  <div className="space-y-4 p-4">
                    <div className="border-b border-gray-100 pb-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-metro-teal to-metro-teal-dark rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-white">KM</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-bold text-gray-900 text-sm">Kochi Metro Rail Limited</h4>
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          </div>
                          <p className="text-gray-500 text-xs mb-2">3 hours ago</p>
                          <p className="text-gray-900 text-sm leading-relaxed mb-3">
                            We're proud to announce that Kochi Metro has achieved a new milestone! Over 2 million passengers have chosen our eco-friendly transport system this month. Thank you for being part of our sustainable journey! 🌿🚊
                          </p>
                          
                          {/* Facebook engagement */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 mb-2">
                            <div className="flex items-center space-x-4 text-gray-500 text-xs">
                              <span>👍 2.1K likes</span>
                              <span>💬 156 comments</span>
                              <span>📤 89 shares</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-around pt-2 border-t border-gray-100">
                            <button className="text-gray-600 hover:text-blue-600 transition-colors text-sm py-1">
                              👍 Like
                            </button>
                            <button className="text-gray-600 hover:text-blue-600 transition-colors text-sm py-1">
                              💬 Comment
                            </button>
                            <button className="text-gray-600 hover:text-blue-600 transition-colors text-sm py-1">
                              📤 Share
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Second Facebook Post */}
                    <div className="border-b border-gray-100 pb-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-metro-teal to-metro-teal-dark rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-white">KM</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-bold text-gray-900 text-sm">Kochi Metro Rail Limited</h4>
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          </div>
                          <p className="text-gray-500 text-xs mb-2">8 hours ago</p>
                          <p className="text-gray-900 text-sm leading-relaxed mb-3">
                            Festival Special Services! 🎉 During Onam celebrations, we're extending service hours and increasing frequency. Metro operates 5:00 AM to 11:30 PM. Celebrate responsibly with Kochi Metro!
                          </p>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 mb-2">
                            <div className="flex items-center space-x-4 text-gray-500 text-xs">
                              <span>👍 1.8K likes</span>
                              <span>💬 203 comments</span>
                              <span>📤 142 shares</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-around pt-2 border-t border-gray-100">
                            <button className="text-gray-600 hover:text-blue-600 transition-colors text-sm py-1">
                              👍 Like
                            </button>
                            <button className="text-gray-600 hover:text-blue-600 transition-colors text-sm py-1">
                              💬 Comment
                            </button>
                            <button className="text-gray-600 hover:text-blue-600 transition-colors text-sm py-1">
                              📤 Share
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
                <div className="flex space-x-2">
                  <button 
                    onClick={openTwitter}
                    className="flex-1 text-[#1DA1F2] text-sm font-medium hover:text-[#1a91da] transition-colors text-center py-1 border border-[#1DA1F2] rounded hover:bg-[#1DA1F2]/5"
                  >
                    Follow on Twitter
                  </button>
                  <button 
                    onClick={openFacebook}
                    className="flex-1 text-[#1877F2] text-sm font-medium hover:text-[#166FE5] transition-colors text-center py-1 border border-[#1877F2] rounded hover:bg-[#1877F2]/5"
                  >
                    Like on Facebook
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                {videosContent.find(v => v.id === selectedVideo)?.title}
              </h3>
              <button
                onClick={closeVideo}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="aspect-video bg-black">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videosContent.find(v => v.id === selectedVideo)?.embedId}?autoplay=1`}
                title="Video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600">
                {videosContent.find(v => v.id === selectedVideo)?.description}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Published: {videosContent.find(v => v.id === selectedVideo)?.date}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MediaSection;
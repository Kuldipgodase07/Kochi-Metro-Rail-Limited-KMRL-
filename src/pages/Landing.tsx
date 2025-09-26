import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import './Landing.css';
import { 
  Train, 
  MapPin, 
  Clock, 
  IndianRupee, 
  Users, 
  Navigation,
  Phone,
  Mail,
  Globe,
  Facebook,
  Twitter,
  Youtube,
  Instagram
} from 'lucide-react';

const KochiMetroLanding = () => {
  const stats = [
    {
      icon: <img src="/icons/stations.svg" alt="Stations" className="w-12 h-12" />,
      title: "Total Stations",
      value: "27",
      subtitle: "nos."
    },
    {
      icon: <img src="/icons/elevated.svg" alt="Elevated" className="w-12 h-12" />,
      title: "Elevated Route",
      value: "25.6",
      subtitle: "km"
    },
    {
      icon: <img src="/icons/underground.svg" alt="Underground" className="w-12 h-12" />,
      title: "Underground Route",
      value: "0.5",
      subtitle: "km"
    },
    {
      icon: <Users className="w-12 h-12 text-orange-600" />,
      title: "Daily Ridership",
      value: "1L+",
      subtitle: "passengers"
    },
    {
      icon: <IndianRupee className="w-12 h-12 text-green-600" />,
      title: "Project Cost",
      value: "5180",
      subtitle: "Cr."
    },
    {
      icon: <Clock className="w-12 h-12 text-red-600" />,
      title: "Operational Since",
      value: "2017",
      subtitle: ""
    }
  ];

  const stations = {
    "Blue Line (Aluva - Maharajas College)": [
      "Aluva", "Pulinchodu", "Companypady", "Ambattukavu", "Muttom", "Kalamassery", 
      "Cusat", "Pathadipalam", "Edapally", "Changampuzha Park", "Palarivattom", 
      "JLN Stadium", "Kaloor", "Town Hall", "Maharajas College"
    ],
    "Green Line (Pettah - SN Junction)": [
      "Pettah", "Vadakkekotta", "Town Hall", "MG Road", "Ernakulam South", 
      "Kadavanthra", "Elamkulam", "Vyttila", "Thaikoodam", "Palarivattom", 
      "JLN Stadium", "SN Junction"
    ]
  };

  const metroProjects = [
    { name: "Mumbai", url: "https://mmrcl.com/" },
    { name: "Delhi", url: "http://www.delhimetrorail.com/" },
    { name: "Bengaluru", url: "https://bmrc.co.in/" },
    { name: "Chennai", url: "https://chennaimetrorail.org/" },
    { name: "Hyderabad", url: "https://www.ltmetro.com/" },
    { name: "Kolkata", url: "http://www.kmrc.in/" },
    { name: "Lucknow", url: "http://www.lmrcl.com/" },
    { name: "Jaipur", url: "https://transport.rajasthan.gov.in/jmrc" },
    { name: "Nagpur", url: "https://www.metrorailnagpur.com/" },
    { name: "Pune", url: "https://punemetrorail.org/" },
    { name: "Ahmedabad", url: "https://www.gujaratmetrorail.com/" },
    { name: "Indore", url: "https://www.mpmetrorail.com/" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-teal-50">
      {/* Navigation Header */}
      <header className="bg-white/98 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18 py-2">
            <div className="flex items-center">
              <img 
                src="/KMRL-logo.png" 
                alt="Kochi Metro Rail Limited" 
                className="h-12 w-auto mr-4"
              />
              <div>
                <h1 className="text-xl font-bold text-green-800">KOCHI METRO RAIL LIMITED</h1>
                <p className="text-sm text-green-600">കൊച്ചി മെട്രോ റെയിൽ ലിമിറ്റഡ്</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/dashboard" className="text-green-700 hover:text-green-900 font-semibold transition-colors duration-200">
                Dashboard
              </Link>
              <Link to="/login" className="text-green-700 hover:text-green-900 font-semibold transition-colors duration-200">
                Login
              </Link>
              <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-50 hover:border-green-700 transition-all duration-200">
                हिं | മലയാളം | EN
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 hero-background overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 hero-overlay"></div>
        <div className="max-w-7xl mx-auto text-center relative z-20 w-full">
          <div className="floating-animation">
            <Badge className="mb-8 bg-glass text-white border-white/40 text-lg md:text-xl px-8 py-4 pulse-animation font-semibold">
              CONNECTING PEOPLE, PLACES & POSSIBILITIES
            </Badge>
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold text-white/90 mb-4 text-shadow-strong">
            Welcome to
          </h2>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-8 leading-tight text-shadow-strong">
            <span className="bg-gradient-to-r from-emerald-200 via-green-200 to-emerald-300 bg-clip-text text-transparent">
              Kochi Metro !
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/95 mb-12 max-w-4xl mx-auto leading-relaxed text-shadow-strong font-medium">
            India's first metro rail system with equal participation from the Central and State governments
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-10 py-5 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 border border-green-500">
                <Train className="mr-3 h-6 w-6" />
                Access Dashboard
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-2 border-white/80 text-white hover:bg-white/20 px-10 py-5 text-lg font-semibold backdrop-blur-sm bg-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
              <MapPin className="mr-3 h-6 w-6" />
              View Route Map
            </Button>
          </div>
        </div>
        
        {/* Enhanced background decorative elements */}
        <div className="absolute top-20 left-10 w-24 h-24 border-2 border-white/30 rounded-full animate-pulse bg-white/5"></div>
        <div className="absolute bottom-32 right-10 w-20 h-20 border-2 border-white/30 rounded-lg animate-pulse bg-white/5"></div>
        <div className="absolute top-1/2 left-20 w-12 h-12 bg-white/20 rounded-full animate-bounce"></div>
        <div className="absolute top-1/3 right-20 w-16 h-16 bg-white/20 rounded-lg animate-bounce delay-1000"></div>
        <div className="absolute bottom-1/3 left-1/3 w-8 h-8 bg-emerald-400/30 rounded-full animate-ping"></div>
        <div className="absolute top-1/4 right-1/3 w-10 h-10 bg-green-400/30 rounded-full animate-ping delay-500"></div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 -mt-16 relative z-30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="stat-card hover:shadow-xl">
                <CardContent className="p-8 text-center">
                  <div className="mb-6 flex justify-center">
                    {stat.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">{stat.title}</h3>
                  <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500 font-medium">{stat.subtitle}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Route Map Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-emerald-800 mb-12">ROUTE MAP</h2>
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-emerald-200">
            <div className="aspect-video">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125448.89606621865!2d76.22652885000001!3d9.93004045!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b080d72b4a8d5e7%3A0x6b4c5e5a6b4c5e5a!2sKochi%20Metro%20Rail%20Limited!5e0!3m2!1sen!2sin!4v1638360000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Kochi Metro Route Map"
              ></iframe>
            </div>
            <div className="p-8 text-center bg-gradient-to-r from-emerald-50 to-green-50">
              <Button variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-700 px-8 py-3 text-lg font-semibold">
                <Navigation className="mr-3 h-5 w-5" />
                Open in Google Maps
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stations Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-emerald-800 mb-16">STATIONS</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {Object.entries(stations).map(([line, stationList]) => (
              <Card key={line} className="station-card">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-emerald-700 mb-8 text-center">{line}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {stationList.map((station, idx) => (
                      <div key={idx} className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg text-center text-sm font-semibold text-emerald-800 hover:from-emerald-100 hover:to-green-100 transition-colors duration-200 border border-emerald-100">
                        {station}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Other Metro Projects */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-emerald-800 mb-12">Other Metro Projects</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {metroProjects.map((project, index) => (
              <a
                key={index}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 text-center text-emerald-700 font-semibold hover:text-emerald-900 border border-emerald-100 hover:border-emerald-300 hover:transform hover:scale-105"
              >
                {project.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-xl font-bold mb-6 text-emerald-200">Important Links</h3>
              <div className="space-y-3 text-sm">
                <a href="http://www.india.gov.in/" className="block hover:text-emerald-300 transition-colors duration-200">Government of India</a>
                <a href="http://www.kerala.gov.in/" className="block hover:text-emerald-300 transition-colors duration-200">Kerala Government</a>
                <a href="https://mohua.gov.in/" className="block hover:text-emerald-300 transition-colors duration-200">MoUD, Government of India</a>
                <a href="https://lsgd.kerala.gov.in/" className="block hover:text-emerald-300 transition-colors duration-200">LSGD, Kerala</a>
                <a href="https://ernakulam.nic.in/" className="block hover:text-emerald-300 transition-colors duration-200">Ernakulam District</a>
                <a href="https://corporationofkochi.org/" className="block hover:text-emerald-300 transition-colors duration-200">Kochi Corporation</a>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6 text-emerald-200">Quick Links</h3>
              <div className="space-y-3 text-sm">
                <Link to="/sitemap" className="block hover:text-emerald-300 transition-colors duration-200">Site Map</Link>
                <Link to="/rti" className="block hover:text-emerald-300 transition-colors duration-200">RTI</Link>
                <Link to="/faq" className="block hover:text-emerald-300 transition-colors duration-200">FAQ's</Link>
                <Link to="/security" className="block hover:text-emerald-300 transition-colors duration-200">Security</Link>
                <Link to="/contact" className="block hover:text-emerald-300 transition-colors duration-200">Help & Contact</Link>
                <Link to="/disclaimer" className="block hover:text-emerald-300 transition-colors duration-200">Disclaimer</Link>
                <Link to="/privacy" className="block hover:text-emerald-300 transition-colors duration-200">Privacy Policy</Link>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6 text-emerald-200">Connect With Us</h3>
              <div className="flex space-x-4 mb-6">
                <a href="#" className="hover:text-emerald-300 transition-colors duration-200 p-2 bg-emerald-800 rounded-full hover:bg-emerald-700"><Facebook className="w-6 h-6" /></a>
                <a href="#" className="hover:text-emerald-300 transition-colors duration-200 p-2 bg-emerald-800 rounded-full hover:bg-emerald-700"><Twitter className="w-6 h-6" /></a>
                <a href="#" className="hover:text-emerald-300 transition-colors duration-200 p-2 bg-emerald-800 rounded-full hover:bg-emerald-700"><Youtube className="w-6 h-6" /></a>
                <a href="#" className="hover:text-emerald-300 transition-colors duration-200 p-2 bg-emerald-800 rounded-full hover:bg-emerald-700"><Instagram className="w-6 h-6" /></a>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-3 text-emerald-300" />
                  <span>+91 484 230 1230</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-3 text-emerald-300" />
                  <span>info@kochimetro.org</span>
                </div>
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-3 text-emerald-300" />
                  <span>www.kochimetro.org</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-emerald-700 mt-12 pt-8 text-center text-sm">
            <p>© 2025 Kochi Metro Rail Limited. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default KochiMetroLanding;
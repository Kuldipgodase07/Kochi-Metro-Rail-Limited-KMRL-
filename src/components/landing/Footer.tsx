import { Phone, Mail, MapPin } from "lucide-react";
import kmrlLogo from "@/assets/kmrl-logo.png";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-metro-teal-dark via-metro-teal to-metro-teal-dark text-white py-16 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-4 mb-6">
              <img 
                src={kmrlLogo} 
                alt="Kochi Metro Rail Limited Logo" 
                className="h-12 w-auto filter brightness-110"
              />
              <div>
                <h3 className="text-xl font-bold text-white">Kochi Metro Rail Limited</h3>
              </div>
            </div>
            <p className="text-white/90 leading-relaxed text-sm max-w-md">
              Kochi Metro is Kerala's most advanced metro system, connecting people, 
              places and possibilities across the beautiful city of Kochi. Experience 
              seamless, sustainable and smart urban transportation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/80 hover:text-white transition-colors duration-300 text-sm hover:translate-x-1 inline-block transform">About Us</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors duration-300 text-sm hover:translate-x-1 inline-block transform">Route Map</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors duration-300 text-sm hover:translate-x-1 inline-block transform">Stations</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors duration-300 text-sm hover:translate-x-1 inline-block transform">Timings</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors duration-300 text-sm hover:translate-x-1 inline-block transform">Fare Chart</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Contact Info</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 group">
                <div className="p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors duration-300">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <span className="text-white/90 text-sm">+91-484-2531251</span>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors duration-300">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <span className="text-white/90 text-sm">info@kochimetro.org</span>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors duration-300">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <span className="text-white/90 text-sm">Kochi, Kerala, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8 text-center">
          <p className="text-white/80 text-sm">
            © 2024 Kochi Metro Rail Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
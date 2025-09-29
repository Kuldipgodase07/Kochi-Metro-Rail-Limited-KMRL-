import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import kmrlLogo from "@/assets/kmrl-logo.png";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Clock, User, Globe } from "lucide-react";

const Header = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }
  ];

  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

  return (
    <header className="bg-white shadow-lg border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <img 
              src={kmrlLogo} 
              alt="Kochi Metro Rail Limited Logo" 
              className="h-16 w-auto"
            />
            <div className="hidden md:block">
              <h1 className="text-metro-teal-dark font-bold text-xl leading-tight">
                KOCHI METRO RAIL LIMITED
              </h1>
              <p className="text-metro-teal-dark text-sm font-medium">
                കൊച്ചി മെട്രോ റെയിൽ ലിമിറ്റഡ്
              </p>
            </div>
          </div>

          {/* Right side - Simple Modern Buttons */}
          <div className="flex items-center space-x-4">
            {/* Time Widget */}
            <div className="hidden md:block text-metro-teal-dark px-4 py-2 rounded-xl hover:text-metro-teal transition-all duration-300 cursor-pointer">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5" />
                <div className="text-right">
                  <div className="font-bold text-lg font-mono tracking-wider">
                    {formatTime(currentTime)}
                  </div>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <Button 
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-metro-teal-dark to-metro-teal-darker hover:from-metro-teal-darker hover:to-metro-teal-dark text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Login</span>
              </div>
            </Button>

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost"
                  className="text-metro-teal-dark hover:text-metro-teal p-3 rounded-xl transition-all duration-300"
                >
                  <Globe className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-white border border-metro-teal/20 shadow-xl rounded-xl overflow-hidden"
              >
                {languages.map((language) => (
                  <DropdownMenuItem 
                    key={language.code}
                    onClick={() => setSelectedLanguage(language)}
                    className="flex items-center space-x-3 p-3 hover:bg-metro-teal/10 cursor-pointer transition-colors duration-200"
                  >
                    <span className="text-2xl">
                      {language.flag}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-metro-teal-dark">
                        {language.name}
                      </div>
                      <div className="text-xs text-gray-500 uppercase font-mono">
                        {language.code}
                      </div>
                    </div>
                    {selectedLanguage.code === language.code && (
                      <div className="w-2 h-2 bg-metro-teal rounded-full" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
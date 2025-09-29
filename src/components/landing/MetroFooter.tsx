import React from "react";

const otherMetroProjects = [
  ["Nagpur", "Mumbai", "Pune", "Thane"],
  ["Lucknow", "Kolkata", "Hyderabad", "Delhi"],
  ["Jaipur", "Indore", "Noida", "Patna"],
  ["Surat", "Kanpur", "Gurgoan", "Bhopal"],
];

const importantLinks = [
  [
    { name: "Government of India", url: "https://india.gov.in/" },
    { name: "Kerala Government", url: "https://kerala.gov.in/" },
    { name: "MoUD, Government of India", url: "https://mohua.gov.in/" },
  ],
  [
    { name: "Kochi Metro Official Site", url: "https://kochimetro.org/" },
    { name: "Kochi Metro Route Map", url: "https://kochimetro.org/route-map/" },
    { name: "Kochi Metro Contact", url: "https://kochimetro.org/contact/" },
  ],
];

const quickLinks = [
  "Site Map",
  "RTI",
  "FAQ's",
  "Security",
  "Help & Contact",
  "Disclaimer",
  "Privacy Policy",
  "Downloads",
];

const MetroFooter = () => {
  return (
    <footer className="bg-gray-50 pt-12 pb-4 border-t border-gray-200 text-gray-800">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Other Metro Projects - Card Style */}
        <div className="rounded-xl p-6 border border-teal-800">
          <h2 className="font-bold text-xl mb-4 text-teal-900">Other Metro Projects</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {otherMetroProjects.flat().map((project) => (
              <a
                key={project}
                href="#"
                className="group flex items-center gap-2 px-3 py-2 rounded-lg border border-teal-100 text-teal-900 font-medium transition duration-200 hover:bg-teal-50 hover:scale-105"
                tabIndex={0}
              >
                <span className="text-lg group-hover:text-teal-700 transition">&gt;</span>
                <span className="group-hover:underline group-hover:text-teal-700 transition">{project}</span>
              </a>
            ))}
          </div>
        </div>
        {/* Important Links - Card Style */}
        <div className="rounded-xl p-6 border border-teal-800">
          <h2 className="font-bold text-xl mb-4 text-teal-900">Important Link</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {importantLinks.flat().map((link) => (
              <a
                key={link.name}
                href={link.url}
                className="group flex items-center gap-2 px-3 py-2 rounded-lg border border-teal-100 text-teal-900 font-medium transition duration-200 hover:bg-teal-50 hover:scale-105"
                tabIndex={0}
              >
                <svg className="w-4 h-4 text-teal-700 group-hover:text-teal-900 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 14L21 3m0 0v7m0-7h-7" /></svg>
                <span className="group-hover:underline group-hover:text-teal-700 transition">{link.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
      {/* Social Media Icons */}
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-center py-4 border-t border-gray-200">
        <div className="flex gap-4 text-xl mt-2 md:mt-0">
          <a href="#" className="hover:text-primary"><i className="fab fa-facebook"></i></a>
          <a href="#" className="hover:text-primary"><i className="fab fa-x-twitter"></i></a>
          <a href="#" className="hover:text-primary"><i className="fab fa-youtube"></i></a>
          <a href="#" className="hover:text-primary"><i className="fab fa-instagram"></i></a>
        </div>
      </div>
    </footer>
  );
};

export default MetroFooter;

import React, { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [results, setResults] = useState([]);
  const [userProfile, setUserProfile] = useState({});
  const [currentView, setCurrentView] = useState('home');
  const [totalMatches, setTotalMatches] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeExplorerTab, setActiveExplorerTab] = useState('categories');
  const [darkMode, setDarkMode] = useState(false);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [darkMode]);

  // Check system preference on load
  useEffect(() => {
    const saved = localStorage.getItem('govscheme-darkmode');
    if (saved !== null) {
      setDarkMode(saved === 'true');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('govscheme-darkmode', String(next));
      return next;
    });
  };

  const LANGUAGES = [
    { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
    { code: 'ur', name: 'Urdu', native: 'اردو', flag: '🇮🇳' },
  ];

  const STATES = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh",
    "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
    "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
    "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
    "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Puducherry", "Lakshadweep"
  ];

  const CATEGORIES = [
    { name: 'Agriculture, Rural & Environment', count: 827, icon: '🌾', color: '#16a34a' },
    { name: 'Banking, Financial Services & Insurance', count: 319, icon: '🏦', color: '#059669' },
    { name: 'Business & Entrepreneurship', count: 712, icon: '💼', color: '#16a34a' },
    { name: 'Education & Learning', count: 1090, icon: '🎓', color: '#15803d' },
    { name: 'Health & Wellness', count: 282, icon: '🏥', color: '#22c55e' },
    { name: 'Housing & Shelter', count: 130, icon: '🏠', color: '#059669' },
    { name: 'Public Safety, Law & Justice', count: 29, icon: '⚖️', color: '#166534' },
    { name: 'Science, IT & Communications', count: 102, icon: '💻', color: '#16a34a' },
    { name: 'Skills & Employment', count: 374, icon: '🔧', color: '#15803d' },
    { name: 'Social Welfare & Empowerment', count: 1466, icon: '🤝', color: '#22c55e' },
    { name: 'Sports & Culture', count: 255, icon: '🏅', color: '#059669' },
    { name: 'Transport & Infrastructure', count: 96, icon: '🚗', color: '#16a34a' },
    { name: 'Travel & Tourism', count: 91, icon: '✈️', color: '#166534' },
    { name: 'Utility & Sanitation', count: 58, icon: '🚿', color: '#15803d' },
    { name: 'Women and Child', count: 463, icon: '👩‍👧', color: '#22c55e' },
  ];

  const MINISTRIES = [
    { name: 'Ministry Of Agriculture and Farmers Welfare', count: 43 },
    { name: 'Ministry Of Ayush', count: 4 },
    { name: 'Ministry Of Chemicals And Fertilizers', count: 3 },
    { name: 'Ministry Of Commerce And Industry', count: 33 },
    { name: 'Ministry Of Communication', count: 6 },
    { name: 'Ministry Of Consumer Affairs, Food And Public Distribution', count: 1 },
    { name: 'Ministry of Corporate Affairs', count: 2 },
    { name: 'Ministry Of Culture', count: 13 },
    { name: 'Ministry Of Defence', count: 16 },
    { name: 'Ministry Of Development Of North Eastern Region', count: 1 },
    { name: 'Ministry of Education', count: 83 },
    { name: 'Ministry of Electronics and Information Technology', count: 9 },
    { name: 'Ministry Of Environment, Forests and Climate Change', count: 2 },
    { name: 'Ministry Of Finance', count: 25 },
    { name: 'Ministry Of Health and Family Welfare', count: 18 },
    { name: 'Ministry Of Housing and Urban Affairs', count: 12 },
    { name: 'Ministry Of Labour and Employment', count: 14 },
    { name: 'Ministry Of Micro Small and Medium Enterprises', count: 22 },
    { name: 'Ministry Of Rural Development', count: 15 },
    { name: 'Ministry Of Social Justice and Empowerment', count: 28 },
    { name: 'Ministry Of Women and Child Development', count: 19 },
    { name: 'Comptroller And Auditor General Of India', count: 2 },
  ];

  const STATE_DATA = [
    { name: 'Andaman and Nicobar Islands', state: 0, ut: 19, central: 602, type: 'UT' },
    { name: 'Andhra Pradesh', state: 51, ut: 0, central: 602, type: 'State' },
    { name: 'Arunachal Pradesh', state: 38, ut: 0, central: 606, type: 'State' },
    { name: 'Assam', state: 75, ut: 0, central: 609, type: 'State' },
    { name: 'Bihar', state: 113, ut: 0, central: 603, type: 'State' },
    { name: 'Chandigarh', state: 0, ut: 20, central: 601, type: 'UT' },
    { name: 'Chhattisgarh', state: 107, ut: 0, central: 603, type: 'State' },
    { name: 'Dadra & Nagar Haveli and Daman & Diu', state: 0, ut: 56, central: 601, type: 'UT' },
    { name: 'Delhi', state: 0, ut: 48, central: 602, type: 'UT' },
    { name: 'Goa', state: 269, ut: 0, central: 602, type: 'State' },
    { name: 'Gujarat', state: 646, ut: 0, central: 603, type: 'State' },
    { name: 'Haryana', state: 247, ut: 0, central: 601, type: 'State' },
    { name: 'Himachal Pradesh', state: 65, ut: 0, central: 601, type: 'State' },
    { name: 'Jammu and Kashmir', state: 0, ut: 43, central: 607, type: 'UT' },
    { name: 'Jharkhand', state: 96, ut: 0, central: 602, type: 'State' },
    { name: 'Karnataka', state: 56, ut: 0, central: 603, type: 'State' },
    { name: 'Kerala', state: 120, ut: 0, central: 602, type: 'State' },
    { name: 'Madhya Pradesh', state: 155, ut: 0, central: 603, type: 'State' },
    { name: 'Maharashtra', state: 423, ut: 0, central: 602, type: 'State' },
    { name: 'Manipur', state: 25, ut: 0, central: 606, type: 'State' },
    { name: 'Meghalaya', state: 45, ut: 0, central: 606, type: 'State' },
    { name: 'Mizoram', state: 22, ut: 0, central: 606, type: 'State' },
    { name: 'Nagaland', state: 18, ut: 0, central: 606, type: 'State' },
    { name: 'Odisha', state: 132, ut: 0, central: 603, type: 'State' },
    { name: 'Punjab', state: 89, ut: 0, central: 601, type: 'State' },
    { name: 'Rajasthan', state: 198, ut: 0, central: 603, type: 'State' },
    { name: 'Sikkim', state: 30, ut: 0, central: 606, type: 'State' },
    { name: 'Tamil Nadu', state: 178, ut: 0, central: 602, type: 'State' },
    { name: 'Telangana', state: 68, ut: 0, central: 602, type: 'State' },
    { name: 'Tripura', state: 35, ut: 0, central: 606, type: 'State' },
    { name: 'Uttar Pradesh', state: 245, ut: 0, central: 603, type: 'State' },
    { name: 'Uttarakhand', state: 72, ut: 0, central: 603, type: 'State' },
    { name: 'West Bengal', state: 142, ut: 0, central: 602, type: 'State' },
    { name: 'Puducherry', state: 0, ut: 28, central: 601, type: 'UT' },
    { name: 'Ladakh', state: 0, ut: 12, central: 607, type: 'UT' },
    { name: 'Lakshadweep', state: 0, ut: 8, central: 601, type: 'UT' },
  ];

  const resetApp = () => {
    setResults([]);
    setUserProfile({});
    setCurrentView('home');
    setTotalMatches(0);
    setSearchQuery('');
    setSearchResults([]);
    setActiveExplorerTab('categories');
  };

  const value = {
    language, setLanguage,
    results, setResults,
    userProfile, setUserProfile,
    currentView, setCurrentView,
    totalMatches, setTotalMatches,
    searchQuery, setSearchQuery,
    searchResults, setSearchResults,
    activeExplorerTab, setActiveExplorerTab,
    darkMode, toggleDarkMode,
    resetApp,
    LANGUAGES, STATES, CATEGORIES, MINISTRIES, STATE_DATA,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
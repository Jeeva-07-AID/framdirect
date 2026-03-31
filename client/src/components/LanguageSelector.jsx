import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem('appLanguage', newLang);
  };

  return (
    <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-100">
      <Globe className="text-primary-600 w-5 h-5" />
      <select 
        value={i18n.language} 
        onChange={handleLanguageChange}
        className="bg-transparent text-gray-700 font-medium focus:outline-none appearance-none cursor-pointer"
      >
        <option value="en">English</option>
        <option value="hi">हिंदी (Hindi)</option>
        <option value="ta">தமிழ் (Tamil)</option>
        <option value="te">తెలుగు (Telugu)</option>
        <option value="ml">മലയാളം (Malayalam)</option>
        <option value="kn">ಕನ್ನಡ (Kannada)</option>
      </select>
    </div>
  );
};

export default LanguageSelector;

import React, { createContext, useContext, useState, useEffect } from "react";

interface LocationContextType {
  city: string;
  setCity: (city: string) => void;
  isLocationSet: boolean;
}

export const cities = [
  { id: "delhi", name: "दिल्ली", nameEn: "Delhi" },
  { id: "mumbai", name: "मुंबई", nameEn: "Mumbai" },
  { id: "bangalore", name: "बैंगलोर", nameEn: "Bangalore" },
  { id: "chennai", name: "चेन्नई", nameEn: "Chennai" },
  { id: "kolkata", name: "कोलकाता", nameEn: "Kolkata" },
  { id: "hyderabad", name: "हैदराबाद", nameEn: "Hyderabad" },
  { id: "pune", name: "पुणे", nameEn: "Pune" },
  { id: "jaipur", name: "जयपुर", nameEn: "Jaipur" },
  { id: "lucknow", name: "लखनऊ", nameEn: "Lucknow" },
  { id: "ahmedabad", name: "अहमदाबाद", nameEn: "Ahmedabad" },
];

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [city, setCityState] = useState<string>(() => {
    return localStorage.getItem("harivant-city") || "";
  });

  const setCity = (newCity: string) => {
    setCityState(newCity);
    localStorage.setItem("harivant-city", newCity);
  };

  const isLocationSet = !!city;

  return (
    <LocationContext.Provider value={{ city, setCity, isLocationSet }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};

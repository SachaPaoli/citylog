import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

export interface VisitedCountry {
  name: string;
  code: string;
  flag: string;
}

export const useVisitedCountries = () => {
  const { user } = useAuth();
  const [visitedCountries, setVisitedCountries] = useState<VisitedCountry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisitedCountries = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get all posts from the user
        const postsQuery = query(
          collection(db, 'posts'),
          where('userId', '==', user.uid)
        );
        
        const postsSnapshot = await getDocs(postsQuery);
        const countries = new Set<string>();
        
        // Extract unique countries from posts
        postsSnapshot.forEach((doc) => {
          const post = doc.data();
          const country = post.country || post.countryName;
          if (country) {
            countries.add(country);
          }
        });

        // Transform country names to country data with flags
        const countryData = Array.from(countries).map((countryName) => {
          const countryCode = getCountryCode(countryName);
          return {
            name: countryName,
            code: countryCode,
            flag: `https://flagcdn.com/w160/${countryCode.toLowerCase()}.png`
          };
        }).sort((a, b) => a.name.localeCompare(b.name));

        setVisitedCountries(countryData);
      } catch (error) {
        console.error('Error fetching visited countries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitedCountries();
  }, [user]);

  return { visitedCountries, loading };
};

// Simple country name to code mapping
const getCountryCode = (countryName: string): string => {
  const countryMap: { [key: string]: string } = {
    'France': 'FR',
    'United States': 'US',
    'USA': 'US',
    'Spain': 'ES',
    'Italy': 'IT',
    'Germany': 'DE',
    'United Kingdom': 'GB',
    'UK': 'GB',
    'Japan': 'JP',
    'China': 'CN',
    'Canada': 'CA',
    'Australia': 'AU',
    'Brazil': 'BR',
    'Mexico': 'MX',
    'India': 'IN',
    'Russia': 'RU',
    'South Korea': 'KR',
    'Netherlands': 'NL',
    'Belgium': 'BE',
    'Switzerland': 'CH',
    'Austria': 'AT',
    'Portugal': 'PT',
    'Greece': 'GR',
    'Turkey': 'TR',
    'Thailand': 'TH',
    'Singapore': 'SG',
    'Malaysia': 'MY',
    'Indonesia': 'ID',
    'Philippines': 'PH',
    'Vietnam': 'VN',
    'Egypt': 'EG',
    'Morocco': 'MA',
    'South Africa': 'ZA',
    'Argentina': 'AR',
    'Chile': 'CL',
    'Colombia': 'CO',
    'Peru': 'PE',
    'Sweden': 'SE',
    'Norway': 'NO',
    'Denmark': 'DK',
    'Finland': 'FI',
    'Poland': 'PL',
    'Czech Republic': 'CZ',
    'Hungary': 'HU',
    'Romania': 'RO',
    'Bulgaria': 'BG',
    'Croatia': 'HR',
    'Slovenia': 'SI',
    'Slovakia': 'SK',
    'Estonia': 'EE',
    'Latvia': 'LV',
    'Lithuania': 'LT',
    'Ireland': 'IE',
    'Iceland': 'IS',
    'Luxembourg': 'LU',
    'Malta': 'MT',
    'Cyprus': 'CY',
    'Israel': 'IL',
    'Jordan': 'JO',
    'Lebanon': 'LB',
    'United Arab Emirates': 'AE',
    'UAE': 'AE',
    'Saudi Arabia': 'SA',
    'Qatar': 'QA',
    'Kuwait': 'KW',
    'Bahrain': 'BH',
    'Oman': 'OM',
    'New Zealand': 'NZ',
    'Hong Kong': 'HK',
    'Taiwan': 'TW',
    'Macao': 'MO',
    'Mongolia': 'MN',
    'Kazakhstan': 'KZ',
    'Uzbekistan': 'UZ',
    'Kyrgyzstan': 'KG',
    'Tajikistan': 'TJ',
    'Turkmenistan': 'TM',
    'Georgia': 'GE',
    'Armenia': 'AM',
    'Azerbaijan': 'AZ',
    'Belarus': 'BY',
    'Ukraine': 'UA',
    'Moldova': 'MD',
    'Serbia': 'RS',
    'Montenegro': 'ME',
    'Bosnia and Herzegovina': 'BA',
    'North Macedonia': 'MK',
    'Albania': 'AL',
    'Kosovo': 'XK',
  };

  return countryMap[countryName] || 'XX'; // XX for unknown countries
};

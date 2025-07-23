import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

interface WorldMapProps {
  visitedCountries: string[];
  onCountryPress: (country: string) => void;
}

// Données SVG réelles des pays (formes géographiques simplifiées mais reconnaissables)
const worldCountries = {
  // Europe
  'France': {
    path: 'M200,150 C205,145 210,145 215,150 C220,155 225,160 220,165 C215,170 210,175 205,170 C200,165 195,160 200,150 Z',
    name: 'France',
    region: 'Europe'
  },
  'Spain': {
    path: 'M180,165 C190,160 200,162 205,170 C200,180 190,185 180,180 C175,175 175,170 180,165 Z',
    name: 'Spain',
    region: 'Europe'
  },
  'Italy': {
    path: 'M215,160 C220,155 225,160 225,170 C230,180 228,190 225,195 C220,185 215,175 215,160 Z',
    name: 'Italy',
    region: 'Europe'
  },
  'Germany': {
    path: 'M210,135 C220,130 230,135 235,145 C230,155 220,160 210,155 C205,150 205,140 210,135 Z',
    name: 'Germany',
    region: 'Europe'
  },
  'UK': {
    path: 'M185,120 C195,115 200,120 195,130 C190,135 185,130 180,125 C180,120 185,120 185,120 Z',
    name: 'United Kingdom',
    region: 'Europe'
  },
  'Norway': {
    path: 'M200,100 C210,95 215,105 220,115 C215,125 205,120 200,110 C195,105 200,100 200,100 Z',
    name: 'Norway',
    region: 'Europe'
  },
  'Sweden': {
    path: 'M220,105 C230,100 235,110 240,120 C235,130 225,125 220,115 C215,110 220,105 220,105 Z',
    name: 'Sweden',
    region: 'Europe'
  },
  'Russia': {
    path: 'M250,110 C300,105 350,110 400,115 C405,130 380,140 350,135 C300,130 250,125 250,110 Z',
    name: 'Russia',
    region: 'Europe/Asia'
  },
  'Poland': {
    path: 'M230,140 C240,135 250,140 245,150 C240,160 230,155 225,145 C225,140 230,140 230,140 Z',
    name: 'Poland',
    region: 'Europe'
  },
  'Netherlands': {
    path: 'M200,130 C205,125 210,130 205,135 C200,140 195,135 195,130 C195,125 200,130 200,130 Z',
    name: 'Netherlands',
    region: 'Europe'
  },

  // North America
  'USA': {
    path: 'M80,120 C140,110 160,115 170,130 C165,150 150,160 120,155 C90,150 70,140 80,120 Z',
    name: 'United States',
    region: 'North America'
  },
  'Canada': {
    path: 'M70,80 C150,70 180,75 190,90 C185,110 160,105 130,100 C90,95 60,90 70,80 Z',
    name: 'Canada',
    region: 'North America'
  },
  'Mexico': {
    path: 'M80,160 C120,155 140,160 135,175 C130,185 110,180 90,175 C75,170 80,160 80,160 Z',
    name: 'Mexico',
    region: 'North America'
  },

  // South America
  'Brazil': {
    path: 'M120,200 C160,195 170,210 165,240 C160,270 140,280 120,275 C100,270 95,250 100,230 C105,210 120,200 120,200 Z',
    name: 'Brazil',
    region: 'South America'
  },
  'Argentina': {
    path: 'M110,260 C130,255 140,270 135,300 C130,320 120,325 110,320 C100,315 95,295 100,275 C105,265 110,260 110,260 Z',
    name: 'Argentina',
    region: 'South America'
  },
  'Chile': {
    path: 'M100,250 C105,245 110,260 108,290 C106,310 102,315 98,310 C94,305 95,280 100,250 Z',
    name: 'Chile',
    region: 'South America'
  },
  'Peru': {
    path: 'M105,220 C115,215 125,225 120,245 C115,255 105,250 100,240 C95,230 105,220 105,220 Z',
    name: 'Peru',
    region: 'South America'
  },

  // Asia
  'China': {
    path: 'M340,140 C380,135 400,145 395,165 C390,185 370,190 350,185 C330,180 325,165 330,150 C335,145 340,140 340,140 Z',
    name: 'China',
    region: 'Asia'
  },
  'India': {
    path: 'M300,170 C320,165 335,175 330,195 C325,210 310,215 300,210 C290,205 285,190 290,180 C295,175 300,170 300,170 Z',
    name: 'India',
    region: 'Asia'
  },
  'Japan': {
    path: 'M410,145 C420,140 430,145 428,155 C426,165 420,170 415,165 C410,160 408,150 410,145 Z',
    name: 'Japan',
    region: 'Asia'
  },
  'South Korea': {
    path: 'M395,150 C400,145 405,150 403,155 C401,160 398,158 395,155 C393,152 395,150 395,150 Z',
    name: 'South Korea',
    region: 'Asia'
  },
  'Thailand': {
    path: 'M320,185 C325,180 335,185 333,195 C331,205 325,208 320,205 C315,200 318,190 320,185 Z',
    name: 'Thailand',
    region: 'Asia'
  },
  'Indonesia': {
    path: 'M320,210 C350,205 370,215 365,225 C360,235 340,240 320,235 C300,230 315,220 320,210 Z',
    name: 'Indonesia',
    region: 'Asia'
  },

  // Africa
  'Egypt': {
    path: 'M240,180 C250,175 260,180 258,190 C256,200 250,205 245,200 C240,195 238,185 240,180 Z',
    name: 'Egypt',
    region: 'Africa'
  },
  'South Africa': {
    path: 'M240,260 C260,255 270,265 265,275 C260,285 250,280 245,275 C240,270 235,265 240,260 Z',
    name: 'South Africa',
    region: 'Africa'
  },
  'Nigeria': {
    path: 'M220,200 C230,195 240,200 238,210 C236,220 230,225 225,220 C220,215 218,205 220,200 Z',
    name: 'Nigeria',
    region: 'Africa'
  },
  'Morocco': {
    path: 'M190,170 C200,165 210,170 208,180 C206,190 200,195 195,190 C190,185 188,175 190,170 Z',
    name: 'Morocco',
    region: 'Africa'
  },
  'Kenya': {
    path: 'M260,220 C270,215 275,225 273,235 C271,245 265,248 260,245 C255,240 258,230 260,220 Z',
    name: 'Kenya',
    region: 'Africa'
  },

  // Oceania
  'Australia': {
    path: 'M360,250 C400,245 420,255 415,275 C410,295 390,300 370,295 C350,290 345,275 350,260 C355,255 360,250 360,250 Z',
    name: 'Australia',
    region: 'Oceania'
  },
  'New Zealand': {
    path: 'M420,280 C430,275 435,285 433,295 C431,305 425,308 420,305 C415,300 418,290 420,280 Z',
    name: 'New Zealand',
    region: 'Oceania'
  }
};

export function InteractiveWorldMap({ visitedCountries, onCountryPress }: WorldMapProps) {
  const textColor = useThemeColor({}, 'text');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  
  const screenWidth = Dimensions.get('window').width;
  const mapWidth = screenWidth - 32;
  const mapHeight = 350;

  const handleCountryPress = (countryId: string) => {
    setSelectedCountry(selectedCountry === countryId ? null : countryId);
    onCountryPress(countryId);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: textColor }]}>🌍 Carte du Monde Interactive</Text>
      <Text style={[styles.subtitle, { color: textColor }]}>
        Cliquez sur un pays pour voir vos villes visitées
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.mapScrollContainer}
        contentContainerStyle={styles.mapScrollContent}
      >
        <View style={[styles.mapContainer, { width: Math.max(mapWidth, 500), height: mapHeight }]}>
          <Svg width={Math.max(mapWidth, 500)} height={mapHeight} viewBox="0 0 500 350">
            {/* Fond océan */}
            <Path
              d="M0,0 L500,0 L500,350 L0,350 Z"
              fill="#1e40af"
              opacity={0.2}
            />
            
            {/* Pays */}
            <G>
              {Object.entries(worldCountries).map(([countryId, country]) => {
                const isVisited = visitedCountries.includes(countryId);
                const isSelected = selectedCountry === countryId;
                
                return (
                  <G key={countryId}>
                    <Path
                      d={country.path}
                      fill={isVisited ? '#10b981' : '#6b7280'}
                      stroke={isSelected ? '#f59e0b' : '#374151'}
                      strokeWidth={isSelected ? 2 : 0.5}
                      opacity={isVisited ? 1 : 0.7}
                      onPress={() => handleCountryPress(countryId)}
                    />
                  </G>
                );
              })}
            </G>
          </Svg>
          
          {/* Overlay pour les touches */}
          <View style={styles.touchOverlay}>
            {Object.entries(worldCountries).map(([countryId, country]) => {
              // Positions approximatives pour les zones tactiles
              const touchAreas: Record<string, {x: number, y: number, width: number, height: number}> = {
                'France': {x: 190, y: 140, width: 40, height: 40},
                'Spain': {x: 170, y: 155, width: 40, height: 35},
                'USA': {x: 70, y: 110, width: 100, height: 50},
                'Brazil': {x: 110, y: 190, width: 60, height: 90},
                'China': {x: 330, y: 130, width: 70, height: 60},
                'India': {x: 290, y: 160, width: 50, height: 60},
                'Australia': {x: 350, y: 240, width: 70, height: 60},
                'Russia': {x: 240, y: 100, width: 170, height: 40},
                'Canada': {x: 60, y: 70, width: 130, height: 40},
                'Japan': {x: 400, y: 135, width: 35, height: 40},
                // Ajoutez d'autres zones tactiles selon les besoins
              };

              const touchArea = touchAreas[countryId];
              if (!touchArea) return null;

              return (
                <TouchableOpacity
                  key={`touch-${countryId}`}
                  style={[
                    styles.countryTouchArea,
                    {
                      left: touchArea.x,
                      top: touchArea.y,
                      width: touchArea.width,
                      height: touchArea.height,
                    }
                  ]}
                  onPress={() => handleCountryPress(countryId)}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Légende */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#10b981' }]} />
          <Text style={[styles.legendText, { color: textColor }]}>Pays visités ({visitedCountries.length})</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#6b7280' }]} />
          <Text style={[styles.legendText, { color: textColor }]}>Pas encore visités</Text>
        </View>
      </View>

      {/* Info pays sélectionné */}
      {selectedCountry && (
        <View style={styles.selectedCountryInfo}>
          <Text style={[styles.selectedCountryText, { color: textColor }]}>
            📍 {worldCountries[selectedCountry as keyof typeof worldCountries]?.name}
          </Text>
          <Text style={[styles.regionText, { color: textColor }]}>
            {worldCountries[selectedCountry as keyof typeof worldCountries]?.region}
          </Text>
          {visitedCountries.includes(selectedCountry) ? (
            <Text style={[styles.statusText, { color: '#10b981' }]}>
              ✅ Vous avez visité ce pays
            </Text>
          ) : (
            <Text style={[styles.statusText, { color: '#6b7280' }]}>
              🎯 Pas encore exploré
            </Text>
          )}
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={[styles.statsText, { color: textColor }]}>
          🌍 {visitedCountries.length}/{Object.keys(worldCountries).length} pays visités
        </Text>
        <Text style={[styles.statsText, { color: textColor }]}>
          🎯 {Math.round((visitedCountries.length / Object.keys(worldCountries).length) * 100)}% du monde exploré
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  mapScrollContainer: {
    marginBottom: 16,
  },
  mapScrollContent: {
    paddingHorizontal: 16,
  },
  mapContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 8,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  touchOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
  },
  countryTouchArea: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  legend: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  selectedCountryInfo: {
    padding: 16,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    minWidth: 250,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedCountryText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  regionText: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    alignItems: 'center',
    gap: 4,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.9,
  },
});

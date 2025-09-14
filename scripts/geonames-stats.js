// Script pour tester les statistiques de l'API GeoNames
// Utilise Node.js pour faire des requêtes HTTP

const https = require('https');

const GEONAMES_USERNAME = 'django0525';

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Erreur parsing JSON: ' + e.message));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function getGeoNamesStats() {
  console.log('🔍 Test de l\'API GeoNames...\n');

  try {
    // Test 1: Recherche globale pour voir la réponse
    console.log('📊 Test 1: Recherche "Paris" (limite 1000)');
    const parisUrl = `https://secure.geonames.org/searchJSON?q=Paris&maxRows=1000&featureClass=P&cities=cities500&username=${GEONAMES_USERNAME}`;
    const parisData = await makeRequest(parisUrl);
    console.log(`✅ Trouvé ${parisData.geonames?.length || 0} villes nommées "Paris"`);
    console.log(`📝 Total résultats possibles: ${parisData.totalResultsCount || 'non spécifié'}\n`);

    // Test 2: Recherche par pays populaires
    const countries = [
      { code: 'FR', name: 'France' },
      { code: 'US', name: 'États-Unis' },
      { code: 'DE', name: 'Allemagne' },
      { code: 'IT', name: 'Italie' },
      { code: 'ES', name: 'Espagne' },
      { code: 'GB', name: 'Royaume-Uni' }
    ];

    console.log('📊 Test 2: Nombre de villes par pays (500+ hab)');
    for (const country of countries) {
      try {
        const countryUrl = `https://secure.geonames.org/searchJSON?country=${country.code}&featureClass=P&cities=cities500&maxRows=1000&username=${GEONAMES_USERNAME}`;
        const countryData = await makeRequest(countryUrl);
        console.log(`🇫🇷 ${country.name} (${country.code}): ${countryData.geonames?.length || 0} villes (limite 1000)`);
        
        // Petite pause pour ne pas surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.log(`❌ Erreur pour ${country.name}: ${error.message}`);
      }
    }

    // Test 3: Recherche générale de villes
    console.log('\n📊 Test 3: Recherche générale de grandes villes');
    const bigCitiesUrl = `https://secure.geonames.org/searchJSON?q=city&featureClass=P&cities=cities500&maxRows=1000&orderby=population&username=${GEONAMES_USERNAME}`;
    const bigCitiesData = await makeRequest(bigCitiesUrl);
    console.log(`✅ Trouvé ${bigCitiesData.geonames?.length || 0} grandes villes`);
    
    if (bigCitiesData.geonames && bigCitiesData.geonames.length > 0) {
      console.log('\n🏙️ Top 10 des villes par population:');
      bigCitiesData.geonames.slice(0, 10).forEach((city, index) => {
        console.log(`${index + 1}. ${city.name}, ${city.countryName} (${parseInt(city.population).toLocaleString()} hab.)`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Fonction pour tester différents types de recherches
async function testSearchVariations() {
  console.log('\n\n🔍 Test de différents types de recherches:\n');
  
  const searchTests = [
    { query: 'New York', description: 'Ville spécifique' },
    { query: 'London', description: 'Nom commun' },
    { query: 'San', description: 'Préfixe commun' },
    { query: 'berg', description: 'Suffixe commun' }
  ];

  for (const test of searchTests) {
    try {
      const url = `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(test.query)}&featureClass=P&cities=cities500&maxRows=100&username=${GEONAMES_USERNAME}`;
      const data = await makeRequest(url);
      console.log(`🔍 "${test.query}" (${test.description}): ${data.geonames?.length || 0} résultats`);
      
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.log(`❌ Erreur pour "${test.query}": ${error.message}`);
    }
  }
}

// Exécution du script
async function main() {
  console.log('🌍 === STATISTIQUES API GEONAMES ===\n');
  console.log(`👤 Username: ${GEONAMES_USERNAME}`);
  console.log('🔒 Filtres: Villes avec 500+ habitants\n');
  
  await getGeoNamesStats();
  await testSearchVariations();
  
  console.log('\n\n📋 === RÉSUMÉ ===');
  console.log('• GeoNames contient des millions de villes');
  console.log('• Filtre cities500 = villes avec 500+ habitants');
  console.log('• Environ 200,000+ villes dans cette catégorie');
  console.log('• Données mises à jour régulièrement');
  console.log('• Limite API: 30,000 requêtes/jour pour compte gratuit');
}

main().catch(console.error);
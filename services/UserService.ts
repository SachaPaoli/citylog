// Supprimer une ville visitée précise (par city, country, source, et optionnellement postId)
export async function removeVisitedCity(city: string, country: string, source: 'post' | 'note', postId?: string) {
  const user = getAuth().currentUser;
  if (!user) throw new Error('Not authenticated');
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const arr = (snap.data()?.visitedCities || []);
  console.log('Avant suppression visitedCities:', arr);
  // On filtre toutes les entrées à supprimer
  const filtered = arr.filter((c: any) => {
    const matchCity = (c.city === city || c.name === city);
    const matchCountry = c.country === country;
    const matchSource = c.source === source;
    // postId n'est pris en compte que si présent dans l'objet
    const matchPostId = (postId === undefined || c.postId === undefined || c.postId === postId);
    console.log('Comparaison suppression:', {c, matchCity, matchCountry, matchSource, matchPostId});
    if (matchCity && matchCountry && matchSource && matchPostId) {
      return false;
    }
    return true;
  });
  await updateDoc(ref, {
    visitedCities: filtered
  });
  // Vérification après suppression
  const snapAfter = await getDoc(ref);
  const arrAfter = (snapAfter.data()?.visitedCities || []);
  console.log('Après suppression visitedCities:', arrAfter);
  // Optionnel: throw si la suppression n'a pas eu lieu
  const stillThere = arrAfter.find((c: any) => {
    const matchCity = (c.city === city || c.name === city);
    const matchCountry = c.country === country;
    const matchSource = c.source === source;
    const matchPostId = (postId === undefined || c.postId === undefined || c.postId === postId);
    return matchCity && matchCountry && matchSource && matchPostId;
  });
  if (stillThere) {
    throw new Error('Suppression échouée: la ville est toujours présente dans visitedCities');
  }
}
import { getAuth } from 'firebase/auth';
import { arrayRemove, arrayUnion, doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore';
export async function getUserFavorites() {
  const user = getAuth().currentUser;
  if (!user) throw new Error('Not authenticated');
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  const data = snap.data();
  return data?.favorites || [null, null, null];
}

const db = getFirestore();

export async function addFavorite(city: string, country: string, flag?: string, countryCode?: string, index?: number) {
  const user = getAuth().currentUser;
  if (!user) throw new Error('Not authenticated');
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  let arr = snap.data()?.favorites || [null, null, null];
  arr = Array.isArray(arr) ? arr : [null, null, null];
  if (typeof index === 'number' && index >= 0 && index < 3) {
    arr[index] = { city, country, flag: flag || '', countryCode };
  }
  await updateDoc(ref, { favorites: arr });
}

export async function removeFavorite(city: string, country: string) {
  const user = getAuth().currentUser;
  if (!user) throw new Error('Not authenticated');
  const ref = doc(db, 'users', user.uid);
  await updateDoc(ref, {
    favorites: arrayRemove({ city, country })
  });
}

export async function addVisitedCity(city: string, country: string, source: 'post' | 'note', postId?: string) {
  const user = getAuth().currentUser;
  if (!user) throw new Error('Not authenticated');
  const ref = doc(db, 'users', user.uid);
  const obj: any = { city, country, source };
  if (postId) obj.postId = postId;
  await updateDoc(ref, {
    visitedCities: arrayUnion(obj)
  });
}

export async function addRating(city: string, country: string, rating: number) {
  const user = getAuth().currentUser;
  if (!user) throw new Error('Not authenticated');
  const ref = doc(db, 'users', user.uid);
  await updateDoc(ref, {
    ratings: arrayUnion({ city, country, rating })
  });
}

export async function getUserData() {
  const user = getAuth().currentUser;
  if (!user) throw new Error('Not authenticated');
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

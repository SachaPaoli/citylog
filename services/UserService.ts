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

export async function addVisitedCity(city: string, country: string, source: 'post' | 'note') {
  const user = getAuth().currentUser;
  if (!user) throw new Error('Not authenticated');
  const ref = doc(db, 'users', user.uid);
  await updateDoc(ref, {
    visitedCities: arrayUnion({ city, country, source })
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

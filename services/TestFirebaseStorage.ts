import { storage } from '@/config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Test simple Firebase Storage
export const testFirebaseStorage = async () => {
  try {
    console.log('🧪 Test Firebase Storage...');
    
    // Créer un blob simple pour tester
    const testData = new Blob(['Hello Firebase Storage!'], { type: 'text/plain' });
    
    // Référence de test
    const testRef = ref(storage, 'test/test.txt');
    
    // Upload du test
    const snapshot = await uploadBytes(testRef, testData);
    console.log('✅ Upload test réussi:', snapshot.metadata.name);
    
    // Obtenir l'URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('✅ URL test:', downloadURL);
    
    return true;
  } catch (error) {
    console.error('❌ Test Firebase Storage échoué:', error);
    return false;
  }
};

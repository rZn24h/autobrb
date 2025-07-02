import { db, storage } from './firebase';
import { collection, addDoc, Timestamp, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export async function addCar(data: any, images: File[], userId: string, coverImageIndex: number) {
  try {
    // 1. Upload images to Firebase Storage and get URLs
    const imageUrls: string[] = [];
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const storageRef = ref(storage, `cars/${userId}/${Date.now()}_${i}_${image.name}`);
      await uploadBytes(storageRef, image);
      const url = await getDownloadURL(storageRef);
      imageUrls.push(url);
    }

    // 2. Prepare car data
    const carData = {
      ...data,
      images: imageUrls,
      userId,
      createdAt: Timestamp.now(),
      coverImage: imageUrls[coverImageIndex] || imageUrls[0],
    };

    // 3. Save to Firestore
    const docRef = await addDoc(collection(db, 'cars'), carData);
    return docRef.id;
  } catch (error) {
    console.error('Error in addCar function:', error);
    throw error;
  }
}

export async function updateCar(id: string, data: any, newImages?: File[], coverImage?: string) {
  // 1. Get current car data
  const carRef = doc(db, 'cars', id);
  const carDoc = await getDoc(carRef);
  if (!carDoc.exists()) {
    throw new Error('Anunțul nu există');
  }
  const currentData = carDoc.data();

  // 2. Upload new images if any (opțional, dacă folosești newImages)
  // (poți elimina complet logica cu newImages dacă nu o folosești)

  // 3. Prepare update data - suprascrie complet images cu data.images
  const updateData = {
    ...data,
    images: data.images || [],
    coverImage: coverImage || data.coverImage || (data.images && data.images[0]) || '',
    updatedAt: Timestamp.now(),
  };

  // 4. Update Firestore document
  await updateDoc(carRef, updateData);
  return id;
}

export async function deleteCar(id: string) {
  // Get car document
  const carDoc = await getDoc(doc(db, 'cars', id));
  if (!carDoc.exists()) return;
  const carData = carDoc.data();
  
  // Delete images from Storage
  if (carData.images && Array.isArray(carData.images)) {
    for (const url of carData.images) {
      try {
        const path = decodeURIComponent(url.split('/o/')[1].split('?')[0]);
        const imageRef = ref(storage, path);
        await deleteObject(imageRef);
      } catch (e) {
        // ignore individual image errors
      }
    }
  }
  
  // Delete Firestore doc
  await deleteDoc(doc(db, 'cars', id));
} 
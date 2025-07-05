import { addDoc, collection, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { processImage } from './imageProcessing';

export interface RentalFormData {
  title: string;
  marca: string;
  model: string;
  an: string;
  pret: string;
  km: string;
  caroserie: string;
  transmisie: string;
  combustibil: string;
  capacitate: string;
  putere?: string;
  tractiune?: string;
  descriere: string;
  dotari?: string;
  contact?: string;
  locatie?: string;
}

export const addRental = async (
  formData: RentalFormData,
  images: File[],
  userId: string,
  coverImageIndex: number = 0
) => {
  try {
    // Upload images to Firebase Storage
    const imageUrls: string[] = [];
    
    // Process images sequentially to avoid overwhelming the browser
    for (let i = 0; i < images.length; i++) {
      try {
        const image = images[i];
        const processedImage = await processImage(image);
        if (!processedImage) {
          throw new Error(`Eroare la procesarea imaginii ${i + 1}`);
        }
        const imageRef = ref(storage, `rentals/${Date.now()}_${i}_${image.name}`);
        const snapshot = await uploadBytes(imageRef, processedImage.file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        imageUrls.push(downloadURL);
      } catch (error) {
        console.error(`Error processing image ${i + 1}:`, error);
        throw new Error(`Eroare la procesarea imaginii ${i + 1}: ${error instanceof Error ? error.message : 'Eroare necunoscută'}`);
      }
    }

    // Prepare rental data
    const rentalData = {
      ...formData,
      an: parseInt(formData.an),
      km: parseInt(formData.km),
      capacitate: parseInt(formData.capacitate),
      putere: formData.putere ? parseInt(formData.putere) : null,
      images: imageUrls,
      coverImage: imageUrls[coverImageIndex],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
    };

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'rentals'), rentalData);
    
    return {
      id: docRef.id,
      ...rentalData
    };
  } catch (error) {
    console.error('Error adding rental:', error);
    throw new Error(error instanceof Error ? error.message : 'Eroare la adăugarea închirierii');
  }
};

export const updateRental = async (
  rentalId: string,
  formData: RentalFormData,
  newImages: File[],
  existingImages: string[],
  coverImageIndex: number = 0,
  deletedImageIndexes: number[] = []
) => {
  try {
    let imageUrls = [...existingImages];
    
    // Remove deleted images
    deletedImageIndexes.forEach(index => {
      if (imageUrls[index]) {
        const imageRef = ref(storage, imageUrls[index]);
        deleteObject(imageRef).catch(console.error);
        imageUrls.splice(index, 1);
      }
    });

    // Upload new images
    if (newImages.length > 0) {
      const uploadPromises = newImages.map(async (image, index) => {
        const processedImage = await processImage(image);
        if (!processedImage) {
          throw new Error(`Eroare la procesarea imaginii ${index + 1}`);
        }
        const imageRef = ref(storage, `rentals/${Date.now()}_${index}_${image.name}`);
        const snapshot = await uploadBytes(imageRef, processedImage.file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
      });

      const newImageUrls = await Promise.all(uploadPromises);
      imageUrls.push(...newImageUrls);
    }

    // Prepare updated rental data
    const updatedRentalData = {
      ...formData,
      an: parseInt(formData.an),
      km: parseInt(formData.km),
      capacitate: parseInt(formData.capacitate),
      putere: formData.putere ? parseInt(formData.putere) : null,
      images: imageUrls,
      coverImage: imageUrls[coverImageIndex],
      updatedAt: new Date(),
    };

    // Update in Firestore
    const rentalRef = doc(db, 'rentals', rentalId);
    await updateDoc(rentalRef, updatedRentalData);
    
    return {
      id: rentalId,
      ...updatedRentalData
    };
  } catch (error) {
    console.error('Error updating rental:', error);
    throw new Error('Eroare la actualizarea închirierii');
  }
};

export const deleteRental = async (rentalId: string, imageUrls: string[]) => {
  try {
    // Delete images from storage
    const deleteImagePromises = imageUrls.map(async (imageUrl) => {
      try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    });

    await Promise.all(deleteImagePromises);

    // Delete from Firestore
    await deleteDoc(doc(db, 'rentals', rentalId));
    
    return true;
  } catch (error) {
    console.error('Error deleting rental:', error);
    throw new Error('Eroare la ștergerea închirierii');
  }
}; 
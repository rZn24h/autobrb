import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface FacebookPost {
  id?: string;
  title: string;
  facebookUrl: string;
  iframeCode: string;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
  createdBy: string;
}

// Add a new Facebook post
export const addFacebookPost = async (
  postData: Omit<FacebookPost, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "facebookPosts"), {
      ...postData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error adding Facebook post:", error);
    throw new Error("Eroare la adăugarea postării Facebook");
  }
};

// Get all Facebook posts
export const getFacebookPosts = async (): Promise<FacebookPost[]> => {
  try {
    const q = query(
      collection(db, "facebookPosts"),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const posts: FacebookPost[] = [];

    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data(),
      } as FacebookPost);
    });

    return posts;
  } catch (error) {
    console.error("Error getting Facebook posts:", error);
    throw new Error("Eroare la încărcarea postărilor Facebook");
  }
};

// Get active Facebook posts only
export const getActiveFacebookPosts = async (): Promise<FacebookPost[]> => {
  try {
    const q = query(
      collection(db, "facebookPosts"),
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const posts: FacebookPost[] = [];

    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data(),
      } as FacebookPost);
    });

    return posts;
  } catch (error) {
    console.error("Error getting active Facebook posts:", error);
    throw new Error("Eroare la încărcarea postărilor Facebook active");
  }
};

// Update a Facebook post
export const updateFacebookPost = async (
  postId: string,
  updates: Partial<FacebookPost>
): Promise<void> => {
  try {
    const postRef = doc(db, "facebookPosts", postId);
    await updateDoc(postRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating Facebook post:", error);
    throw new Error("Eroare la actualizarea postării Facebook");
  }
};

// Delete a Facebook post
export const deleteFacebookPost = async (postId: string): Promise<void> => {
  try {
    const postRef = doc(db, "facebookPosts", postId);
    await deleteDoc(postRef);
  } catch (error) {
    console.error("Error deleting Facebook post:", error);
    throw new Error("Eroare la ștergerea postării Facebook");
  }
};

// Toggle active status of a Facebook post
export const toggleFacebookPostStatus = async (
  postId: string,
  currentStatus: boolean
): Promise<void> => {
  try {
    await updateFacebookPost(postId, { isActive: !currentStatus });
  } catch (error) {
    console.error("Error toggling Facebook post status:", error);
    throw new Error("Eroare la actualizarea statusului postării Facebook");
  }
};

// Get Facebook post by ID
export const getFacebookPostById = async (
  postId: string
): Promise<FacebookPost | null> => {
  try {
    const postRef = doc(db, "facebookPosts", postId);
    const postSnap = await getDocs(
      query(collection(db, "facebookPosts"), where("__name__", "==", postId))
    );

    if (postSnap.empty) {
      return null;
    }

    const postDoc = postSnap.docs[0];
    return {
      id: postDoc.id,
      ...postDoc.data(),
    } as FacebookPost;
  } catch (error) {
    console.error("Error getting Facebook post by ID:", error);
    throw new Error("Eroare la încărcarea postării Facebook");
  }
};

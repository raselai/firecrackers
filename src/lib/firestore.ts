import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query,
  where,
  orderBy
} from "firebase/firestore";
import { db } from "./firebase";

// Product interface
export interface Product {
  id?: string;
  name: string;
  price: number;
  offerPrice?: number; // Sale price when isOnSale is true
  description?: string;
  category: string;
  subcategory: string;
  image?: string;
  images?: string[];
  galleryImages?: string[]; // Additional gallery images for product detail page
  // Firecracker-specific fields
  effectType?: string;
  duration?: string;
  noiseLevel?: string;
  shotCount?: number;
  safetyDistance?: string;
  color?: string;
  inStock: boolean;
  featured?: boolean;
  seasonal?: boolean;
  isOnSale?: boolean; // Sale flag
  createdAt?: Date;
  updatedAt?: Date;
}

const removeUndefinedFields = <T extends Record<string, unknown>>(data: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
};

// Add a new product
export const addProduct = async (product: Omit<Product, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, "products"), {
      ...removeUndefinedFields(product),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...product };
  } catch (error) {
    console.error("Error adding product: ", error);
    throw error;
  }
};

// Update a product
export const updateProduct = async (id: string, product: Partial<Product>) => {
  try {
    const productRef = doc(db, "products", id);
    await updateDoc(productRef, {
      ...removeUndefinedFields(product),
      updatedAt: new Date()
    });
    return { id, ...product };
  } catch (error) {
    console.error("Error updating product: ", error);
    throw error;
  }
};

// Delete a product
export const deleteProduct = async (id: string) => {
  try {
    await deleteDoc(doc(db, "products", id));
    return { id };
  } catch (error) {
    console.error("Error deleting product: ", error);
    throw error;
  }
};

// Get all products
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    // Fetch all products first (without ordering to avoid missing field errors)
    const querySnapshot = await getDocs(collection(db, "products"));
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
    
    // Sort by creation date (newest first) in JavaScript
    console.log(`Firestore: Found ${products.length} products, sorting by creation date...`);
    const sortedProducts = products.sort((a, b) => {
      // Handle different createdAt field types (Firestore Timestamp or Date)
      let aDate: Date;
      let bDate: Date;
      
      if (!a.createdAt) {
        aDate = new Date(0);
      } else if (typeof a.createdAt === 'object' && 'seconds' in a.createdAt) {
        // Firestore Timestamp object
        aDate = new Date((a.createdAt as any).seconds * 1000);
      } else {
        // Regular Date object or string
        aDate = new Date(a.createdAt as any);
      }
      
      if (!b.createdAt) {
        bDate = new Date(0);
      } else if (typeof b.createdAt === 'object' && 'seconds' in b.createdAt) {
        // Firestore Timestamp object
        bDate = new Date((b.createdAt as any).seconds * 1000);
      } else {
        // Regular Date object or string
        bDate = new Date(b.createdAt as any);
      }
      
      console.log(`Firestore: Comparing ${a.name} (${aDate.toISOString()}) vs ${b.name} (${bDate.toISOString()})`);
      return bDate.getTime() - aDate.getTime(); // Descending order (newest first)
    });
    
    console.log(`Firestore: Sorted products - first 3:`, sortedProducts.slice(0, 3).map(p => ({ name: p.name, createdAt: p.createdAt })));
    return sortedProducts;
  } catch (error) {
    console.error("Error getting products: ", error);
    throw error;
  }
};

// Get product by ID
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting product: ", error);
    throw error;
  }
};

// Get products by category
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, "products"),
      where("category", "==", category),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  } catch (error) {
    console.error("Error getting products by category: ", error);
    throw error;
  }
};

// Get products by subcategory
export const getProductsBySubcategory = async (subcategory: string): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, "products"),
      where("subcategory", "==", subcategory),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  } catch (error) {
    console.error("Error getting products by subcategory: ", error);
    throw error;
  }
};

// Get featured products
export const getFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, "products"),
      where("featured", "==", true),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  } catch (error) {
    console.error("Error getting featured products: ", error);
    throw error;
  }
};

// Get seasonal products
export const getSeasonalProducts = async (): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, "products"),
      where("seasonal", "==", true),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  } catch (error) {
    console.error("Error getting seasonal products: ", error);
    throw error;
  }
}; 

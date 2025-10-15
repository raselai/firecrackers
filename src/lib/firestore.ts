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
  description: string;
  category: string;
  subcategory: string;
  image: string;
  images?: string[];
  galleryImages?: string[]; // Additional gallery images for product detail page
  wattage?: number | string;
  color?: string;
  material?: string;
  dimensions?: string;
  inStock: boolean;
  featured?: boolean;
  seasonal?: boolean;
  isOnSale?: boolean; // Sale flag
  createdAt?: Date;
  updatedAt?: Date;
}

// Add a new product
export const addProduct = async (product: Omit<Product, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, "products"), {
      ...product,
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
      ...product,
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
    const querySnapshot = await getDocs(collection(db, "products"));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
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
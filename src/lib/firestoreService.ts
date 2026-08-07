import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  getDoc,
  addDoc
} 
from 'firebase/firestore';
import { db } from './firebase';
import { Product, PRODUCTS } from '../data/products';
import { UserAccount, FooterConfig, DEFAULT_FOOTER_CONFIG } from '../types/auth';

const PRODUCTS_COLLECTION = 'products';
const USERS_COLLECTION = 'users';
const LOGS_COLLECTION = 'login_logs';
const META_COLLECTION = '_metadata';
const SETTINGS_COLLECTION = 'site_settings';

/**
 * Remove undefined properties from an object so Firestore setDoc/updateDoc doesn't fail.
 */
function cleanForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

let isProductInitChecked = false;

/**
 * Real-time listener for Products collection in Firestore.
 * Initializes default products ONLY ONCE per Firestore database instance,
 * so user deletions are permanently respected.
 */
export function subscribeToProducts(
  onProductsUpdate: (products: Product[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, PRODUCTS_COLLECTION);

  // Check Firestore initialization status once on app startup
  if (!isProductInitChecked) {
    isProductInitChecked = true;
    const initDocRef = doc(db, META_COLLECTION, 'products_init');
    getDoc(initDocRef)
      .then(async (snapshot) => {
        if (!snapshot.exists()) {
          // Record init flag in Firestore first
          await setDoc(initDocRef, { initializedAt: new Date().toISOString() });
          // Check if products exist before seeding
          const prodDocs = await collection(db, PRODUCTS_COLLECTION);
          console.log('Initializing default products in Firestore database...');
          for (const item of PRODUCTS) {
            const cleanItem = cleanForFirestore(item);
            await setDoc(doc(db, PRODUCTS_COLLECTION, cleanItem.id), cleanItem);
          }
        }
      })
      .catch((e) => {
        console.error('Error checking Firestore initialization state:', e);
      });
  }

  return onSnapshot(
    colRef,
    (snapshot) => {
      const productList: Product[] = snapshot.docs.map((d) => d.data() as Product);
      onProductsUpdate(productList);
    },
    (err) => {
      console.error('Firestore products listener error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Restore default sample products to Firestore manually (for Admin use)
 */
export async function restoreDefaultProductsToFirestore(): Promise<void> {
  for (const item of PRODUCTS) {
    const cleanItem = cleanForFirestore(item);
    await setDoc(doc(db, PRODUCTS_COLLECTION, cleanItem.id), cleanItem);
  }
}

/**
 * Add or overwrite a product in Firestore
 */
export async function addProductToFirestore(product: Product): Promise<void> {
  const cleanProduct = cleanForFirestore(product);
  await setDoc(doc(db, PRODUCTS_COLLECTION, cleanProduct.id), cleanProduct);
}

/**
 * Update an existing product in Firestore
 */
export async function updateProductInFirestore(product: Product): Promise<void> {
  const cleanProduct = cleanForFirestore(product);
  await setDoc(doc(db, PRODUCTS_COLLECTION, cleanProduct.id), cleanProduct, { merge: true });
}

/**
 * Delete a product from Firestore
 */
export async function deleteProductFromFirestore(productId: string): Promise<void> {
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
}

/**
 * Toggle stock status for a product in Firestore
 */
export async function toggleStockInFirestore(productId: string, currentStock: boolean): Promise<void> {
  await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
    inStock: !currentStock,
  });
}

let isUserInitChecked = false;

/**
 * Real-time listener for User accounts in Firestore.
 */
export function subscribeToUsers(
  onUsersUpdate: (users: Array<UserAccount & { password?: string }>) => void
) {
  const colRef = collection(db, USERS_COLLECTION);

  if (!isUserInitChecked) {
    isUserInitChecked = true;
    const initDocRef = doc(db, META_COLLECTION, 'users_init');
    getDoc(initDocRef)
      .then(async (snapshot) => {
        if (!snapshot.exists()) {
          await setDoc(initDocRef, { initializedAt: new Date().toISOString() });
          const defaultAdmin = {
            username: 'admin',
            password: 'hminh0812',
            name: 'Quản Trị Viên (Admin)',
            email: 'admin@bansacviet.vn',
            role: 'admin',
            avatar: '👑',
          };
          const defaultUser = {
            username: 'khachhang',
            password: '123456',
            name: 'Khách Hàng Thử Nghiệm',
            email: 'khachhang@bansacviet.vn',
            role: 'user',
            avatar: '👤',
          };
          try {
            await setDoc(doc(db, USERS_COLLECTION, defaultAdmin.username), defaultAdmin);
            await setDoc(doc(db, USERS_COLLECTION, defaultUser.username), defaultUser);
          } catch (e) {
            console.error('Error seeding default users:', e);
          }
        }
      })
      .catch((e) => {
        console.error('Error checking users Firestore init:', e);
      });
  }

  return onSnapshot(
    colRef,
    (snapshot) => {
      const userList = snapshot.docs.map((d) => d.data() as UserAccount & { password?: string });
      onUsersUpdate(userList);
    },
    (err) => {
      console.error('Firestore users listener error:', err);
    }
  );
}

/**
 * Save or update user in Firestore
 */
export async function saveUserToFirestore(
  user: UserAccount & { password?: string }
): Promise<void> {
  const cleanUser = cleanForFirestore(user);
  await setDoc(doc(db, USERS_COLLECTION, cleanUser.username.toLowerCase()), cleanUser, { merge: true });
}

/**
 * Record login logs in Firestore
 */
export async function recordLoginLogToFirestore(
  username: string,
  status: 'Thành công' | 'Thất bại'
): Promise<void> {
  try {
    const logData = {
      username,
      status,
      timestamp: new Date().toLocaleString('vi-VN'),
      device: window.navigator.userAgent || 'Unknown Device',
      createdAt: new Date().toISOString(),
    };
    await addDoc(collection(db, LOGS_COLLECTION), logData);
  } catch (e) {
    console.error('Error saving login log to Firestore:', e);
  }
}

/**
  * Subscribe to Footer configuration settings from Firestore
  */
export function subscribeToFooterConfig(
  onFooterUpdate: (config: FooterConfig) => void
) {
  const docRef = doc(db, SETTINGS_COLLECTION, 'footer');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as FooterConfig;
        onFooterUpdate({ ...DEFAULT_FOOTER_CONFIG, ...data });
      } else {
        onFooterUpdate(DEFAULT_FOOTER_CONFIG);
      }
    },
    (err) => {
      console.error('Firestore footer config listener error:', err);
      onFooterUpdate(DEFAULT_FOOTER_CONFIG);
    }
  );
}

/**
  * Save updated Footer configuration to Firestore
  */
export async function saveFooterConfigToFirestore(config: FooterConfig): Promise<void> {
  const cleanConfig = cleanForFirestore(config);
  await setDoc(doc(db, SETTINGS_COLLECTION, 'footer'), cleanConfig, { merge: true });
}


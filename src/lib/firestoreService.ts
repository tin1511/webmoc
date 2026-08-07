import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  getDocs,
  addDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Product, PRODUCTS } from '../data/products';
import { UserAccount } from '../types/auth';

const PRODUCTS_COLLECTION = 'products';
const USERS_COLLECTION = 'users';
const LOGS_COLLECTION = 'login_logs';

/**
 * Real-time listener for Products collection in Firestore.
 * Automatically seeds default products into Firestore if the collection is empty.
 */
export function subscribeToProducts(
  onProductsUpdate: (products: Product[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, PRODUCTS_COLLECTION);
  const SEEDED_KEY = 'products_seeded_to_firestore_v1';

  return onSnapshot(
    colRef,
    async (snapshot) => {
      const isAlreadySeeded = localStorage.getItem(SEEDED_KEY) === 'true';

      if (snapshot.empty && !isAlreadySeeded) {
        // Seed default products into Firestore ONLY on first launch
        console.log('Seeding initial products to Firestore...');
        localStorage.setItem(SEEDED_KEY, 'true');
        try {
          for (const item of PRODUCTS) {
            await setDoc(doc(db, PRODUCTS_COLLECTION, item.id), item);
          }
        } catch (e) {
          console.error('Error seeding products to Firestore:', e);
        }
      } else {
        if (!snapshot.empty && !isAlreadySeeded) {
          localStorage.setItem(SEEDED_KEY, 'true');
        }
        const productList: Product[] = snapshot.docs.map((d) => d.data() as Product);
        onProductsUpdate(productList);
      }
    },
    (err) => {
      console.error('Firestore products listener error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Add or overwrite a product in Firestore
 */
export async function addProductToFirestore(product: Product): Promise<void> {
  await setDoc(doc(db, PRODUCTS_COLLECTION, product.id), product);
}

/**
 * Update an existing product in Firestore
 */
export async function updateProductInFirestore(product: Product): Promise<void> {
  await setDoc(doc(db, PRODUCTS_COLLECTION, product.id), product, { merge: true });
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

/**
 * Real-time listener for User accounts in Firestore.
 */
export function subscribeToUsers(
  onUsersUpdate: (users: Array<UserAccount & { password?: string }>) => void
) {
  const colRef = collection(db, USERS_COLLECTION);
  const SEEDED_KEY = 'users_seeded_to_firestore_v1';

  return onSnapshot(
    colRef,
    async (snapshot) => {
      const isAlreadySeeded = localStorage.getItem(SEEDED_KEY) === 'true';

      if (snapshot.empty && !isAlreadySeeded) {
        // Seed default accounts
        localStorage.setItem(SEEDED_KEY, 'true');
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
      } else {
        if (!snapshot.empty && !isAlreadySeeded) {
          localStorage.setItem(SEEDED_KEY, 'true');
        }
        const userList = snapshot.docs.map((d) => d.data() as UserAccount & { password?: string });
        onUsersUpdate(userList);
      }
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
  await setDoc(doc(db, USERS_COLLECTION, user.username.toLowerCase()), user, { merge: true });
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

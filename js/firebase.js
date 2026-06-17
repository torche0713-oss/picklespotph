// ============================================================
// PICKLESPOT PH - FIREBASE CONFIG & SERVICES
// ============================================================
// STEP 1: Create a Firebase project at https://console.firebase.google.com
// STEP 2: Enable Authentication (Email/Password), Firestore, and Storage
// STEP 3: Replace the config below with your own Firebase project config
// STEP 4: In Firebase Console > Authentication > Sign-in method > Enable Email/Password
// STEP 5: In Firestore > Create database > Start in test mode (or production)
// STEP 6: In Storage > Set up > Start in test mode

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyC33FcO7YxNVpJE7pt8QrNfBVaQ0R6XOps",
  authDomain: "picklespotph-8553a.firebaseapp.com",
  projectId: "picklespotph-8553a",
  storageBucket: "picklespotph-8553a.firebasestorage.app",
  messagingSenderId: "847121039089",
  appId: "1:847121039089:web:b4cda36838300d33b83350"
};

// ============================================================
// EMAIL NOTIFICATIONS (via EmailJS - free tier: 200/mo)
// ============================================================
// To set up:
//   1. Sign up at https://emailjs.com (free)
//   2. Go to Email Services → Add New Service → connect Gmail
//   3. Go to Email Templates → Create Template with variables:
//      {{to_email}} {{to_name}} {{subject}} {{body}}
//   4. Copy Service ID, Template ID, and Public Key below
// ============================================================
const EMAILJS_CONFIG = {
  PUBLIC_KEY: 'ZqwVgBW5afMAIEWtS',
  SERVICE_ID: 'service_xh12jr3',
  TEMPLATE_ID: 'template_zbaoqpb'
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(FIREBASE_CONFIG);
}

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const googleProvider = new firebase.auth.GoogleAuthProvider();
const facebookProvider = new firebase.auth.FacebookAuthProvider();

// ============================================================
// FIRESTORE COLLECTIONS
// ============================================================
const COLLECTIONS = {
  COURTS: 'courts',
  USERS: 'users',
  BOOKINGS: 'bookings',
  REVIEWS: 'reviews',
  PAYMENTS: 'payments',
  CHATS: 'chats',
  MESSAGES: 'messages'
};

// ============================================================
// AUTH SERVICE
// ============================================================
const PickleAuth = {
  // Register new owner
  async register(email, password, displayName) {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName });
    await db.collection(COLLECTIONS.USERS).doc(cred.user.uid).set({
      displayName,
      email,
      role: 'owner',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      plan: 'basic', // 'basic' or 'pro'
      stripeCustomerId: null
    });
    return cred.user;
  },

  // Login
  async login(email, password) {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    return cred.user;
  },

  // Sign in with Google
  async signInWithGoogle() {
    const cred = await auth.signInWithPopup(googleProvider);
    // Create user doc if first time
    const doc = await db.collection(COLLECTIONS.USERS).doc(cred.user.uid).get();
    if (!doc.exists) {
      await db.collection(COLLECTIONS.USERS).doc(cred.user.uid).set({
        displayName: cred.user.displayName,
        email: cred.user.email,
        role: 'owner',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        plan: 'basic'
      });
    }
    return cred.user;
  },

  // Sign in with Facebook
  async signInWithFacebook() {
    const cred = await auth.signInWithPopup(facebookProvider);
    const doc = await db.collection(COLLECTIONS.USERS).doc(cred.user.uid).get();
    if (!doc.exists) {
      await db.collection(COLLECTIONS.USERS).doc(cred.user.uid).set({
        displayName: cred.user.displayName,
        email: cred.user.email,
        role: 'owner',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        plan: 'basic'
      });
    }
    return cred.user;
  },

  // Logout
  logout() {
    return auth.signOut();
  },

  // Listen to auth state
  onAuthChanged(callback) {
    auth.onAuthStateChanged(callback);
  },

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  },

  // Get user profile from Firestore
  async getUserProfile(uid) {
    const doc = await db.collection(COLLECTIONS.USERS).doc(uid).get();
    return doc.exists ? doc.data() : null;
  },

  // Upgrade to Pro
  async upgradeToPro(uid) {
    await db.collection(COLLECTIONS.USERS).doc(uid).update({
      plan: 'pro',
      upgradedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  },

  // Downgrade to Basic
  async downgradeToBasic(uid) {
    await db.collection(COLLECTIONS.USERS).doc(uid).update({
      plan: 'basic',
      upgradedAt: null,
      stripeCustomerId: null
    });
  }
};

// ============================================================
// COURTS SERVICE
// ============================================================
const PickleCourts = {
  // Get all courts
  async getAll() {
    const snapshot = await db.collection(COLLECTIONS.COURTS)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get a single court
  async getById(courtId) {
    const doc = await db.collection(COLLECTIONS.COURTS).doc(courtId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  // Get courts owned by a specific user
  async getByOwner(ownerId) {
    const snapshot = await db.collection(COLLECTIONS.COURTS)
      .where('ownerId', '==', ownerId)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Add a new court
  async add(courtData, ownerId) {
    const docRef = await db.collection(COLLECTIONS.COURTS).add({
      ...courtData,
      ownerId,
      verified: false,
      approved: true,
      featured: false,
      photos: [],
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return docRef.id;
  },

  // Update court
  async update(courtId, data) {
    await db.collection(COLLECTIONS.COURTS).doc(courtId).update(data);
  },

  // Delete court
  async delete(courtId) {
    await db.collection(COLLECTIONS.COURTS).doc(courtId).delete();
  },

  // Toggle verified badge (admin or pro feature)
  async setVerified(courtId, verified) {
    await db.collection(COLLECTIONS.COURTS).doc(courtId).update({ verified });
  },

  // Toggle featured
  async setFeatured(courtId, featured) {
    await db.collection(COLLECTIONS.COURTS).doc(courtId).update({ featured });
  },

  // Get courts by region
  async getByRegion(region) {
    const snapshot = await db.collection(COLLECTIONS.COURTS)
      .where('region', '==', region)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

// ============================================================
// CLOUDINARY STORAGE (Free, no credit card needed)
// ============================================================
// 1. Sign up free at https://cloudinary.com
// 2. Copy your Cloud Name from the dashboard
// 3. Go to Settings > Upload > Enable unsigned uploading
// 4. Create an Upload Preset (unsigned) and copy the name
// 5. Paste both below:

const CLOUDINARY_CLOUD = 'dfjswmnx9';
const CLOUDINARY_PRESET = 'picklespot_ph';

const PickleStorage = {
  async uploadPhoto(courtId, file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_PRESET);
    formData.append('public_id', `courts/${courtId}/${Date.now()}`);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
      { method: 'POST', body: formData }
    );
    const data = await res.json();
    if (!data.secure_url) throw new Error('Upload failed: ' + (data.error?.message || 'unknown'));
    return data.secure_url;
  },

  async uploadMultiple(courtId, files) {
    const urls = [];
    for (const file of files) {
      const url = await this.uploadPhoto(courtId, file);
      urls.push(url);
    }
    return urls;
  }
};

// ============================================================
// BOOKINGS / INQUIRIES SERVICE
// ============================================================
const PickleBookings = {
  // Create a booking inquiry
  async create(data) {
    const docRef = await db.collection(COLLECTIONS.BOOKINGS).add({
      ...data,
      status: 'pending', // pending, confirmed, cancelled
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return docRef.id;
  },

  // Get bookings for a court (owner view)
  async getByCourt(courtId) {
    const snapshot = await db.collection(COLLECTIONS.BOOKINGS)
      .where('courtId', '==', courtId)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get bookings by a user (player view)
  async getByUser(userId) {
    const snapshot = await db.collection(COLLECTIONS.BOOKINGS)
      .where('userId', '==', userId)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Update booking status
  async updateStatus(bookingId, status) {
    await db.collection(COLLECTIONS.BOOKINGS).doc(bookingId).update({ status });
  },

  // Get a single booking by ID
  async getById(bookingId) {
    const doc = await db.collection(COLLECTIONS.BOOKINGS).doc(bookingId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }
};

// ============================================================
// REVIEWS SERVICE
// ============================================================
const PickleReviews = {
  // Add a review
  async add(data) {
    const docRef = await db.collection(COLLECTIONS.REVIEWS).add({
      ...data,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return docRef.id;
  },

  // Get reviews for a court
  async getByCourt(courtId) {
    const snapshot = await db.collection(COLLECTIONS.REVIEWS)
      .where('courtId', '==', courtId)
      .get();
    const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    reviews.sort((a, b) => {
      const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return tb - ta;
    });
    return reviews;
  },

  // Get average rating for a court
  async getAverageRating(courtId) {
    const reviews = await this.getByCourt(courtId);
    if (reviews.length === 0) return { average: 0, count: 0 };
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return { average: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
  }
};

// ============================================================
// PAYMENTS SERVICE (Pro Upgrade)
// ============================================================
const PicklePayments = {
  // Record a payment record (manual GCash/PayMaya for now)
  async recordPayment(uid, data) {
    const docRef = await db.collection(COLLECTIONS.PAYMENTS).add({
      userId: uid,
      amount: data.amount,
      method: data.method, // 'gcash', 'paymaya', 'bank'
      reference: data.reference,
      plan: 'pro',
      status: 'pending', // pending, verified, failed
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return docRef.id;
  },

  // Verify payment (admin)
  async verifyPayment(paymentId) {
    await db.collection(COLLECTIONS.PAYMENTS).doc(paymentId).update({
      status: 'verified',
      verifiedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  },

  // Get user's payments
  async getByUser(uid) {
    const snapshot = await db.collection(COLLECTIONS.PAYMENTS)
      .where('userId', '==', uid)
      .get();
    const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    payments.sort((a, b) => {
      const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return tb - ta;
    });
    return payments;
  },

  // Get all payments (admin view)
  async getAll() {
    const snapshot = await db.collection(COLLECTIONS.PAYMENTS)
      .get();
    const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    payments.sort((a, b) => {
      const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return tb - ta;
    });
    return payments;
  }
};

// ============================================================
// CHAT SERVICE (Real-time)
// ============================================================
const PickleChat = {
  // Create a chat room (from a booking inquiry)
  async createRoom(data) {
    const chatRef = await db.collection(COLLECTIONS.CHATS).add({
      courtId: data.courtId,
      courtName: data.courtName,
      ownerId: data.ownerId,
      customerName: data.customerName,
      customerContact: data.customerContact,
      lastMessage: data.lastMessage || '',
      lastSender: data.lastSender || '',
      unreadOwner: 0,
      unreadCustomer: 0,
      status: 'active',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return chatRef.id;
  },

  // Send a message in a chat room
  async sendMessage(chatId, senderId, senderName, text) {
    const msgRef = await db.collection(COLLECTIONS.MESSAGES).add({
      chatId,
      senderId,
      senderName,
      text,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    // Update last message on the chat room
    await db.collection(COLLECTIONS.CHATS).doc(chatId).update({
      lastMessage: text,
      lastSender: senderName,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return msgRef.id;
  },

  // Real-time listener for messages in a chat room
  onMessages(chatId, callback) {
    return db.collection(COLLECTIONS.MESSAGES)
      .where('chatId', '==', chatId)
      .onSnapshot(snapshot => {
        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Sort client-side to avoid needing a composite index
        msgs.sort((a, b) => {
          const ta = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
          const tb = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
          return ta - tb;
        });
        callback(msgs);
      }, err => {
        console.error('Chat listener error:', err);
      });
  },

  // Get all chats for an owner (real-time)
  onOwnerChats(ownerId, callback) {
    return db.collection(COLLECTIONS.CHATS)
      .where('ownerId', '==', ownerId)
      .onSnapshot(snapshot => {
        const chats = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Sort client-side to avoid needing a composite index
        chats.sort((a, b) => {
          const ta = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
          const tb = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
          return tb - ta;
        });
        callback(chats);
      }, err => {
        console.error('Owner chats listener error:', err);
      });
  },

  // Mark messages as read for owner
  async markOwnerRead(chatId) {
    await db.collection(COLLECTIONS.CHATS).doc(chatId).update({
      unreadOwner: 0
    });
  },

  // Mark messages as read for customer
  async markCustomerRead(chatId) {
    await db.collection(COLLECTIONS.CHATS).doc(chatId).update({
      unreadCustomer: 0
    });
  },

  // Increment unread count for owner
  async incrementUnreadOwner(chatId) {
    const chat = await db.collection(COLLECTIONS.CHATS).doc(chatId).get();
    const data = chat.data();
    await db.collection(COLLECTIONS.CHATS).doc(chatId).update({
      unreadOwner: (data.unreadOwner || 0) + 1
    });
  },

  // Get all chats as list (non-realtime)
  async getOwnerChats(ownerId) {
    const snapshot = await db.collection(COLLECTIONS.CHATS)
      .where('ownerId', '==', ownerId)
      .orderBy('updatedAt', 'desc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

// ============================================================
// EMAIL NOTIFICATION SERVICE
// ============================================================
const PickleNotifications = {
  async send(toEmail, toName, subject, body) {
    if (!EMAILJS_CONFIG.PUBLIC_KEY || !EMAILJS_CONFIG.SERVICE_ID || !EMAILJS_CONFIG.TEMPLATE_ID) return;
    try {
      await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, {
        to_email: toEmail,
        to_name: toName,
        subject: subject,
        body: body
      });
    } catch (err) {
      console.error('Email send failed:', err);
    }
  },

  async notifyOwnerNewBooking(ownerId, bookingData, courtName) {
    try {
      const owner = await PickleAuth.getUserProfile(ownerId);
      if (!owner || !owner.email) return;
      const body = `New booking inquiry at ${courtName}!\n\nCustomer: ${bookingData.name}\nContact: ${bookingData.contact}\nDate: ${bookingData.date}\nTime: ${bookingData.time}\nPlayers: ${bookingData.players}\nMessage: ${bookingData.message || 'None'}`;
      await this.send(owner.email, owner.displayName || 'Owner', `New Booking: ${courtName}`, body);
    } catch {}
  },

  async notifyAdminNewPayment(userEmail, userName, paymentData) {
    const body = `New Pro upgrade payment!\n\nUser: ${userName}\nEmail: ${userEmail}\nAmount: ₱${paymentData.amount}\nMethod: ${paymentData.method}\nReference: ${paymentData.reference}`;
    await this.send('torche0713@gmail.com', 'Admin', 'New Pro Upgrade Payment', body);
  },

  async notifyCustomerBookingStatus(customerEmail, customerName, courtName, status) {
    if (!customerEmail) return;
    const emoji = status === 'confirmed' ? '✅' : status === 'rejected' ? '❌' : '⏳';
    const label = status.charAt(0).toUpperCase() + status.slice(1);
    const body = `${emoji} Your booking at ${courtName} has been ${label}.\n\nCourt: ${courtName}\nStatus: ${label}`;
    await this.send(customerEmail, customerName, `Booking ${label}: ${courtName}`, body);
  }
};

// Init EmailJS if configured
if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.PUBLIC_KEY) {
  emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
}

// ============================================================
// HELPER: Check if user is Pro
// ============================================================
async function isProUser(uid) {
  const profile = await PickleAuth.getUserProfile(uid);
  return profile?.plan === 'pro';
}

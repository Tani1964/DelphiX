import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri: string = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db('delphi_healthcare');
}

// Collection helpers
export async function getUsersCollection() {
  const db = await getDb();
  return db.collection('users');
}

export async function getDiagnosesCollection() {
  const db = await getDb();
  return db.collection('diagnoses');
}

export async function getDrugVerificationsCollection() {
  const db = await getDb();
  return db.collection('drug_verifications');
}

export async function getSOSEventsCollection() {
  const db = await getDb();
  return db.collection('sos_events');
}

export async function getHospitalRecommendationsCollection() {
  const db = await getDb();
  return db.collection('hospital_recommendations');
}

export async function getIPFSIndexCollection() {
  const db = await getDb();
  return db.collection('ipfs_index');
}


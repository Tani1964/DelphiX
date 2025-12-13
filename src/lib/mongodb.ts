import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri: string = process.env.MONGODB_URI;
const options = {
  // Connection timeout settings
  connectTimeoutMS: 10000, // 10 seconds to establish connection
  socketTimeoutMS: 45000, // 45 seconds for socket operations
  serverSelectionTimeoutMS: 10000, // 10 seconds to select a server
  // Connection pool settings
  maxPoolSize: 10, // Maximum number of connections in the pool
  minPoolSize: 1, // Minimum number of connections
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  // Retry settings
  retryWrites: true,
  retryReads: true,
  // Heartbeat settings to keep connection alive
  heartbeatFrequencyMS: 10000,
};

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
  // In production mode, use a global variable for serverless environments
  // This ensures connection reuse across function invocations
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
  client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
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


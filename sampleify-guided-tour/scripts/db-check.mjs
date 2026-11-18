// Connects with the settings in .env.local and checks read and write access.
// Prints results only, never the connection string.
// Usage: node --env-file=.env.local scripts/db-check.mjs
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;
if (!uri || !dbName) {
  console.error('MONGODB_URI and MONGODB_DB must be set in .env.local');
  process.exit(1);
}
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
try {
  await client.connect();
  await client.db(dbName).command({ ping: 1 });
  console.log('connected: ok');
  const probe = client.db(dbName).collection('_connection_check');
  const { insertedId } = await probe.insertOne({ at: new Date() });
  console.log('write to', dbName + ':', 'ok');
  await probe.deleteOne({ _id: insertedId });
  if ((await probe.countDocuments()) === 0) await probe.drop();
  console.log('cleanup: ok');
} catch (error) {
  console.error('FAILED:', error.codeName || error.name, '-', String(error.message).replace(/mongodb(\+srv)?:\/\/\S+/g, '[uri]').slice(0, 200));
  process.exitCode = 1;
} finally {
  await client.close();
}

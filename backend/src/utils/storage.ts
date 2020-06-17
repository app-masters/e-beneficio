import logging from './logging';
require('./test.file'); // Adding file to the build

interface Provider {
  provider?: Provider | null;
  upload(localFilePath: string, remoteFileName: string): string | undefined;
  exists(remoteFileName: string): void;
  findByPrefix(remoteFileName: string): string[] | undefined;
  download(localFilePath: string, remoteFileName: string): void;
  delete(remoteFileName: string): boolean | undefined;
  setProvider(storageProvider: Provider): void;
  check(): Promise<boolean>;
}

const storage: Provider = {
  provider: null,
  upload: (localFilePath: string, remoteFileName: string) => {
    return storage.provider?.upload(localFilePath, remoteFileName);
  },
  exists: (remoteFileName: string) => {
    return storage.provider?.exists(remoteFileName);
  },
  findByPrefix: (remoteFileName: string) => {
    return storage.provider?.findByPrefix(remoteFileName);
  },
  download: (remoteFileName: string, localFilePath: string) => {
    return storage.provider?.download(remoteFileName, localFilePath);
  },
  delete: (remoteFileName: string) => {
    return storage.provider?.delete(remoteFileName);
  },
  setProvider: (storageProvider: Provider) => {
    storage.provider = storageProvider;
  },
  check: async () => {
    return storage.provider?.check() || false;
  }
};

// Load storage provider
if (process.env.GOOGLE_CLOUD_STORAGE_PROJECT) {
  // Google Cloud Storage
  const googleCloudStorage = require('./google-cloud-storage').default as Provider;
  if (googleCloudStorage) {
    storage.setProvider(googleCloudStorage);
  }
} else {
  logging.critical(new Error('No storage provider defined'));
}

export default storage;

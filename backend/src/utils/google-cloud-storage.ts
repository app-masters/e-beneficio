import { Storage } from '@google-cloud/storage';
import logging from './logging';

const googleCloud = {
  getBucket: () => {
    const store = new Storage({
      projectId: process.env.GOOGLE_CLOUD_STORAGE_PROJECT,
      keyFilename: `storage-${process.env.NODE_ENV}-service-account.json`
    });
    return store.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET_NAME || '');
  },
  upload: async (localFilePath: string, remoteFileName: string) => {
    try {
      const [data] = await googleCloud.getBucket().upload(localFilePath, {
        gzip: true,
        destination: remoteFileName
      });
      return `https://storage.googleapis.com/${data.metadata.bucket}/${remoteFileName}`;
    } catch (e) {
      logging.critical(e);
      return;
    }
  },
  exists: async (remoteFileName: string) => {
    try {
      const file = googleCloud.getBucket().file(remoteFileName);
      const [data] = await file.exists();
      return data;
    } catch (e) {
      logging.critical(e);
      return;
    }
  },
  findByPrefix: async (remoteFilePrefix: string) => {
    try {
      const [files] = await googleCloud.getBucket().getFiles({ prefix: remoteFilePrefix });
      if (files) {
        return files.map((file) => file.name);
      }
      return null;
    } catch (e) {
      logging.critical(e);
      return;
    }
  },
  download: async (remoteFileName: string, localFilePath: string) => {
    try {
      const file = googleCloud.getBucket().file(remoteFileName);
      const options = {
        destination: localFilePath
      };
      await file.download(options);
      return true;
    } catch (e) {
      logging.error(e);
      return;
    }
  },
  delete: async (remoteFileName: string) => {
    try {
      const file = googleCloud.getBucket().file(remoteFileName);
      await file.delete();
      return true;
    } catch (e) {
      logging.error(e);
      return false;
    }
  }
};

export default googleCloud;

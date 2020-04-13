import fs from 'fs';
import { UploadedFile } from 'express-fileupload';
import storage from './storage';
import logging from './logging';

type EnumFileFolder = 'image' | 'csv';

/**
 * Upload temporary file to the remote storage
 * @param folder folder name
 * @param name file name
 * @param file uploaded file
 */
export const uploadFile = async (folder: EnumFileFolder, name: string, file: UploadedFile) => {
  try {
    const allowedExtensions =
      folder === 'image' ? ['image/jpg', 'image/png', 'image/jpeg', 'image/webp'] : ['file/csv'];
    if (allowedExtensions.indexOf(file.mimetype) < 0) {
      throw new Error('Invalid file format');
    }
    const remoteFileName = `${folder}/${name}.${file.mimetype.split('/')[1]}`;
    // Upload to storage
    const data = await storage.upload(file.tempFilePath, remoteFileName);
    console.log('DATA', data);
    if (!data) return false;
    fs.unlinkSync(file.tempFilePath);
    return { photoUrl: data };
  } catch (error) {
    logging.critical(error);
    console.error(error);
    return false;
  }
};

/**
 * Find and delete all files with the given name
 * @param folder folder name
 * @param name file name
 */
export const deleteFile = async (folder: EnumFileFolder, name: string) => {
  const files = await storage.findByPrefix(`${folder}/${name}.`);
  if (files && files.length > 0) {
    files.forEach((file) => {
      storage.delete(file);
    });
  }
  return;
};

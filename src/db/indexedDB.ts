/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project } from '../types';

const DB_NAME = 'BloomSketchDB';
const DB_VERSION = 1;
const STORE_NAME = 'projects';

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB database'));
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export const indexedDBService = {
  async saveProject(project: Project): Promise<void> {
    try {
      const db = await getDB();
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(project);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(new Error('Failed to save project to database'));
        };
      });
    } catch (error) {
      console.error(error);
    }
  },

  async loadProject(id: string): Promise<Project | null> {
    try {
      const db = await getDB();
      return new Promise<Project | null>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => {
          resolve(request.result || null);
        };

        request.onerror = () => {
          reject(new Error(`Failed to load project with id ${id}`));
        };
      });
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  async getAllProjects(): Promise<Project[]> {
    try {
      const db = await getDB();
      return new Promise<Project[]>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          // Sort projects by updatedAt descending (newest first)
          const projects = request.result as Project[];
          projects.sort((a, b) => b.updatedAt - a.updatedAt);
          resolve(projects);
        };

        request.onerror = () => {
          reject(new Error('Failed to list projects'));
        };
      });
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  async deleteProject(id: string): Promise<void> {
    try {
      const db = await getDB();
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(new Error(`Failed to delete project with id ${id}`));
        };
      });
    } catch (error) {
      console.error(error);
    }
  }
};

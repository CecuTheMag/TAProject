import bcrypt from 'bcryptjs';
import pool from '../database.js';

export const createDefaultAdmin = async () => {
  try {
    console.log('ℹ️  System admin is managed by admin-backend, skipping creation in main backend');
  } catch (error) {
    console.error('❌ Error in createDefaultAdmin:', error);
  }
};
import pool from './database.js';

class SchoolDatabase {
  constructor(schoolCode) {
    this.schoolCode = schoolCode;
    this.schema = `school_${schoolCode}`;
  }

  // Execute query with school schema
  async query(text, params = []) {
    const client = await pool.connect();
    try {
      // Set search path to school schema
      await client.query(`SET search_path TO "${this.schema}", public`);
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  // Get user by email in school schema
  async getUserByEmail(email) {
    return this.query('SELECT * FROM users WHERE email = $1', [email]);
  }

  // Get all equipment for school
  async getEquipment(filters = {}) {
    let query = 'SELECT * FROM equipment WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.category) {
      query += ` AND category = $${paramCount}`;
      params.push(filters.category);
      paramCount++;
    }

    return this.query(query, params);
  }

  // Get requests for school
  async getRequests(userId = null) {
    let query = `
      SELECT r.*, u.username, u.email, e.name as equipment_name 
      FROM requests r 
      JOIN users u ON r.user_id = u.id 
      JOIN equipment e ON r.equipment_id = e.id
    `;
    const params = [];

    if (userId) {
      query += ' WHERE r.user_id = $1';
      params.push(userId);
    }

    query += ' ORDER BY r.request_date DESC';
    return this.query(query, params);
  }

  // Create user in school schema
  async createUser(userData) {
    const columns = Object.keys(userData).join(', ');
    const values = Object.values(userData);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    return this.query(
      `INSERT INTO users (${columns}) VALUES (${placeholders}) RETURNING *`,
      values
    );
  }

  // Create equipment in school schema
  async createEquipment(equipmentData) {
    const columns = Object.keys(equipmentData).join(', ');
    const values = Object.values(equipmentData);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    return this.query(
      `INSERT INTO equipment (${columns}) VALUES (${placeholders}) RETURNING *`,
      values
    );
  }

  // Update equipment
  async updateEquipment(id, updates) {
    const columns = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = columns.map((col, i) => `${col} = $${i + 2}`).join(', ');
    
    return this.query(
      `UPDATE equipment SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
  }

  // Create request
  async createRequest(requestData) {
    const columns = Object.keys(requestData).join(', ');
    const values = Object.values(requestData);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    return this.query(
      `INSERT INTO requests (${columns}) VALUES (${placeholders}) RETURNING *`,
      values
    );
  }

  // Update request status
  async updateRequestStatus(id, status, approvedBy = null) {
    const updates = { status };
    if (approvedBy) {
      updates.approved_by = approvedBy;
      updates.approval_date = new Date();
    }

    const columns = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = columns.map((col, i) => `${col} = $${i + 2}`).join(', ');
    
    return this.query(
      `UPDATE requests SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
  }
}

// Factory function to get school database instance
export const getSchoolDB = (schoolCode) => {
  return new SchoolDatabase(schoolCode);
};

export default SchoolDatabase;
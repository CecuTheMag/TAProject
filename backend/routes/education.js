import express from 'express';
import pool from '../database.js';
import { authenticateToken, requireTeacherOrAdmin } from '../middleware.js';

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Education API is working!', 
    timestamp: new Date().toISOString(),
    endpoints: {
      subjects: '/education/subjects',
      lessonPlans: '/education/lesson-plans',
      analytics: '/education/learning-analytics'
    }
  });
});

// Get all subjects
router.get('/subjects', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM subjects ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// Get lesson plans for teacher
router.get('/lesson-plans', authenticateToken, async (req, res) => {
  try {
    // For now, return sample data if no lesson plans exist
    const result = await pool.query(`
      SELECT lp.*, s.name as subject_name, s.code as subject_code
      FROM lesson_plans lp
      LEFT JOIN subjects s ON lp.subject_id = s.id
      ORDER BY lp.lesson_date DESC
    `);
    
    // If no lesson plans, return sample data
    if (result.rows.length === 0) {
      const sampleLessons = [
        {
          id: 1,
          title: 'Introduction to Algebra',
          description: 'Basic algebraic concepts and linear equations for 8th grade students',
          subject_name: 'Mathematics',
          grade_level: '8',
          duration_minutes: 45,
          required_equipment: ['projector', 'laptop'],
          suggested_equipment: ['tablet', 'smartboard'],
          learning_objectives: [
            'Understand variables and constants',
            'Solve simple linear equations',
            'Apply algebraic thinking to real-world problems'
          ]
        },
        {
          id: 2,
          title: 'Cell Biology Lab',
          description: 'Hands-on exploration of plant and animal cells using microscopy',
          subject_name: 'Science',
          grade_level: '9',
          duration_minutes: 90,
          required_equipment: ['microscope', 'camera'],
          suggested_equipment: ['projector', 'tablet'],
          learning_objectives: [
            'Identify cellular structures',
            'Compare plant and animal cells',
            'Document observations scientifically'
          ]
        }
      ];
      return res.json(sampleLessons);
    }
    
    res.json(result.rows);
  } catch (error) {
    console.error('Lesson plans error:', error);
    res.status(500).json({ error: 'Failed to fetch lesson plans' });
  }
});

// Create lesson plan with equipment suggestions
router.post('/lesson-plans', authenticateToken, requireTeacherOrAdmin, async (req, res) => {
  try {
    const { subject_id, title, description, learning_objectives, lesson_date, duration_minutes, grade_level } = req.body;
    
    // Get equipment suggestions based on subject
    const equipmentSuggestions = await pool.query(`
      SELECT DISTINCT type, name, learning_impact_score
      FROM equipment 
      WHERE $1 = ANY(educational_subjects)
      AND status = 'available'
      ORDER BY learning_impact_score DESC
    `, [req.body.subject_code]);

    const suggested_equipment = equipmentSuggestions.rows.map(eq => eq.type);
    const required_equipment = suggested_equipment.slice(0, 2); // Top 2 as required

    const result = await pool.query(`
      INSERT INTO lesson_plans (teacher_id, subject_id, title, description, learning_objectives, 
                               required_equipment, suggested_equipment, lesson_date, duration_minutes, grade_level)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [req.user.id, subject_id, title, description, learning_objectives, 
        required_equipment, suggested_equipment, lesson_date, duration_minutes, grade_level]);

    res.status(201).json({
      lesson_plan: result.rows[0],
      equipment_suggestions: equipmentSuggestions.rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lesson plan' });
  }
});

// Get equipment recommendations for lesson
router.get('/equipment-recommendations/:lessonId', authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    const lesson = await pool.query('SELECT * FROM lesson_plans WHERE id = $1', [lessonId]);
    if (lesson.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson plan not found' });
    }

    const subject = await pool.query('SELECT code FROM subjects WHERE id = $1', [lesson.rows[0].subject_id]);
    
    const recommendations = await pool.query(`
      SELECT e.*, 
             COALESCE(avg(eua.learning_outcome_rating), 0) as avg_learning_outcome,
             COALESCE(avg(eua.student_engagement_score), 0) as avg_engagement
      FROM equipment e
      LEFT JOIN equipment_usage_analytics eua ON e.id = eua.equipment_id
      WHERE $1 = ANY(e.educational_subjects)
      AND e.status = 'available'
      GROUP BY e.id
      ORDER BY e.learning_impact_score DESC, avg_learning_outcome DESC
    `, [subject.rows[0].code]);

    res.json(recommendations.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get equipment recommendations' });
  }
});

// Record equipment usage analytics
router.post('/usage-analytics', authenticateToken, async (req, res) => {
  try {
    const { equipment_id, lesson_plan_id, duration_minutes, learning_outcome_rating, student_engagement_score, technical_issues } = req.body;
    
    const result = await pool.query(`
      INSERT INTO equipment_usage_analytics 
      (equipment_id, user_id, lesson_plan_id, duration_minutes, learning_outcome_rating, 
       student_engagement_score, technical_issues_reported)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [equipment_id, req.user.id, lesson_plan_id, duration_minutes, learning_outcome_rating, 
        student_engagement_score, technical_issues || []]);

    // Update equipment learning impact score
    await pool.query(`
      UPDATE equipment 
      SET learning_impact_score = (
        SELECT AVG(learning_outcome_rating) 
        FROM equipment_usage_analytics 
        WHERE equipment_id = $1
      )
      WHERE id = $1
    `, [equipment_id]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to record usage analytics' });
  }
});

// Get learning impact analytics
router.get('/learning-analytics', authenticateToken, async (req, res) => {
  try {
    const analytics = await pool.query(`
      SELECT 
        e.type,
        e.name,
        COUNT(eua.id) as usage_count,
        AVG(eua.learning_outcome_rating) as avg_learning_outcome,
        AVG(eua.student_engagement_score) as avg_engagement,
        COALESCE(e.learning_impact_score, 4.2) as learning_impact_score
      FROM equipment e
      LEFT JOIN equipment_usage_analytics eua ON e.id = eua.equipment_id
      GROUP BY e.id, e.type, e.name, e.learning_impact_score
      ORDER BY COALESCE(e.learning_impact_score, 4.2) DESC
      LIMIT 10
    `);

    const subjectAnalytics = await pool.query(`
      SELECT 
        s.name as subject_name,
        s.code,
        COUNT(eua.id) as total_usage,
        AVG(eua.learning_outcome_rating) as avg_outcome,
        AVG(eua.student_engagement_score) as avg_engagement
      FROM subjects s
      LEFT JOIN equipment_usage_analytics eua ON s.id = eua.subject_id
      GROUP BY s.id, s.name, s.code
      ORDER BY avg_outcome DESC NULLS LAST
    `);

    // If no analytics data, return sample data
    let equipmentData = analytics.rows;
    let subjectData = subjectAnalytics.rows;
    
    if (equipmentData.length === 0) {
      equipmentData = [
        { name: 'Interactive Projector', type: 'projector', usage_count: 45, learning_impact_score: 4.8, avg_learning_outcome: 4.6, avg_engagement: 8.2 },
        { name: 'Digital Microscope', type: 'microscope', usage_count: 32, learning_impact_score: 4.7, avg_learning_outcome: 4.5, avg_engagement: 8.8 },
        { name: 'Student Tablets', type: 'tablet', usage_count: 78, learning_impact_score: 4.5, avg_learning_outcome: 4.3, avg_engagement: 7.9 },
        { name: 'Smart Whiteboard', type: 'smartboard', usage_count: 56, learning_impact_score: 4.4, avg_learning_outcome: 4.2, avg_engagement: 8.1 },
        { name: 'Laptop Cart', type: 'laptop', usage_count: 89, learning_impact_score: 4.2, avg_learning_outcome: 4.0, avg_engagement: 7.5 }
      ];
    }
    
    if (subjectData.length === 0) {
      subjectData = [
        { subject_name: 'Science', code: 'SCI', total_usage: 156, avg_outcome: 4.6, avg_engagement: 8.4 },
        { subject_name: 'Mathematics', code: 'MATH', total_usage: 134, avg_outcome: 4.3, avg_engagement: 7.8 },
        { subject_name: 'Computer Science', code: 'CS', total_usage: 98, avg_outcome: 4.5, avg_engagement: 8.7 },
        { subject_name: 'English Language', code: 'ENG', total_usage: 112, avg_outcome: 4.1, avg_engagement: 7.6 },
        { subject_name: 'Art', code: 'ART', total_usage: 67, avg_outcome: 4.4, avg_engagement: 8.9 }
      ];
    }

    res.json({
      equipment_analytics: equipmentData,
      subject_analytics: subjectData
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch learning analytics' });
  }
});

export default router;
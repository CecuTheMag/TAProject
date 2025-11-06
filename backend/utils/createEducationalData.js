import pool from '../database.js';

export const createEducationalData = async () => {
  try {
    console.log('🏫 Creating educational sample data...');

    // Create sample schools
    const schools = [
      { name: 'Tech Academy High School', district_id: 1, address: 'Sofia, Bulgaria', principal_name: 'Dr. Maria Petrova', contact_email: 'principal@techacademy.bg', phone: '+359 2 123 4567' },
      { name: 'Innovation Middle School', district_id: 1, address: 'Plovdiv, Bulgaria', principal_name: 'Prof. Ivan Georgiev', contact_email: 'principal@innovation.bg', phone: '+359 32 123 456' },
      { name: 'Future Leaders Elementary', district_id: 1, address: 'Varna, Bulgaria', principal_name: 'Ms. Elena Dimitrova', contact_email: 'principal@futureleaders.bg', phone: '+359 52 123 456' }
    ];

    for (const school of schools) {
      await pool.query(
        'INSERT INTO schools (name, district_id, address, principal_name, contact_email, phone) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
        [school.name, school.district_id, school.address, school.principal_name, school.contact_email, school.phone]
      );
    }

    // Create subjects
    const subjects = [
      { name: 'Mathematics', code: 'MATH', description: 'Mathematical concepts and problem solving', grade_level: '6-12' },
      { name: 'Science', code: 'SCI', description: 'Physics, Chemistry, Biology', grade_level: '6-12' },
      { name: 'Computer Science', code: 'CS', description: 'Programming and digital literacy', grade_level: '8-12' },
      { name: 'English Language', code: 'ENG', description: 'Language arts and literature', grade_level: '6-12' },
      { name: 'History', code: 'HIST', description: 'World and national history', grade_level: '6-12' },
      { name: 'Art', code: 'ART', description: 'Visual and digital arts', grade_level: '6-12' },
      { name: 'Music', code: 'MUS', description: 'Music theory and performance', grade_level: '6-12' },
      { name: 'Physical Education', code: 'PE', description: 'Physical fitness and sports', grade_level: '6-12' }
    ];

    for (const subject of subjects) {
      await pool.query(
        'INSERT INTO subjects (name, code, description, grade_level) VALUES ($1, $2, $3, $4) ON CONFLICT (code) DO NOTHING',
        [subject.name, subject.code, subject.description, subject.grade_level]
      );
    }

    // Update existing equipment with educational metadata
    const educationalEquipment = [
      { type: 'projector', subjects: ['MATH', 'SCI', 'CS', 'ENG', 'HIST'], impact_score: 4.5 },
      { type: 'laptop', subjects: ['CS', 'MATH', 'SCI', 'ENG', 'ART'], impact_score: 4.8 },
      { type: 'tablet', subjects: ['ART', 'CS', 'MATH', 'ENG'], impact_score: 4.2 },
      { type: 'microscope', subjects: ['SCI'], impact_score: 4.9 },
      { type: 'camera', subjects: ['ART', 'CS', 'SCI'], impact_score: 4.1 },
      { type: 'speaker', subjects: ['MUS', 'ENG', 'HIST'], impact_score: 3.8 },
      { type: 'smartboard', subjects: ['MATH', 'SCI', 'CS', 'ENG', 'HIST'], impact_score: 4.7 }
    ];

    for (const eq of educationalEquipment) {
      try {
        await pool.query(
          'UPDATE equipment SET educational_subjects = $1, learning_impact_score = $2 WHERE type ILIKE $3',
          [eq.subjects, eq.impact_score, `%${eq.type}%`]
        );
      } catch (error) {
        console.log(`Could not update equipment type ${eq.type}:`, error.message);
      }
    }

    // Create sample lesson plans
    const lessonPlans = [
      {
        title: 'Introduction to Algebra',
        subject: 'MATH',
        description: 'Basic algebraic concepts and equations',
        objectives: ['Understand variables', 'Solve linear equations', 'Apply algebra to real problems'],
        required_equipment: ['projector', 'laptop'],
        suggested_equipment: ['tablet', 'smartboard'],
        grade_level: '8'
      },
      {
        title: 'Cell Structure and Function',
        subject: 'SCI',
        description: 'Exploring cellular biology through microscopy',
        objectives: ['Identify cell parts', 'Understand cell functions', 'Compare plant and animal cells'],
        required_equipment: ['microscope'],
        suggested_equipment: ['camera', 'projector'],
        grade_level: '9'
      },
      {
        title: 'Digital Art Creation',
        subject: 'ART',
        description: 'Creating digital artwork using modern tools',
        objectives: ['Master digital tools', 'Create original artwork', 'Understand digital composition'],
        required_equipment: ['tablet', 'laptop'],
        suggested_equipment: ['camera', 'projector'],
        grade_level: '10'
      }
    ];

    // Get or create teacher user
    let teacherResult = await pool.query('SELECT id FROM users WHERE role = $1 LIMIT 1', ['teacher']);
    if (teacherResult.rows.length === 0) {
      // Create a sample teacher if none exists
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash('teacher123', 12);
      await pool.query(
        'INSERT INTO users (username, email, password, role, subject_specialization) VALUES ($1, $2, $3, $4, $5)',
        ['teacher1', 'teacher@school.bg', hashedPassword, 'teacher', 'Mathematics']
      );
      teacherResult = await pool.query('SELECT id FROM users WHERE username = $1', ['teacher1']);
    }
    const teacherId = teacherResult.rows[0].id;

    // Create lesson plans
    for (const lesson of lessonPlans) {
      try {
        const subjectResult = await pool.query('SELECT id FROM subjects WHERE code = $1', [lesson.subject]);
        if (subjectResult.rows.length > 0) {
          // Check if lesson already exists
          const existingLesson = await pool.query(
            'SELECT id FROM lesson_plans WHERE title = $1 AND teacher_id = $2',
            [lesson.title, teacherId]
          );
          
          if (existingLesson.rows.length === 0) {
            await pool.query(
              'INSERT INTO lesson_plans (teacher_id, subject_id, title, description, learning_objectives, required_equipment, suggested_equipment, grade_level, lesson_date, duration_minutes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
              [teacherId, subjectResult.rows[0].id, lesson.title, lesson.description, lesson.objectives, lesson.required_equipment, lesson.suggested_equipment, lesson.grade_level, new Date(), 45]
            );
          }
        }
      } catch (error) {
        console.log(`Could not create lesson ${lesson.title}:`, error.message);
      }
    }

    console.log('✅ Educational sample data created successfully');
  } catch (error) {
    console.error('❌ Error creating educational data:', error);
  }
};
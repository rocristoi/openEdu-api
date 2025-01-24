const express = require('express');
const app = express();
const cors = require('cors'); 
const { Pool } = require('pg');
const nodemailer = require('nodemailer')
const crypto = require('crypto');
require('dotenv').config();
const port = process.env.APP_PORT || 3000;
var admin = require("firebase-admin");
var serviceAccount = require("./serviceacc.json");



admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

function generatePassword(length = 16) {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

const checkAuth = async (req, res, next) => {
  const idToken = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!idToken) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
        const userRecord = await admin.auth().getUser(decodedToken.uid);
        req.user = {
      ...decodedToken,
      displayName: userRecord.displayName, 
    };
    next(); 
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

const pool = new Pool({
  user:  process.env.DB_USER,
  host:  process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT, 
  max: 20, 
  idleTimeoutMillis: 30000, 
  connectionTimeoutMillis: 2000, 
});

const from_email = '"OpenEdu" <openedu-noreply@cristoi.ro>'
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
})

app.use(cors({
  origin: process.env.CORS_URL, 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],  
}));

app.use(express.json());


const sendemail = (type, email, password, schoolName) => {
    if(type == 'student') {
      const mailOptions = {
        from: from_email,
        to: email,
        subject: 'OpenEdu | New Account Request',
        html: `
          <html lang="en">
        <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Created | OpenEdu</title>
    <style>
        body {
            background-color: #000000;
            color: #ffffff;
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        .email-container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #111111;
            padding: 20px;
            border-radius: 8px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            font-size: 24px;
            color: #48BB78; /* Green-500 */
            margin: 0;
        }
        .content {
            font-size: 16px;
            line-height: 1.5;
            color: #ffffff;
            margin-bottom: 20px;
        }
        .content p {
            margin: 10px 0;
        }
        .email-details {
            background-color: #222222;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 8px;
        }
      .email-details p {
          margin: 5px 0;
          font-size: 14px;
          font-family: 'Courier New', monospace;
          color: #48BB78;
      }
        .footer {
            text-align: center;
            font-size: 14px;
            color: #888888;
        }
        .footer p {
            margin: 0;
        }
        @media (max-width: 600px) {
            .email-container {
                padding: 15px;
            }
            .header h1 {
                font-size: 20px;
            }
            .content {
                font-size: 14px;
            }
        }
    </style>
</head>
<body>

    <div class="email-container">
        <div class="header">
            <h1>Welcome to OpenEdu</h1>
        </div>

        <div class="content">
            <p>Hey! We've created an account for you and added you to <strong>${schoolName}</strong>.</p>
            <p>From now on, you can use the following credentials to log into your OpenEdu account to view your grades, absences, and more.</p>
            <p>If you were not expecting this email, you can safely ignore it.</p>
        </div>

        <div class="email-details">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
        </div>

        <div class="footer">
            <p>&copy; 2025 OpenEdu</p>
        </div>
    </div>

</body>
</html>`,
      };
      
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });

    } else {
      const mailOptions = {
        from: from_email,
        to: email,
        subject: 'OpenEdu | New Account Request',
        html: `
          <html lang="en">
        <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Created | OpenEdu</title>
    <style>
        body {
            background-color: #000000;
            color: #ffffff;
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        .email-container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #111111;
            padding: 20px;
            border-radius: 8px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            font-size: 24px;
            color: #48BB78; /* Green-500 */
            margin: 0;
        }
        .content {
            font-size: 16px;
            line-height: 1.5;
            color: #ffffff;
            margin-bottom: 20px;
        }
        .content p {
            margin: 10px 0;
        }
        .email-details {
            background-color: #222222;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 8px;
        }
      .email-details p {
          margin: 5px 0;
          font-size: 14px;
          font-family: 'Courier New', monospace;
          color: #48BB78;
      } 
        .footer {
            text-align: center;
            font-size: 14px;
            color: #888888;
        }
        .footer p {
            margin: 0;
        }
        @media (max-width: 600px) {
            .email-container {
                padding: 15px;
            }
            .header h1 {
                font-size: 20px;
            }
            .content {
                font-size: 14px;
            }
        }
    </style>
</head>
<body>

    <div class="email-container">
        <div class="header">
            <h1>Welcome to OpenEdu</h1>
        </div>

        <div class="content">
            <p>Hey! We've created an account for you and added you to <strong>${schoolName}</strong>.</p>
            <p>From now on, you can use the following credentials to log into your OpenEdu account to give grades, absences, and more to your students.</p>
            <p>If you were not expecting this email, you can safely ignore it.</p>
        </div>

        <div class="email-details">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
        </div>

        <div class="footer">
            <p>&copy; 2025 OpenEdu</p>
        </div>
    </div>

</body>
</html>`,
      };
      
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
    }

}

app.get('/userInfo', checkAuth, async (req, res) => {
  const userId = req.user.email; 
  const userName = req.user.name;
  let client;
  try {
    client = await pool.connect();
    const selectResult = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [userId]
    );

    if (selectResult.rows.length === 0) {
      try {
        await client.query(
          'INSERT INTO users (email, name) VALUES ($1, $2);',
          [userId, userName]
        );
        return res.status(200).json({ message: 'newAdmin' });
      } catch (error) {
        console.error('Error inserting new user:', error);
        return res.status(500).json({ message: 'Failed to insert new user' });
      }
    } else {
      const { role, in_creation } = selectResult.rows[0];

      if (in_creation) {
        return res.status(200).json({ message: 'newAdmin' });
      }

      switch (role) {
        case 'ADMINISTRATOR': {

           const schoolInfo =  await client.query(
            'SELECT * FROM schools WHERE creator_email = $1;',
            [userId]
          );
          const schoolId = schoolInfo.rows[0].school_id;

          const schoolStudents = await client.query(
            'SELECT * FROM students WHERE school_id = $1;',
            [schoolId]
          );
          const schoolTeachers = await client.query(
            'SELECT * FROM teachers WHERE school_id = $1;',
            [schoolId]
          );
          const schoolClasses = await client.query(
            'SELECT * FROM classes WHERE school_id = $1;',
            [schoolId]
          );
          const schoolGrades= await client.query(
            'SELECT * FROM grades WHERE school_id = $1;',
            [schoolId]
          );
          const schoolAbsences= await client.query(
            'SELECT * FROM absences WHERE school_id = $1;',
            [schoolId]
          );
          const teacherSubjects= await client.query(
            'SELECT * FROM teacher_subjects;',
          );
          let dataJson = {
            schoolInfo: schoolInfo.rows,
            students: schoolStudents.rows,
            teachers: schoolTeachers.rows,
            classes: schoolClasses.rows,
            grades: schoolGrades.rows,
            absences: schoolAbsences.rows,
            teacherSubjects: teacherSubjects.rows
          }

          return res.status(200).json({ 
            message: 'Admin',
            data: dataJson 
          });
          }
        case 'STUDENT':
          const studentInfo =  await client.query(
            `SELECT student_id, name, school_name, class_name
             FROM students
              JOIN classes ON students.class_id = classes.class_id
              JOIN schools ON students.school_id = schools.school_id
             WHERE email = $1;`,
            [userId]
          );
          let studentId = studentInfo.rows[0].student_id;
          let studentName = studentInfo.rows[0].name;
          let className = studentInfo.rows[0].class_name;
          let schoolName = studentInfo.rows[0].school_name;

          const gradeQuery = await client.query(
            `SELECT teacher_subjects.subject, grade, comments, created_at
             FROM grades
             JOIN 
              teacher_subjects ON grades.teacher_id = teacher_subjects.teacher_id 
             WHERE student_id = $1`,
            [studentId]
          );

          const absenceQuery = await client.query(
            `SELECT DISTINCT ON (reason, status, created_at, subject) 
            reason, status, created_at, subject
            FROM absences 
            JOIN teacher_subjects ON absences.teacher_id = teacher_subjects.teacher_id AND absences.subject_id = teacher_subjects.id
            WHERE student_id = $1
            ORDER BY reason, status, created_at, subject;`,
            [studentId]
          );
          let absences = absenceQuery.rows;
          const uniqueAbsences = Array.from(
            new Map(absences.map((item) => [`${item.reason}-${item.status}-${item.created_at}-${item.subject}`, item]))
              .values()
          );
          let grades = gradeQuery.rows;

          let dataJson = {
            studentName,
            className,
            schoolName,
            grades,
            absences: uniqueAbsences, 
          }
          return res.status(200).json({ 
            message: 'Student',
            data: dataJson 
          });

        case 'TEACHER': {

          const teacherInfo = await client.query(
            `SELECT * FROM teachers WHERE email = $1;`,
            [userId]
          );
          const schoolId = teacherInfo.rows[0].school_id;
          const schoolInfo = await client.query(
            `SELECT * FROM schools WHERE school_id = $1`,
            [schoolId]
          )

          const schoolStudents = await client.query(
            'SELECT * FROM students WHERE school_id = $1;',
            [schoolId]
          );

          const schoolClasses = await client.query(
            'SELECT * FROM classes WHERE school_id = $1;',
            [schoolId]
          );
          const schoolGrades= await client.query(
            'SELECT * FROM grades WHERE school_id = $1;',
            [schoolId]
          );
          const schoolAbsences= await client.query(
            'SELECT * FROM absences WHERE school_id = $1;',
            [schoolId]
          );
          const teacherSubjects= await client.query(
            'SELECT * FROM teacher_subjects',
          );
          let ts = (teacherSubjects.rows).filter(subject => subject.teacher_id == teacherInfo.rows[0].teacher_id);

          let dataJson = {
            schoolInfo: schoolInfo.rows,
            students: schoolStudents.rows,
            teacherInfo: teacherInfo.rows,
            classes: schoolClasses.rows,
            grades: schoolGrades.rows,
            absences: schoolAbsences.rows,
            teacherSubject: ts,
            teachers: teacherSubjects.rows,
          }

          return res.status(200).json({ 
            message: 'Teacher',
            data: dataJson 
          });
        }
        default:
          return res.status(400).json({ message: 'Unknown role' });
      }
    }
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).json({ message: 'Failed to fetch user data' });
  } finally {
    if (client) client.release(); 
  }
});


app.post('/newSchool', checkAuth, async (req, res) => {
  const data = req.body;
  const userId = req.user.email;
  const { schoolName, teachers, classes, students } = data;

  const client = await pool.connect();

  if (!schoolName || !teachers || !classes || !students) {
    res.status(400).send('Invalid data');
    return;
  }

  try {
    await client.query('BEGIN');

    const schoolInsertResult = await client.query(
      'INSERT INTO schools (creator_email, school_name) VALUES ($1, $2) RETURNING school_id;',
      [userId, schoolName]
    );
    const newSchoolId = schoolInsertResult.rows[0].school_id;

    let teachersWithId = [];
    for (const teacher of Object.keys(teachers)) {
      const teacherName = teacher;
      const { email: teacherEmail, processedSubjects: teacherSubjects } = teachers[teacher];

      await client.query(
        'INSERT INTO users (email, name, role, in_creation) VALUES ($1, $2, $3, FALSE);',
        [teacherEmail, teacherName, 'TEACHER']
      );

      const teacherInsertResult = await client.query(
        'INSERT INTO teachers (email, name, school_id) VALUES ($1, $2, $3) RETURNING teacher_id;',
        [teacherEmail, teacherName, newSchoolId]
      );

        let tchPwwd = generatePassword(12);
        const userRecord = await admin.auth().createUser({
          email: teacherEmail,
          emailVerified: false,
          password: tchPwwd,
          displayName: teacherName,
          disabled: false,
        });
        sendemail('teacher', teacherEmail, tchPwwd, schoolName);

        console.log(`Successfully created new user for teacher ${teacherName}:`, userRecord.uid);


      const newTeacherId = teacherInsertResult.rows[0].teacher_id;
      teachersWithId.push({ teacherName, id: newTeacherId });

      await Promise.all(
        teacherSubjects.map(subject =>
          client.query('INSERT INTO teacher_subjects (teacher_id, subject) VALUES ($1, $2);', [
            newTeacherId,
            subject,
          ])
        )
      );
    }

    let classNamesAndIds = [];
    for (const className of Object.keys(classes)) {
      const classHeadTeacher = classes[className];
      const headTeacherId = teachersWithId.find(teacher => teacher.teacherName === classHeadTeacher)?.id;

      const classesInsertResult = await client.query(
        'INSERT INTO classes (class_name, school_id, head_teacher_id) VALUES ($1, $2, $3) RETURNING class_id;',
        [className, newSchoolId, headTeacherId]
      );

      classNamesAndIds.push({ className, id: classesInsertResult.rows[0].class_id });
    }

    for (const student of Object.keys(students)) {
      const studentName = student;
      const { email: studentEmail, clasa: studentClass } = students[student];
      const studentClassId = classNamesAndIds.find(classEntry => classEntry.className === studentClass)?.id;

      await client.query(
        'INSERT INTO users (email, name, role, in_creation) VALUES ($1, $2, $3, FALSE);',
        [studentEmail, studentName, 'STUDENT']
      );

      await client.query(
        'INSERT INTO students (email, name, school_id, class_id) VALUES ($1, $2, $3, $4);',
        [studentEmail, studentName, newSchoolId, studentClassId]
      );

      let StdPwwd = generatePassword(12);
      const userRecord = await admin.auth().createUser({
        email: studentEmail,
        emailVerified: true,
        password: StdPwwd,
        displayName: studentName,
        disabled: false,
      });
      sendemail('student', studentEmail, StdPwwd, schoolName);


      console.log(`Successfully created new user for student ${studentName}:`, userRecord.uid);

    }

    await client.query('UPDATE users SET in_creation = false WHERE email = $1;', [userId]);

    await client.query('COMMIT');
    res.status(200).send('School created successfully');


  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating school:', err);
    res.status(500).send('Database error');
  } finally {
    client.release();
  }
});

app.post('/addGrade', checkAuth, async (req, res) => {
  const { studentId, subjectId, grade, comment } = req.body;
  const userId = req.user.email;
  
  if (!studentId || !subjectId || !grade || !comment) {
    res.status(400).send('Invalid input format');
    return;
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const teacherData = await client.query(`
      SELECT ts.id AS subject_id, t.school_id 
      FROM teachers t
      JOIN teacher_subjects ts ON ts.teacher_id = t.teacher_id
      WHERE t.email = $1 AND ts.id = $2;
    `, [userId, subjectId]);

    if (!teacherData.rows.length) {
      console.log(`Fraud attempt detected for user: ${userId} on ${new Date().toISOString()}`);
      res.status(400).send('Invalid data.');
      return;
    }

    const { school_id } = teacherData.rows[0];

    await client.query(`
      INSERT INTO grades (student_id, subject, grade, comments, teacher_id, school_id)
      VALUES ($1, $2, $3, $4, (SELECT teacher_id FROM teachers WHERE email = $5), $6);
    `, [studentId, subjectId, grade, comment, userId, school_id]);

    await client.query('COMMIT');
    res.status(200).send('Grade added successfully');
  } catch (err) {
    console.error('Transaction Error:', err);
    await client.query('ROLLBACK');
    res.status(500).send('Internal Server Error');
  } finally {
    client.release();
  }
});


app.post('/addAbsence', checkAuth, async (req, res) => {
  const { studentId, subjectId, reason } = req.body;
  const userId = req.user.email;

  if (!studentId || !subjectId || typeof reason !== 'string') {
    res.status(400).send('Invalid input format');
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const teacherData = await client.query(`
      SELECT ts.id AS subject_id, t.school_id 
      FROM teachers t
      JOIN teacher_subjects ts ON ts.teacher_id = t.teacher_id
      WHERE t.email = $1 AND ts.id = $2;
    `, [userId, subjectId]);

    if (!teacherData.rows.length) {
      console.log(`Fraud attempt detected for user: ${userId} on ${new Date().toISOString()}`);
      res.status(400).send('Invalid data.');
      return;
    }

    const { school_id } = teacherData.rows[0];

    await client.query(`
      INSERT INTO absences (student_id, reason, school_id, teacher_id, subject_id)
      VALUES ($1, $2, $3, (SELECT teacher_id FROM teachers WHERE email = $4), $5);
    `, [studentId, reason || 'Not Specified', school_id, userId, subjectId]);

    await client.query('COMMIT');
    res.status(200).send('Absence added successfully');
  } catch (err) {
    console.error('Transaction Error:', err);
    await client.query('ROLLBACK');
    res.status(500).send('Internal Server Error');
  } finally {
    client.release();
  }
});

app.post('/excuse', checkAuth, async (req, res) => {
  const { absence, reason } = req.body;
  const userId = req.user.email;
  if (!absence || !reason) {
    res.status(400).send('Invalid input format');
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const teacherData = await client.query(`
          SELECT 
              teachers.email
          FROM 
              absences
          JOIN 
              students ON absences.student_id = students.student_id
          JOIN 
              classes ON students.class_id = classes.class_id
          JOIN 
              teachers ON classes.head_teacher_id = teachers.teacher_id
          WHERE 
              absences.absence_id = $1;
    `, [absence.absence_id]);

    if (!teacherData.rows.length) {
      console.log(`Fraud attempt detected for user: ${userId} on ${new Date().toISOString()}`);
      res.status(400).send('Invalid data.');
      return;
    } if(!(teacherData.rows[0].email == userId)) {
      console.log(`Fraud attempt detected for user: ${userId} (${teacherData.rows[0].email}) on ${new Date().toISOString()}`);
      res.status(400).send('Invalid data.');
      return;
    }

    await client.query(
      `UPDATE absences 
       SET status = $1, reason = $2 
       WHERE absence_id = $3;`,
      ['EXCUSED', reason, absence.absence_id]
    );

    await client.query('COMMIT');
    res.status(200).send('Absence added successfully');
  } catch (err) {
    console.error('Transaction Error:', err);
    await client.query('ROLLBACK');
    res.status(500).send('Internal Server Error');
  } finally {
    client.release();
  }
});

app.post('/excusePeriod', checkAuth, async (req, res) => {
  const {studentId, startDate, endDate, reason} = req.body;
  const userId = req.user.email;
  if (!studentId || !startDate || !endDate || !reason ) {
    res.status(400).send('Invalid input format');
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const teacherData = await client.query(`
        SELECT 
            teachers.email
        FROM 
            students
        JOIN 
            classes ON students.class_id = classes.class_id
        JOIN 
            teachers ON classes.head_teacher_id = teachers.teacher_id
        WHERE 
            students.student_id = $1;
  `, [studentId]);
  

    if (!teacherData.rows.length) {
      console.log(`Fraud attempt detected for user: ${userId} on ${new Date().toISOString()}`);
      res.status(400).send('Invalid data.');
      return;
    } if(!(teacherData.rows[0].email == userId)) {
      console.log(`Fraud attempt detected for user: ${userId} (${teacherData.rows[0].email}) on ${new Date().toISOString()}`);
      res.status(400).send('Invalid data.');
      return;
    }

    const result = await client.query(
      `UPDATE absences
      SET status = 'EXCUSED', reason = $1
      WHERE created_at BETWEEN $2 AND $3
        AND student_id = $4
        AND status = 'PENDING';`,
      [reason, startDate, endDate, studentId] 
    );
    

    let excusedAbsences = result.rowCount;
    await client.query('COMMIT');
    res.status(200).json({ 
      message: 'Success',
      excusedAbsences 
    });

  } catch (err) {
    console.error('Transaction Error:', err);
    await client.query('ROLLBACK');
    res.status(500).send('Internal Server Error');
  } finally {
    client.release();
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

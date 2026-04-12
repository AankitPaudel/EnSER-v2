-- ============================================================
-- EnSer 2.0 — Supabase SQL Schema
-- Run these statements in your Supabase SQL editor (in order)
-- ============================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('community', 'student', 'professor')),
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects proposed by community members
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  department TEXT NOT NULL,
  proposed_by UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student applications to projects
CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES projects(id),
  student_id UUID REFERENCES profiles(id),
  professor_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI-generated syllabuses
CREATE TABLE syllabuses (
  id SERIAL PRIMARY KEY,
  application_id INT REFERENCES applications(id) UNIQUE,
  content TEXT NOT NULL,
  rubric TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student submissions (PDF stored in Supabase Storage)
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  application_id INT REFERENCES applications(id),
  file_url TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grades
CREATE TABLE grades (
  id SERIAL PRIMARY KEY,
  submission_id INT REFERENCES submissions(id) UNIQUE,
  score INT NOT NULL CHECK (score BETWEEN 0 AND 100),
  feedback TEXT,
  graded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS) — run after creating tables
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllabuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles, only edit their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Projects: anyone can view, only community members can create
CREATE POLICY "Projects are viewable by everyone" ON projects FOR SELECT USING (true);
CREATE POLICY "Community members can create projects" ON projects FOR INSERT WITH CHECK (auth.uid() = proposed_by);

-- Applications: students and professors can see their own
CREATE POLICY "Students can view own applications" ON applications FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Professors can view their applications" ON applications FOR SELECT USING (auth.uid() = professor_id);
CREATE POLICY "Students can create applications" ON applications FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Professors can update application status" ON applications FOR UPDATE USING (auth.uid() = professor_id);

-- Syllabuses: students and professors involved can view
CREATE POLICY "Syllabus visible to application participants" ON syllabuses FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM applications a
    WHERE a.id = syllabuses.application_id
    AND (a.student_id = auth.uid() OR a.professor_id = auth.uid())
  )
);

-- Submissions: students can insert, professors can view
CREATE POLICY "Students can submit" ON submissions FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM applications a
    WHERE a.id = submissions.application_id AND a.student_id = auth.uid()
  )
);
CREATE POLICY "Submission participants can view" ON submissions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM applications a
    WHERE a.id = submissions.application_id
    AND (a.student_id = auth.uid() OR a.professor_id = auth.uid())
  )
);

-- Grades: professors can insert, students can view their own
CREATE POLICY "Professors can grade" ON grades FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM submissions s
    JOIN applications a ON a.id = s.application_id
    WHERE s.id = grades.submission_id AND a.professor_id = auth.uid()
  )
);
CREATE POLICY "Students can view their grades" ON grades FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM submissions s
    JOIN applications a ON a.id = s.application_id
    WHERE s.id = grades.submission_id AND a.student_id = auth.uid()
  )
);
CREATE POLICY "Professors can view grades" ON grades FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM submissions s
    JOIN applications a ON a.id = s.application_id
    WHERE s.id = grades.submission_id AND a.professor_id = auth.uid()
  )
);

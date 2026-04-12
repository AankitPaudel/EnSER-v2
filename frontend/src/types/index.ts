export interface Profile {
  id: string
  full_name: string
  role: 'community' | 'student' | 'professor'
  department?: string
  created_at: string
}

export interface Project {
  id: number
  title: string
  description: string
  department: string
  proposed_by: string | null
  status: 'open' | 'in_progress' | 'completed'
  created_at: string
}

export interface Application {
  id: number
  project_id: number
  student_id: string
  professor_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

export interface Syllabus {
  id: number
  application_id: number
  content: string
  rubric: string
  generated_at: string
}

export interface Submission {
  id: number
  application_id: number
  file_url: string
  submitted_at: string
}

export interface Grade {
  id: number
  submission_id: number
  score: number
  feedback?: string
  graded_at: string
}

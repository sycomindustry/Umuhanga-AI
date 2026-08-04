-- Create experiments table for virtual lab
CREATE TABLE public.experiments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  level education_level NOT NULL,
  category TEXT NOT NULL, -- physics, chemistry, biology
  materials JSONB DEFAULT '[]'::jsonb,
  procedure JSONB DEFAULT '[]'::jsonb,
  safety_notes TEXT,
  learning_objectives JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view experiments"
ON public.experiments
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage experiments"
ON public.experiments
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create lab reports table
CREATE TABLE public.lab_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  experiment_id UUID REFERENCES public.experiments(id) ON DELETE CASCADE NOT NULL,
  observations TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  graphs JSONB DEFAULT '[]'::jsonb,
  conclusion TEXT,
  ai_feedback TEXT,
  grade INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lab reports"
ON public.lab_reports
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own lab reports"
ON public.lab_reports
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lab reports"
ON public.lab_reports
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view all lab reports"
ON public.lab_reports
FOR SELECT
USING (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create assignments table
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- homework, essay, quiz, exam
  due_date TIMESTAMP WITH TIME ZONE,
  total_points INTEGER DEFAULT 100,
  instructions TEXT,
  rubric JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view assignments"
ON public.assignments
FOR SELECT
USING (true);

CREATE POLICY "Teachers can manage assignments"
ON public.assignments
FOR ALL
USING (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create submissions table
CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  student_id UUID NOT NULL,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  grade INTEGER,
  feedback TEXT,
  ai_feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  graded_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own submissions"
ON public.submissions
FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students can create own submissions"
ON public.submissions
FOR INSERT
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own submissions before grading"
ON public.submissions
FOR UPDATE
USING (auth.uid() = student_id AND graded_at IS NULL);

CREATE POLICY "Teachers can view all submissions"
ON public.submissions
FOR SELECT
USING (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Teachers can grade submissions"
ON public.submissions
FOR UPDATE
USING (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for lab reports updated_at
CREATE TRIGGER update_lab_reports_updated_at
BEFORE UPDATE ON public.lab_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_experiments_subject ON public.experiments(subject_id);
CREATE INDEX idx_experiments_level ON public.experiments(level);
CREATE INDEX idx_lab_reports_user ON public.lab_reports(user_id);
CREATE INDEX idx_lab_reports_experiment ON public.lab_reports(experiment_id);
CREATE INDEX idx_assignments_teacher ON public.assignments(teacher_id);
CREATE INDEX idx_assignments_subject ON public.assignments(subject_id);
CREATE INDEX idx_submissions_assignment ON public.submissions(assignment_id);
CREATE INDEX idx_submissions_student ON public.submissions(student_id);
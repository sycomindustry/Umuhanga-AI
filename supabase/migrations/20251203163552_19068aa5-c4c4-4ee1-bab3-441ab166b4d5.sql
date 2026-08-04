-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Create content library table
CREATE TABLE public.content_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id),
  level TEXT NOT NULL,
  content_url TEXT,
  thumbnail_url TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;

-- RLS policies for content library
CREATE POLICY "Everyone can view content"
ON public.content_library
FOR SELECT
USING (true);

CREATE POLICY "Teachers and admins can manage content"
ON public.content_library
FOR ALL
USING (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'));

-- Create parent-student relationship table
CREATE TABLE public.parent_students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL,
  student_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(parent_id, student_id)
);

-- Enable RLS
ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Parents can view their linked students"
ON public.parent_students
FOR SELECT
USING (auth.uid() = parent_id);

CREATE POLICY "Admins can manage parent-student links"
ON public.parent_students
FOR ALL
USING (has_role(auth.uid(), 'admin'));
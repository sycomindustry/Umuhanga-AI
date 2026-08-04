-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student', 'parent');

-- Create enum for education levels
CREATE TYPE public.education_level AS ENUM ('primary', 'secondary', 'tvet');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  level education_level NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation_history table
CREATE TABLE public.conversation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student_progress table
CREATE TABLE public.student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  topics_completed JSONB DEFAULT '[]',
  quizzes_taken INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subject_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for subjects
CREATE POLICY "Everyone can view subjects"
  ON public.subjects FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage subjects"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for conversation_history
CREATE POLICY "Users can view own conversations"
  ON public.conversation_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON public.conversation_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Teachers and parents can view student conversations"
  ON public.conversation_history FOR SELECT
  USING (
    public.has_role(auth.uid(), 'teacher') OR
    public.has_role(auth.uid(), 'parent') OR
    auth.uid() = user_id
  );

-- RLS Policies for student_progress
CREATE POLICY "Users can view own progress"
  ON public.student_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.student_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.student_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Teachers and parents can view student progress"
  ON public.student_progress FOR SELECT
  USING (
    public.has_role(auth.uid(), 'teacher') OR
    public.has_role(auth.uid(), 'parent') OR
    auth.uid() = user_id
  );

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    new.email
  );
  
  -- Assign student role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'student');
  
  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default subjects
INSERT INTO public.subjects (name, level, description, icon) VALUES
  -- Primary subjects
  ('Mathematics', 'primary', 'Basic arithmetic, geometry, and problem solving', '🔢'),
  ('English', 'primary', 'Reading, writing, and grammar fundamentals', '📚'),
  ('Kinyarwanda', 'primary', 'Kinyarwanda language and culture', '🇷🇼'),
  ('Science', 'primary', 'Basic science concepts and experiments', '🔬'),
  ('Social Studies', 'primary', 'Rwanda history and geography', '🌍'),
  
  -- Secondary subjects
  ('Advanced Mathematics', 'secondary', 'Algebra, calculus, and statistics', '🧮'),
  ('Physics', 'secondary', 'Mechanics, electricity, and modern physics', '⚛️'),
  ('Chemistry', 'secondary', 'Chemical reactions and laboratory work', '🧪'),
  ('Biology', 'secondary', 'Life sciences and human anatomy', '🧬'),
  ('Computer Science', 'secondary', 'Programming and digital literacy', '💻'),
  ('Literature', 'secondary', 'Advanced reading and literary analysis', '📖'),
  
  -- TVET subjects
  ('Electrical Installation', 'tvet', 'Practical electrical work and safety', '⚡'),
  ('Construction', 'tvet', 'Building techniques and architecture', '🏗️'),
  ('Hospitality Management', 'tvet', 'Hotel and tourism industry skills', '🏨'),
  ('Auto Mechanics', 'tvet', 'Vehicle maintenance and repair', '🚗'),
  ('ICT Skills', 'tvet', 'Information and communication technology', '💾');
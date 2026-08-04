-- Helper: teacher-student relationship via the teacher's own assignments
CREATE OR REPLACE FUNCTION public.is_teacher_of(_student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'teacher'::app_role) AND EXISTS (
    SELECT 1
    FROM public.submissions s
    JOIN public.assignments a ON a.id = s.assignment_id
    WHERE s.student_id = _student_id
      AND a.teacher_id = auth.uid()
  )
$$;

-- Helper: parent-child relationship
CREATE OR REPLACE FUNCTION public.is_parent_of(_student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.parent_students ps
    WHERE ps.parent_id = auth.uid() AND ps.student_id = _student_id
  )
$$;

-- PROFILES: remove blanket read access
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Names-only directory used for messaging / leaderboards
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT id, full_name FROM public.profiles;
GRANT SELECT ON public.public_profiles TO authenticated;

-- NOTIFICATIONS: no more insert-for-anyone
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "Users create own or staff create notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'teacher'::app_role)
);

-- USER ROLES: explicitly admin-only for writes
DROP POLICY IF EXISTS "Admins can manage subjects" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- CONVERSATION HISTORY
DROP POLICY IF EXISTS "Teachers and parents can view student conversations" ON public.conversation_history;
CREATE POLICY "Linked parents can view child conversations"
ON public.conversation_history FOR SELECT TO authenticated
USING (public.is_parent_of(user_id));

-- STUDENT PROGRESS
DROP POLICY IF EXISTS "Teachers and parents can view student progress" ON public.student_progress;
CREATE POLICY "Linked teachers and parents can view student progress"
ON public.student_progress FOR SELECT TO authenticated
USING (public.is_teacher_of(user_id) OR public.is_parent_of(user_id));

-- LAB REPORTS
DROP POLICY IF EXISTS "Teachers can view all lab reports" ON public.lab_reports;
CREATE POLICY "Linked teachers can view lab reports"
ON public.lab_reports FOR SELECT TO authenticated
USING (public.is_teacher_of(user_id));

-- QUIZ ATTEMPTS
DROP POLICY IF EXISTS "Teachers can view all attempts" ON public.quiz_attempts;
CREATE POLICY "Linked teachers can view attempts"
ON public.quiz_attempts FOR SELECT TO authenticated
USING (public.is_teacher_of(user_id));

-- USER LAB SESSIONS
DROP POLICY IF EXISTS "Teachers can view student sessions" ON public.user_lab_sessions;
CREATE POLICY "Linked teachers can view student sessions"
ON public.user_lab_sessions FOR SELECT TO authenticated
USING (public.is_teacher_of(user_id));

-- SUBMISSIONS: scope to the teacher's own assignments
DROP POLICY IF EXISTS "Teachers can view all submissions" ON public.submissions;
DROP POLICY IF EXISTS "Teachers can grade submissions" ON public.submissions;
CREATE POLICY "Teachers can view submissions for own assignments"
ON public.submissions FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.assignments a
  WHERE a.id = submissions.assignment_id AND a.teacher_id = auth.uid()
));
CREATE POLICY "Teachers can grade submissions for own assignments"
ON public.submissions FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.assignments a
  WHERE a.id = submissions.assignment_id AND a.teacher_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.assignments a
  WHERE a.id = submissions.assignment_id AND a.teacher_id = auth.uid()
));

-- Lock down SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_education_level(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_teacher_of(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_parent_of(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_education_level(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_teacher_of(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_parent_of(uuid) TO authenticated, service_role;
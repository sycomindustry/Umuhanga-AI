-- Allow admins to manage subjects (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage subjects" 
ON public.subjects 
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all user profiles for management
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete notifications
CREATE POLICY "Admins can delete notifications" 
ON public.notifications 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to manage lab reports
CREATE POLICY "Admins can manage lab reports" 
ON public.lab_reports 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to manage student progress
CREATE POLICY "Admins can manage student progress" 
ON public.student_progress 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to manage messages
CREATE POLICY "Admins can manage messages" 
ON public.messages 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to manage calendar events
CREATE POLICY "Admins can manage calendar events" 
ON public.calendar_events 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to manage submissions
CREATE POLICY "Admins can manage submissions" 
ON public.submissions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to manage quiz attempts
CREATE POLICY "Admins can manage quiz attempts" 
ON public.quiz_attempts 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to manage conversation history
CREATE POLICY "Admins can manage conversations" 
ON public.conversation_history 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to manage parent-student links
CREATE POLICY "Admins can view parent-student links" 
ON public.parent_students 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));
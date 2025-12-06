from django.db import models
from django.contrib.auth.models import User

class Task(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    
    RECURRENCE_CHOICES = [
        ('none', 'No Repeat'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]
    
    CATEGORY_CHOICES = [
        ('Math', 'Math'),
        ('Science', 'Science'),
        ('History', 'History'),
        ('Literature', 'Literature'),
        ('Languages', 'Languages'),
        ('Programming', 'Programming'),
        ('Other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    deadline = models.DateTimeField(null=True, blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='Other', blank=True)
    recurrence = models.CharField(max_length=20, choices=RECURRENCE_CHOICES, default='none')
    is_recurring = models.BooleanField(default=False)
    parent_task = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='recurring_instances')
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', '-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def days_until_deadline(self):
        if not self.deadline:
            return None
        from django.utils import timezone
        delta = self.deadline.date() - timezone.now().date()
        return delta.days
    
    @property
    def status_label(self):
        if self.status == 'completed':
            return 'completed'
        if self.days_until_deadline is None:
            return 'upcoming'
        if self.days_until_deadline < 0:
            return 'overdue'
        if self.days_until_deadline == 0:
            return 'today'
        return 'upcoming'


class Label(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='labels')
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=7, default='#3B82F6')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'name')
    
    def __str__(self):
        return self.name


class TaskLabel(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='labels')
    label = models.ForeignKey(Label, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ('task', 'label')


class TaskNote(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='notes')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Note on {self.task.title}"


class TaskAttachment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='task_attachments/')
    link = models.URLField(null=True, blank=True)
    file_name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.file_name


class PomodoroSession(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='pomodoro_sessions')
    duration_minutes = models.IntegerField(default=25)
    completed = models.BooleanField(default=False)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Pomodoro - {self.task.title}"


class TaskTemplate(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_templates')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    priority = models.CharField(max_length=20, choices=Task.PRIORITY_CHOICES, default='medium')
    recurrence = models.CharField(max_length=20, choices=Task.RECURRENCE_CHOICES, default='none')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name


# Feature 1: Subtasks
class Subtask(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='subtasks')
    title = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('completed', 'Completed')], default='pending')
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', '-created_at']
    
    def __str__(self):
        return self.title


# Feature 2: Task Dependencies
class TaskDependency(models.Model):
    dependent_task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='dependencies_on')
    depends_on_task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='blocking_tasks')
    
    class Meta:
        unique_together = ('dependent_task', 'depends_on_task')
    
    def __str__(self):
        return f"{self.dependent_task.title} depends on {self.depends_on_task.title}"


# Feature 3: Time Tracking
class TimeLog(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='time_logs')
    duration_minutes = models.IntegerField()  # Actual time spent
    estimated_minutes = models.IntegerField(null=True, blank=True)  # Estimated time
    logged_date = models.DateField(auto_now_add=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Time log - {self.task.title}"


# Feature 4: Task Sharing
class TaskShare(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='shares')
    shared_with_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shared_tasks')
    can_edit = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('task', 'shared_with_user')
    
    def __str__(self):
        return f"{self.task.title} shared with {self.shared_with_user.username}"


# Feature 5: Task Comments
class TaskComment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comment by {self.user.username} on {self.task.title}"


# Feature 6: Task List (for grouping)
class TaskList(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_lists')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name


# Feature 7: Goal Tracking
class Goal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals')
    title = models.CharField(max_length=200)
    target_count = models.IntegerField()  # e.g., complete 5 tasks
    period = models.CharField(max_length=20, choices=[
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly')
    ])
    category = models.CharField(max_length=20, choices=Task.CATEGORY_CHOICES, default='Other', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title


# Feature 8: Filter Presets
class FilterPreset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='filter_presets')
    name = models.CharField(max_length=100)
    priority_filter = models.CharField(max_length=20, default='all')
    category_filter = models.CharField(max_length=20, default='all')
    status_filter = models.CharField(max_length=20, default='all')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name


# Feature 9: Theme Settings
class UserTheme(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='theme')
    primary_color = models.CharField(max_length=7, default='#FF6B35')  # Orange
    secondary_color = models.CharField(max_length=7, default='#004E89')  # Blue
    accent_color = models.CharField(max_length=7, default='#1DD1A1')  # Green
    font_family = models.CharField(max_length=100, default='Inter')
    dark_mode = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Theme for {self.user.username}"


# Feature 10: Task Reminders
class TaskReminder(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='reminders')
    remind_at = models.DateTimeField()
    is_sent = models.BooleanField(default=False)
    type = models.CharField(max_length=20, choices=[
        ('browser', 'Browser Notification'),
        ('email', 'Email'),
        ('sound', 'Sound Alert')
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Reminder for {self.task.title}"


# Feature 11: Activity Log (for undo/redo)
class ActivityLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_logs')
    action = models.CharField(max_length=50)  # 'create', 'update', 'delete', 'complete'
    task_id = models.IntegerField(null=True, blank=True)
    old_data = models.JSONField(null=True, blank=True)
    new_data = models.JSONField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.action} - {self.user.username}"


# Feature 12: Study Sessions
class StudySession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='study_sessions')
    task = models.ForeignKey(Task, on_delete=models.SET_NULL, null=True, blank=True, related_name='study_sessions')
    duration_minutes = models.IntegerField()
    break_minutes = models.IntegerField(default=5)
    started_at = models.DateTimeField()
    ended_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Study Session - {self.user.username}"


# Feature 13: Productivity Stats
class ProductivityStat(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='productivity_stats')
    total_tasks_completed = models.IntegerField(default=0)
    total_study_minutes = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=0)  # Days with completed tasks
    last_activity_date = models.DateField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Stats for {self.user.username}"


# Feature 14: Resource Links (for attachments)
# Already partially implemented via TaskAttachment, but adding specific LinkResource
class LinkResource(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='link_resources')
    title = models.CharField(max_length=255)
    url = models.URLField()
    resource_type = models.CharField(max_length=50, choices=[
        ('video', 'Video'),
        ('article', 'Article'),
        ('document', 'Document'),
        ('other', 'Other')
    ], default='other')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
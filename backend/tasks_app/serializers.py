from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Task, Label, TaskLabel, TaskNote, Subtask, TaskDependency, 
    TimeLog, TaskShare, TaskComment, TaskList, Goal, FilterPreset,
    UserTheme, TaskReminder, ActivityLog, StudySession, ProductivityStat,
    LinkResource, TaskTemplate
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class LabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Label
        fields = ['id', 'name', 'color', 'created_at']


class TaskLabelSerializer(serializers.ModelSerializer):
    label = LabelSerializer(read_only=True)
    
    class Meta:
        model = TaskLabel
        fields = ['id', 'label']


class TaskSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    labels = TaskLabelSerializer(many=True, read_only=True)
    
    class Meta:
        model = Task
        fields = ['id', 'user', 'title', 'description', 'status', 'priority', 'deadline', 'category', 'recurrence', 'labels', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class TaskCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['title', 'description', 'status', 'priority', 'deadline']


class TaskNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskNote
        fields = ['id', 'content', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


# New Serializers for all features

class SubtaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtask
        fields = ['id', 'title', 'status', 'order', 'created_at', 'updated_at']


class TaskDependencySerializer(serializers.ModelSerializer):
    depends_on_task = TaskSerializer(read_only=True)
    
    class Meta:
        model = TaskDependency
        fields = ['id', 'depends_on_task']


class TimeLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeLog
        fields = ['id', 'duration_minutes', 'estimated_minutes', 'logged_date', 'notes', 'created_at']
        read_only_fields = ['created_at', 'logged_date']


class TaskShareSerializer(serializers.ModelSerializer):
    shared_with_user = UserSerializer(read_only=True)
    
    class Meta:
        model = TaskShare
        fields = ['id', 'shared_with_user', 'can_edit', 'created_at']


class TaskCommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = TaskComment
        fields = ['id', 'user', 'content', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']


class TaskListSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskList
        fields = ['id', 'name', 'description', 'is_public', 'created_at']


class GoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = ['id', 'title', 'target_count', 'period', 'category', 'created_at']


class FilterPresetSerializer(serializers.ModelSerializer):
    class Meta:
        model = FilterPreset
        fields = ['id', 'name', 'priority_filter', 'category_filter', 'status_filter', 'created_at']


class UserThemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserTheme
        fields = ['id', 'primary_color', 'secondary_color', 'accent_color', 'font_family', 'dark_mode']


class TaskReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskReminder
        fields = ['id', 'remind_at', 'is_sent', 'type', 'created_at']


class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = ['id', 'action', 'task_id', 'old_data', 'new_data', 'timestamp']


class StudySessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudySession
        fields = ['id', 'task', 'duration_minutes', 'break_minutes', 'started_at', 'ended_at', 'notes', 'created_at']


class ProductivityStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductivityStat
        fields = ['id', 'total_tasks_completed', 'total_study_minutes', 'current_streak', 'last_activity_date', 'updated_at']


class LinkResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LinkResource
        fields = ['id', 'title', 'url', 'resource_type', 'created_at']


class TaskTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskTemplate
        fields = ['id', 'name', 'description', 'priority', 'recurrence', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
    
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Passwords must match."})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth.models import User
from .models import (
    Task, Label, TaskLabel, TaskNote, Subtask, TaskDependency,
    TimeLog, TaskShare, TaskComment, TaskList, Goal, FilterPreset,
    UserTheme, TaskReminder, ActivityLog, StudySession, ProductivityStat,
    LinkResource, TaskTemplate
)
from .serializers import (
    TaskSerializer, 
    LabelSerializer, 
    UserSerializer,
    RegisterSerializer,
    TaskCreateUpdateSerializer,
    TaskNoteSerializer,
    SubtaskSerializer,
    TaskDependencySerializer,
    TimeLogSerializer,
    TaskShareSerializer,
    TaskCommentSerializer,
    TaskListSerializer,
    GoalSerializer,
    FilterPresetSerializer,
    UserThemeSerializer,
    TaskReminderSerializer,
    ActivityLogSerializer,
    StudySessionSerializer,
    ProductivityStatSerializer,
    LinkResourceSerializer,
    TaskTemplateSerializer
)


class RegisterView(viewsets.ViewSet):
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User registered successfully"},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        tasks = self.get_queryset().filter(status='pending')
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def completed(self, request):
        tasks = self.get_queryset().filter(status='completed')
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_complete(self, request, pk=None):
        task = self.get_object()
        task.status = 'completed'
        task.save()
        serializer = self.get_serializer(task)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_pending(self, request, pk=None):
        task = self.get_object()
        task.status = 'pending'
        task.save()
        serializer = self.get_serializer(task)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def update_order(self, request):
        """Update task order for drag and drop"""
        try:
            order_data = request.data.get('order', [])
            for index, task_id in enumerate(order_data):
                Task.objects.filter(id=task_id, user=request.user).update(order=index)
            return Response({'message': 'Order updated successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def create_recurring(self, request, pk=None):
        """Create next instance of recurring task"""
        from datetime import timedelta
        from django.utils import timezone
        
        task = self.get_object()
        if task.recurrence == 'none':
            return Response({'error': 'Task is not recurring'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            new_deadline = task.deadline
            if task.recurrence == 'daily' and task.deadline:
                new_deadline = task.deadline + timedelta(days=1)
            elif task.recurrence == 'weekly' and task.deadline:
                new_deadline = task.deadline + timedelta(weeks=1)
            elif task.recurrence == 'monthly' and task.deadline:
                new_deadline = task.deadline + timedelta(days=30)
            
            new_task = Task.objects.create(
                user=task.user,
                title=task.title,
                description=task.description,
                priority=task.priority,
                category=task.category,
                recurrence=task.recurrence,
                is_recurring=True,
                parent_task=task,
                deadline=new_deadline,
                status='pending'
            )
            serializer = self.get_serializer(new_task)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class LabelViewSet(viewsets.ModelViewSet):
    serializer_class = LabelSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Label.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class TaskNoteViewSet(viewsets.ModelViewSet):
    serializer_class = TaskNoteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        task_id = self.kwargs.get('task_id')
        if task_id:
            return TaskNote.objects.filter(task__id=task_id, task__user=self.request.user)
        return TaskNote.objects.filter(task__user=self.request.user)
    
    def perform_create(self, serializer):
        task_id = self.kwargs.get('task_id')
        task = Task.objects.get(id=task_id, user=self.request.user)
        serializer.save(task=task)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['task_id'] = self.kwargs.get('task_id')
        return context


# New ViewSets for all features

class SubtaskViewSet(viewsets.ModelViewSet):
    serializer_class = SubtaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        task_id = self.kwargs.get('task_id')
        return Subtask.objects.filter(task__id=task_id, task__user=self.request.user)
    
    def perform_create(self, serializer):
        task_id = self.kwargs.get('task_id')
        task = Task.objects.get(id=task_id, user=self.request.user)
        serializer.save(task=task)


class TaskDependencyViewSet(viewsets.ModelViewSet):
    serializer_class = TaskDependencySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        task_id = self.kwargs.get('task_id')
        return TaskDependency.objects.filter(dependent_task__id=task_id, dependent_task__user=self.request.user)
    
    def perform_create(self, serializer):
        task_id = self.kwargs.get('task_id')
        task = Task.objects.get(id=task_id, user=self.request.user)
        serializer.save(dependent_task=task)


class TimeLogViewSet(viewsets.ModelViewSet):
    serializer_class = TimeLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        task_id = self.kwargs.get('task_id')
        return TimeLog.objects.filter(task__id=task_id, task__user=self.request.user)
    
    def perform_create(self, serializer):
        task_id = self.kwargs.get('task_id')
        task = Task.objects.get(id=task_id, user=self.request.user)
        serializer.save(task=task)


class TaskShareViewSet(viewsets.ModelViewSet):
    serializer_class = TaskShareSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return TaskShare.objects.filter(task__user=self.request.user)
    
    def perform_create(self, serializer):
        task_id = self.request.data.get('task_id')
        task = Task.objects.get(id=task_id, user=self.request.user)
        serializer.save(task=task)


class TaskCommentViewSet(viewsets.ModelViewSet):
    serializer_class = TaskCommentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        task_id = self.kwargs.get('task_id')
        return TaskComment.objects.filter(task__id=task_id, task__user=self.request.user)
    
    def perform_create(self, serializer):
        task_id = self.kwargs.get('task_id')
        task = Task.objects.get(id=task_id, user=self.request.user)
        serializer.save(task=task, user=self.request.user)


class TaskListViewSet(viewsets.ModelViewSet):
    serializer_class = TaskListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return TaskList.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FilterPresetViewSet(viewsets.ModelViewSet):
    serializer_class = FilterPresetSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return FilterPreset.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserThemeViewSet(viewsets.ModelViewSet):
    serializer_class = UserThemeSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get', 'put'])
    def me(self, request):
        theme, created = UserTheme.objects.get_or_create(user=request.user)
        if request.method == 'PUT':
            serializer = self.get_serializer(theme, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
        else:
            serializer = self.get_serializer(theme)
        return Response(serializer.data)


class TaskReminderViewSet(viewsets.ModelViewSet):
    serializer_class = TaskReminderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        task_id = self.kwargs.get('task_id')
        return TaskReminder.objects.filter(task__id=task_id, task__user=self.request.user)
    
    def perform_create(self, serializer):
        task_id = self.kwargs.get('task_id')
        task = Task.objects.get(id=task_id, user=self.request.user)
        serializer.save(task=task)


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ActivityLog.objects.filter(user=self.request.user)


class StudySessionViewSet(viewsets.ModelViewSet):
    serializer_class = StudySessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return StudySession.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ProductivityStatViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductivityStatSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        stat, created = ProductivityStat.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(stat)
        return Response(serializer.data)


class LinkResourceViewSet(viewsets.ModelViewSet):
    serializer_class = LinkResourceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        task_id = self.kwargs.get('task_id')
        return LinkResource.objects.filter(task__id=task_id, task__user=self.request.user)
    
    def perform_create(self, serializer):
        task_id = self.kwargs.get('task_id')
        task = Task.objects.get(id=task_id, user=self.request.user)
        serializer.save(task=task)


class TaskTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = TaskTemplateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return TaskTemplate.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def create_from_template(self, request, pk=None):
        template = self.get_object()
        task_data = {
            'title': request.data.get('title', template.name),
            'description': template.description,
            'priority': template.priority,
            'recurrence': template.recurrence,
            'user': request.user,
        }
        task = Task.objects.create(**task_data)
        serializer = TaskSerializer(task)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
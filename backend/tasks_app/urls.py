from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    TaskViewSet, LabelViewSet, UserViewSet, RegisterView, TaskNoteViewSet,
    SubtaskViewSet, TaskDependencyViewSet, TimeLogViewSet, TaskShareViewSet,
    TaskCommentViewSet, TaskListViewSet, GoalViewSet, FilterPresetViewSet,
    UserThemeViewSet, TaskReminderViewSet, ActivityLogViewSet, StudySessionViewSet,
    ProductivityStatViewSet, LinkResourceViewSet, TaskTemplateViewSet
)

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'labels', LabelViewSet, basename='label')
router.register(r'users', UserViewSet, basename='user')
router.register(r'auth', RegisterView, basename='auth')
router.register(r'goals', GoalViewSet, basename='goal')
router.register(r'filter-presets', FilterPresetViewSet, basename='filter-preset')
router.register(r'task-lists', TaskListViewSet, basename='task-list')
router.register(r'study-sessions', StudySessionViewSet, basename='study-session')
router.register(r'templates', TaskTemplateViewSet, basename='template')

urlpatterns = [
    path('', include(router.urls)),
    # Task nested routes
    path('tasks/<int:task_id>/notes/', TaskNoteViewSet.as_view({'get': 'list', 'post': 'create'}), name='task-notes-list'),
    path('tasks/<int:task_id>/notes/<int:pk>/', TaskNoteViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='task-notes-detail'),
    path('tasks/<int:task_id>/subtasks/', SubtaskViewSet.as_view({'get': 'list', 'post': 'create'}), name='task-subtasks-list'),
    path('tasks/<int:task_id>/subtasks/<int:pk>/', SubtaskViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='task-subtasks-detail'),
    path('tasks/<int:task_id>/dependencies/', TaskDependencyViewSet.as_view({'get': 'list', 'post': 'create'}), name='task-dependencies-list'),
    path('tasks/<int:task_id>/dependencies/<int:pk>/', TaskDependencyViewSet.as_view({'get': 'retrieve', 'delete': 'destroy'}), name='task-dependencies-detail'),
    path('tasks/<int:task_id>/time-logs/', TimeLogViewSet.as_view({'get': 'list', 'post': 'create'}), name='task-time-logs-list'),
    path('tasks/<int:task_id>/time-logs/<int:pk>/', TimeLogViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='task-time-logs-detail'),
    path('tasks/<int:task_id>/comments/', TaskCommentViewSet.as_view({'get': 'list', 'post': 'create'}), name='task-comments-list'),
    path('tasks/<int:task_id>/comments/<int:pk>/', TaskCommentViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='task-comments-detail'),
    path('tasks/<int:task_id>/reminders/', TaskReminderViewSet.as_view({'get': 'list', 'post': 'create'}), name='task-reminders-list'),
    path('tasks/<int:task_id>/reminders/<int:pk>/', TaskReminderViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='task-reminders-detail'),
    path('tasks/<int:task_id>/resources/', LinkResourceViewSet.as_view({'get': 'list', 'post': 'create'}), name='task-resources-list'),
    path('tasks/<int:task_id>/resources/<int:pk>/', LinkResourceViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='task-resources-detail'),
    path('task-shares/', TaskShareViewSet.as_view({'get': 'list', 'post': 'create'}), name='task-share-list'),
    path('theme/me/', UserThemeViewSet.as_view({'get': 'me', 'put': 'me'}), name='theme-me'),
    path('activity/', ActivityLogViewSet.as_view({'get': 'list'}), name='activity-list'),
    path('productivity/me/', ProductivityStatViewSet.as_view({'get': 'me'}), name='productivity-me'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
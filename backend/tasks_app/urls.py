from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import TaskViewSet, LabelViewSet, UserViewSet, RegisterView

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'labels', LabelViewSet, basename='label')
router.register(r'users', UserViewSet, basename='user')
router.register(r'auth', RegisterView, basename='auth')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
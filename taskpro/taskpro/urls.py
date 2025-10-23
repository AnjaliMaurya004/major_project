from django.contrib import admin
from django.urls import path, include
from users.views import welcome_view, login_view, register_view, dashboard_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', welcome_view, name='welcome'),
    path('login/', login_view, name='login'),
    path('register/', register_view, name='register'),
    path('dashboard/', dashboard_view, name='dashboard'),
    
    # API endpoints
    path('api/users/', include('users.urls')),
    path('api/tasks/', include('tasks.urls')),
]
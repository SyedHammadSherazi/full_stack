from django.contrib import admin
from django.urls import path
from django.urls import path, include
from Projects.views import ProjectListAPIView
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from Projects.views import ProjectListAPIView, LoggedInUserAPIView
urlpatterns = [
    path("admin/", admin.site.urls),

    # Projects API
    path("api/projects", ProjectListAPIView.as_view(), name="project-list"),
     path("api/user/", LoggedInUserAPIView.as_view(), name="logged-in-user"),
    # JWT Authentication APIs
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),

    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/", include("Notes.urls")),
    path("api/", include("Workspace.urls")),
    path(
        "api/notifications/",
        include("Notifications.urls"),
    ),
    path("files/", include("Files.urls")),
]
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )
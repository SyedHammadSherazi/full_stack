from django.urls import path
from . import views
from .views import WorkspacePresenceAPIView
from .views import WorkspaceListAPIView
urlpatterns = [
    path(
    "workspaces/",
    views.WorkspaceListAPIView.as_view(),
    name="workspace-list",),
    path("workspaces/<int:workspace_id>/notes/",
         views.WorkspaceNotesAPIView.as_view(),
         name="workspace-notes"),
    path(
        "workspaces/<int:workspace_id>/presence/",
        WorkspacePresenceAPIView.as_view(),
        name="workspace-presence",)     
]
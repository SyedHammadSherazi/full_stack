from django.urls import path
from . import views

urlpatterns = [
    path("workspaces/<int:workspace_id>/notes/",
         views.WorkspaceNotesAPIView.as_view(),
         name="workspace-notes"),
]
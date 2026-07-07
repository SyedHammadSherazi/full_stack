from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Workspace, Membership
from Notes.models import Note


class WorkspaceNotesAPIView(APIView):
    """GET: workspace ke saare notes list karo | POST: naya note banao"""
    permission_classes = [IsAuthenticated]

    def get(self, request, workspace_id):
        workspace = get_object_or_404(Workspace, id=workspace_id)

        # sirf member hi dekh sake
        if not workspace.memberships.filter(user=request.user).exists():
            return Response({"error": "Aap is workspace ke member nahi"},
                            status=status.HTTP_403_FORBIDDEN)

        notes = workspace.notes.all().values("id", "title", "content", "updated_at")
        return Response(list(notes))

    def post(self, request, workspace_id):
        workspace = get_object_or_404(Workspace, id=workspace_id)

        # sirf editor naya note bana sake
        membership = workspace.memberships.filter(user=request.user).first()
        if membership is None:
            return Response({"error": "Aap is workspace ke member nahi"},
                            status=status.HTTP_403_FORBIDDEN)
        if membership.role != "editor":
            return Response({"error": "Viewer note nahi bana sakta"},
                            status=status.HTTP_403_FORBIDDEN)

        note = Note.objects.create(
            workspace=workspace,
            title=request.data.get("title", "Untitled"),
            content=request.data.get("content", ""),
        )
        return Response(
            {"id": note.id, "title": note.title, "content": note.content},
            status=status.HTTP_201_CREATED,
        )
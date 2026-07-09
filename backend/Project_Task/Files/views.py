from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from Workspace.models import Workspace
from .models import WorkspaceFile


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def upload_file(request, workspace_id):

    workspace = get_object_or_404(
        Workspace,
        id=workspace_id
    )

    # TODO:
    # Yahan workspace member check lagana hai (Task 5)

    # ==========================
    # GET -> List all files
    # ==========================
    if request.method == "GET":

        files = WorkspaceFile.objects.filter(
            workspace=workspace
        )

        data = []

        for file in files:
            data.append({
                "id": file.id,
                "original_name": file.original_name,
                "file_url": request.build_absolute_uri(file.file.url),
                "uploaded_by": file.uploaded_by.username,
                "uploaded_at": file.uploaded_at,
            })

        return Response(data, status=status.HTTP_200_OK)

    # ==========================
    # POST -> Upload file
    # ==========================
    uploaded_file = request.FILES.get("file")

    if not uploaded_file:
        return Response(
            {
                "success": False,
                "message": "No file selected."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    new_file = WorkspaceFile.objects.create(
        workspace=workspace,
        uploaded_by=request.user,
        file=uploaded_file,
        original_name=uploaded_file.name
    )

    return Response(
        {
            "success": True,
            "message": "File uploaded successfully.",
            "file": {
                "id": new_file.id,
                "original_name": new_file.original_name,
                "file_url": request.build_absolute_uri(new_file.file.url),
                "uploaded_by": new_file.uploaded_by.username,
                "uploaded_at": new_file.uploaded_at,
            }
        },
        status=status.HTTP_201_CREATED
    )
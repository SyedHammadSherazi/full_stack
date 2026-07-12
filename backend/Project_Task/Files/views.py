from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.http import FileResponse

from Chat.models import Message
from Workspace.models import Workspace
from .models import WorkspaceFile

from Notifications.services import create_notification

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


# ------------------------------------------
# Upload + List Files
# ------------------------------------------

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def upload_file(request, workspace_id):

    workspace = get_object_or_404(
        Workspace,
        id=workspace_id,
    )

    # ------------------------------------------
    # Workspace Member Check
    # ------------------------------------------

    is_member = workspace.memberships.filter(
        user=request.user
    ).exists()

    if not is_member:

        return Response(
            {
                "success": False,
                "message": "You are not a member of this workspace.",
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    # ------------------------------------------
    # GET Files
    # ------------------------------------------

    if request.method == "GET":

        files = WorkspaceFile.objects.filter(
            workspace=workspace
        )

        data = []

        for file in files:

            data.append(
                {
                    "id": file.id,
                    "original_name": file.original_name,

                    # IMPORTANT
                    "file_url": request.build_absolute_uri(
                        f"/files/download/{file.id}/"
                    ),

                    "uploaded_by": file.uploaded_by.username,
                    "uploaded_at": file.uploaded_at,
                }
            )

        return Response(data)

    # ------------------------------------------
    # Upload File
    # ------------------------------------------

    uploaded_file = request.FILES.get("file")

    if not uploaded_file:

        return Response(
            {
                "success": False,
                "message": "No file selected.",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    new_file = WorkspaceFile.objects.create(
        workspace=workspace,
        uploaded_by=request.user,
        file=uploaded_file,
        original_name=uploaded_file.name,
    )

    download_url = request.build_absolute_uri(
        f"/files/download/{new_file.id}/"
    )

    # ------------------------------------------
    # Save Chat History
    # ------------------------------------------

    Message.objects.create(
        sender=request.user.username,
        room=str(workspace.id),
        message_type="file",
        file_name=new_file.original_name,
        file_url=download_url,
    )

    # ------------------------------------------
    # Notifications
    # ------------------------------------------

    memberships = workspace.memberships.select_related("user")

    for membership in memberships:

        if membership.user == request.user:
            continue

        create_notification(
            recipient=membership.user,
            sender=request.user,
            workspace=workspace,
            notification_type="file",
            title="📎 New File Uploaded",
            message=f"{request.user.username} uploaded {new_file.original_name}",
        )

    # ------------------------------------------
    # WebSocket
    # ------------------------------------------

    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        f"chat_{workspace.id}",
        {
            "type": "file_message",
            "sender": request.user.username,
            "file_name": new_file.original_name,
            "file_url": download_url,
        },
    )

    return Response(
        {
            "success": True,
            "message": "File uploaded successfully.",
            "file": {
                "id": new_file.id,
                "original_name": new_file.original_name,
                "file_url": download_url,
                "uploaded_by": request.user.username,
                "uploaded_at": new_file.uploaded_at,
            },
        },
        status=status.HTTP_201_CREATED,
    )


# ------------------------------------------
# Secure Download
# ------------------------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_file(request, file_id):

    file = get_object_or_404(
        WorkspaceFile,
        id=file_id,
    )

    is_member = file.workspace.memberships.filter(
        user=request.user
    ).exists()

    if not is_member:

        return Response(
            {
                "success": False,
                "message": "Access Denied",
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    return FileResponse(
        file.file.open("rb"),
        as_attachment=True,
        filename=file.original_name,
    )
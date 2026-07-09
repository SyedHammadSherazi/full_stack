from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Notification
from .serializers import NotificationSerializer
from .services import (
    get_user_notifications,
    mark_notification_as_read,
)


class NotificationListAPIView(APIView):
    """
    Return all notifications for the logged-in user.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):

        notifications = get_user_notifications(request.user)

        serializer = NotificationSerializer(
            notifications,
            many=True,
        )

        return Response(serializer.data)


class NotificationReadAPIView(APIView):
    """
    Mark a notification as read.
    """

    permission_classes = [IsAuthenticated]

    def patch(self, request, notification_id):

        notification = get_object_or_404(
            Notification,
            id=notification_id,
            recipient=request.user,
        )

        mark_notification_as_read(notification)

        return Response(
            {
                "message": "Notification marked as read."
            },
            status=status.HTTP_200_OK,
        )
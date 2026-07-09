from rest_framework import serializers
from .models import Notification



class NotificationSerializer(serializers.ModelSerializer):

    sender = serializers.CharField(
        source="sender.username",
        read_only=True,
    )

    recipient = serializers.CharField(
        source="recipient.username",
        read_only=True,
    )

    workspace = serializers.CharField(
        source="workspace.name",
        read_only=True,
    )

    class Meta:

        model = Notification

        fields = (
            "id",
            "sender",
            "recipient",
            "workspace",
            "notification_type",
            "title",
            "message",
            "is_read",
            "created_at",
        )

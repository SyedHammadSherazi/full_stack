from rest_framework import serializers
from .models import Presence


class PresenceSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Presence
        fields = [
            "id",
            "user",
            "username",
            "status",
            "connected_at",
            "last_seen",
        ]
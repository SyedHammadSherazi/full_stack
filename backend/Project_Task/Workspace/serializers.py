from rest_framework import serializers
from .models import Presence
from .models import Workspace

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

class WorkspaceSerializer(serializers.ModelSerializer):

    class Meta:
        model = Workspace
        fields = [
            "id",
            "name",
            "created_at",
        ]                

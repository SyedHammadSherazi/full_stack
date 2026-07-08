from django.utils import timezone
from .models import Presence, Membership


def is_workspace_member(workspace, user):
    """
    Check whether the given user belongs to the workspace.
    """
    return Membership.objects.filter(
        workspace=workspace,
        user=user,
    ).exists()


def mark_user_online(workspace, user):
    """
    Mark a user as online in a workspace.
    """
    presence, _ = Presence.objects.get_or_create(
        workspace=workspace,
        user=user,
    )

    presence.status = "online"
    presence.last_seen = timezone.now()
    presence.save(
        update_fields=[
            "status",
            "last_seen",
        ]
    )

    return presence


def mark_user_offline(workspace, user):
    """
    Mark a user as offline in a workspace.
    """
    try:
        presence = Presence.objects.get(
            workspace=workspace,
            user=user,
        )

        presence.status = "offline"
        presence.last_seen = timezone.now()
        presence.save(
            update_fields=[
                "status",
                "last_seen",
            ]
        )

    except Presence.DoesNotExist:
        pass


def update_heartbeat(workspace, user):
    """
    Update last seen timestamp.
    """
    try:
        presence = Presence.objects.get(
            workspace=workspace,
            user=user,
        )

        presence.last_seen = timezone.now()
        presence.save(update_fields=["last_seen"])

    except Presence.DoesNotExist:
        pass


def get_online_users(workspace):
    """
    Return online users of a workspace.
    """
    return Presence.objects.filter(
        workspace=workspace,
        status="online",
    ).select_related("user")
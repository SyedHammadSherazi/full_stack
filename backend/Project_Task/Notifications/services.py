from .models import Notification
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

def create_notification(
    *,
    recipient,
    sender,
    workspace,
    notification_type="message",
    title,
    message,
):
    """
    Create notification and send it over websocket.
    """

    notification = Notification.objects.create(
        recipient=recipient,
        sender=sender,
        workspace=workspace,
        notification_type=notification_type,
        title=title,
        message=message,
    )

    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        f"notifications_{recipient.id}",
        {
            "type": "notification_message",
            "title": title,
            "message": message,
            "sender": sender.username,
            "workspace": workspace.name,
        },
    )

    return notification


def get_user_notifications(user):
    """
    Return all notifications for a user.
    """

    return Notification.objects.filter(
        recipient=user,
    ).select_related(
        "sender",
        "workspace",
    )


def mark_notification_as_read(notification):
    """
    Mark a notification as read.
    """

    notification.is_read = True
    notification.save(update_fields=["is_read"])

    return notification


def mark_all_notifications_as_read(user):
    """
    Mark all notifications as read.
    """

    Notification.objects.filter(
        recipient=user,
        is_read=False,
    ).update(is_read=True)
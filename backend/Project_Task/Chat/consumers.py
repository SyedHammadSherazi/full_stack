import json

from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer

from django.contrib.auth.models import User

from .models import Message
from Notifications.services import create_notification
from Workspace.models import Workspace


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):

        self.workspace_id = self.scope["url_route"]["kwargs"]["workspace_id"]
        self.room_group_name = f"chat_{self.workspace_id}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )

        await self.accept()

        messages = await self.get_last_messages()

        for message in messages:

            if message.message_type == "file":

                await self.send(
                    text_data=json.dumps({
                        "type": "file",
                        "sender": message.sender,
                        "file_name": message.file_name,
                        "file_url": message.file_url,
                        "history": True,
                    })
                )

            else:

                await self.send(
                    text_data=json.dumps({
                        "type": "text",
                        "sender": message.sender,
                        "message": message.content,
                        "history": True,
                    })
                )

    async def disconnect(self, close_code):

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )

    @database_sync_to_async
    def save_message(self, sender, content):

        Message.objects.create(
            sender=sender,
            room=str(self.workspace_id),
            message_type="text",
            content=content,
        )

    @database_sync_to_async
    def get_last_messages(self):

        messages = (
            Message.objects
            .filter(room=str(self.workspace_id))
            .order_by("-timestamp")[:50]
        )

        return list(reversed(messages))

    @database_sync_to_async
    def notify_workspace_members(
        self,
        sender_username,
        title,
        notification_message,
        notification_type="message",
    ):

        workspace = Workspace.objects.get(
            id=self.workspace_id
        )

        sender = User.objects.get(
            username=sender_username
        )

        memberships = workspace.memberships.select_related("user")

        for membership in memberships:

            if membership.user == sender:
                continue

            create_notification(
                recipient=membership.user,
                sender=sender,
                workspace=workspace,
                notification_type=notification_type,
                title=title,
                message=notification_message,
            )

    async def receive(self, text_data):

        data = json.loads(text_data)

        sender = data.get("sender")
        message = data.get("message")

        await self.save_message(
            sender,
            message,
        )

        await self.notify_workspace_members(
            sender_username=sender,
            title="New Chat Message",
            notification_message=f"{sender}: {message}",
            notification_type="message",
        )

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "sender": sender,
                "message": message,
            },
        )

    async def chat_message(self, event):

        await self.send(
            text_data=json.dumps({
                "type": "text",
                "sender": event["sender"],
                "message": event["message"],
            })
        )

    async def file_message(self, event):

        await self.send(
            text_data=json.dumps({
                "type": "file",
                "sender": event["sender"],
                "file_name": event["file_name"],
                "file_url": event["file_url"],
            })
        )
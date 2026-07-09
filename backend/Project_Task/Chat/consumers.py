import json

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from django.contrib.auth.models import User

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .models import Message
from Workspace.models import Workspace
from Notifications.services import create_notification


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

            await self.send(
                text_data=json.dumps({
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
            content=content,
        )

    @database_sync_to_async
    def get_last_messages(self):

        messages = (
            Message.objects
            .filter(room=str(self.workspace_id))
            .order_by("-timestamp")[:20]
        )

        return list(reversed(messages))

    @database_sync_to_async
    def notify_workspace_members(self, sender_username, message):

        try:

            workspace = Workspace.objects.get(
                id=self.workspace_id
            )

            sender = User.objects.get(
                username=sender_username
            )

            channel_layer = get_channel_layer()

            memberships = workspace.memberships.select_related("user")

            for membership in memberships:

                # Sender ko notification nahi bhejni
                if membership.user == sender:
                    continue

                # Save notification in database
                create_notification(
                    recipient=membership.user,
                    sender=sender,
                    workspace=workspace,
                    notification_type="message",
                    title="New Chat Message",
                    message=f"{sender.username}: {message}",
                )

                # Send realtime notification
                async_to_sync(channel_layer.group_send)(
                    f"notifications_{membership.user.id}",
                    {
                        "type": "notification_message",
                        "title": "New Chat Message",
                        "message": f"{sender.username}: {message}",
                        "sender": sender.username,
                        "workspace": workspace.name,
                        "workspace_id": workspace.id,
                    }
                )

        except Workspace.DoesNotExist:

            print(f"Workspace {self.workspace_id} not found.")

        except User.DoesNotExist:

            print(f"User {sender_username} not found.")

        except Exception as e:

            print("Notification Error:", e)

    async def receive(self, text_data):

        data = json.loads(text_data)

        message = data["message"]
        sender = data.get("sender", "Anonymous")

        # Save chat message
        await self.save_message(
            sender,
            message,
        )

        # Notify other workspace members
        await self.notify_workspace_members(
            sender,
            message,
        )

        # Broadcast chat message
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
                "sender": event["sender"],
                "message": event["message"],
            })
        )
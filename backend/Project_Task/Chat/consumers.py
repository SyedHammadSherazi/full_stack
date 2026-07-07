import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        # URL se room name lena
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]

        # Group name banana
        self.room_group_name = f"chat_{self.room_name}"

        # User ko group me add karna
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Connection accept karna
        await self.accept()

        # Last 20 messages bhejna
        messages = await self.get_last_messages()

        for message in messages:
            await self.send(
                text_data=json.dumps({
                    "sender": message.sender,
                    "message": message.content,
                    "history": True
                })
            )

    async def disconnect(self, close_code):
        # Group se remove karna
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    @database_sync_to_async
    def save_message(self, sender, room, content):
        Message.objects.create(
            sender=sender,
            room=room,
            content=content
        )

    @database_sync_to_async
    def get_last_messages(self):
        messages = (
            Message.objects
            .filter(room=self.room_name)
            .order_by("-timestamp")[:20]
        )

        return list(reversed(messages))

    async def receive(self, text_data):
        data = json.loads(text_data)

        message = data["message"]
        sender = data.get("sender", "Anonymous")

        # Database me save karna
        await self.save_message(
            sender,
            self.room_name,
            message
        )

        # Group me broadcast karna
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "sender": sender,
                "message": message,
            }
        )

    async def chat_message(self, event):
        await self.send(
            text_data=json.dumps({
                "sender": event["sender"],
                "message": event["message"],
            })
        )
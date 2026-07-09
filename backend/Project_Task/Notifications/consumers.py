import json
from channels.generic.websocket import AsyncWebsocketConsumer


class NotificationConsumer(AsyncWebsocketConsumer):

    async def connect(self):

        self.user = self.scope["user"]

        if not self.user.is_authenticated:
            await self.close()
            return

        self.room_group_name = f"notifications_{self.user.id}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )

        await self.accept()

        print(f"✅ Notification Connected: {self.user.username}")

    async def disconnect(self, close_code):

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )

        print(f"❌ Notification Disconnected: {self.user.username}")

    async def notification_message(self, event):

        print("🔥 Notification Event:", event)

        await self.send(
            text_data=json.dumps({
                "type": "notification",
                "title": event.get("title"),
                "message": event.get("message"),
                "sender": event.get("sender"),
                "workspace": event.get("workspace"),
                "workspace_id": event.get("workspace_id"),
            })
        )
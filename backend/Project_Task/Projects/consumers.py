from channels.generic.websocket import AsyncWebsocketConsumer
import json


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.group_name = "chat_room"

        print("Joining group...")

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()
        print("✅ Connected")

    async def disconnect(self, close_code):
        print("Disconnect Code:", close_code)

        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

        print("❌ Disconnected")

    async def receive(self, text_data):
        print("Received:", text_data)

        try:
            data = json.loads(text_data)

            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "chat_message",
                    "message": data["message"],
                }
            )

            print("Broadcast Sent")

        except Exception as e:
            print("ERROR:", e)

    async def chat_message(self, event):
        print("Broadcast Received")

        await self.send(
            text_data=json.dumps({
                "message": event["message"]
            })
        )
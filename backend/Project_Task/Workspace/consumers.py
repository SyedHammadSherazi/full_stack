import json

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Note

class NoteConsumer(AsyncWebsocketConsumer):
    @database_sync_to_async
    def save_note(self, content):
        note = Note.objects.get(id=self.note_id)
        note.content = content
        note.save()
    async def connect(self):
        self.note_id = self.scope["url_route"]["kwargs"]["note_id"]
        self.room_group_name = f"note_{self.note_id}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)

        content = data["content"]

     # Database mein save
        await self.save_note(content)

        # Sab users ko broadcast
        await self.channel_layer.group_send(
        self.room_group_name,
        {
            "type": "note_update",
            "content": content,
        }
    )

    async def note_update(self, event):
        await self.send(text_data=json.dumps({
            "content": event["content"]
        }))
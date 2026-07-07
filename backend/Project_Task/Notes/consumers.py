import json

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Note, NoteVersion


class NoteConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.note_id = self.scope["url_route"]["kwargs"]["note_id"]
        self.room_group_name = f"note_{self.note_id}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        print(f"✅ Connected to Note {self.note_id}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        print("❌ Disconnected")

    @database_sync_to_async
    def save_note(self, content):
        try:
            note = Note.objects.get(id=self.note_id)

            # Save previous version before updating
            if note.content != content and note.content.strip():
                NoteVersion.objects.create(
                    note=note,
                    content=note.content
                )

            # Update latest note
            note.content = content
            note.save()

            print("✅ Note Saved:", note.id)

        except Note.DoesNotExist:
            print(f"❌ Note with id={self.note_id} does not exist")

    async def receive(self, text_data):
        print("📩 Received:", text_data)

        data = json.loads(text_data)
        content = data.get("content", "")

        # Save latest note + version history
        await self.save_note(content)

        # Broadcast to all connected users
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "note_update",
                "content": content,
            }
        )

    async def note_update(self, event):
        await self.send(
            text_data=json.dumps({
                "content": event["content"]
            })
        )
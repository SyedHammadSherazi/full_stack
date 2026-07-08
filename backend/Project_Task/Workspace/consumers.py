import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.shortcuts import get_object_or_404

from .models import Workspace
from .services import (
    mark_user_online,
    mark_user_offline,
    update_heartbeat,
    is_workspace_member,
)


class PresenceConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.workspace_id = self.scope["url_route"]["kwargs"]["workspace_id"]
        self.room_group_name = f"workspace_{self.workspace_id}"
        self.user = self.scope["user"]

        # User must be logged in
        if not self.user.is_authenticated:
            await self.close()
            return

        workspace = await self.get_workspace()

        # Only workspace members are allowed
        is_member = await database_sync_to_async(
            is_workspace_member
        )(workspace, self.user)

        if not is_member:
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )

        await self.accept()

        await database_sync_to_async(
            mark_user_online
        )(workspace, self.user)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "presence_update",
                "user": self.user.username,
                "status": "online",
            },
        )

    async def disconnect(self, close_code):

        if self.user.is_authenticated:

            workspace = await self.get_workspace()

            await database_sync_to_async(
                mark_user_offline
            )(workspace, self.user)

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "presence_update",
                    "user": self.user.username,
                    "status": "offline",
                },
            )

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )

    async def receive(self, text_data):

        data = json.loads(text_data)

        message_type = data.get("type")

        # Heartbeat
        if message_type == "heartbeat":

            workspace = await self.get_workspace()

            await database_sync_to_async(
                update_heartbeat
            )(workspace, self.user)

    async def presence_update(self, event):

        await self.send(
            text_data=json.dumps(
                {
                    "type": "presence",
                    "user": event["user"],
                    "status": event["status"],
                }
            )
        )

    @database_sync_to_async
    def get_workspace(self):
        return get_object_or_404(
            Workspace,
            id=self.workspace_id,
        )
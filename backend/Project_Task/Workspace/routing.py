from django.urls import re_path
from .consumers import NoteConsumer

websocket_urlpatterns = [
    re_path(
        r"ws/notes/(?P<note_id>\d+)/$",
        NoteConsumer.as_asgi(),
    ),
]
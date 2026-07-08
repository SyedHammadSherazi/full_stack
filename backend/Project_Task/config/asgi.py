import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from django.core.asgi import get_asgi_application

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter

from Chat.routing import websocket_urlpatterns as chat_websocket_urlpatterns
from Projects.routing import websocket_urlpatterns as project_websocket_urlpatterns
from Notes.routing import websocket_urlpatterns as notes_websocket_urlpatterns
from Workspace.routing import websocket_urlpatterns as workspace_websocket_urlpatterns

from accounts.websocket_auth import JwtAuthMiddlewareStack

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({

    "http": django_asgi_app,

    "websocket": JwtAuthMiddlewareStack(

        URLRouter(

            chat_websocket_urlpatterns
            + project_websocket_urlpatterns
            + notes_websocket_urlpatterns
            + workspace_websocket_urlpatterns

        )

    ),

})
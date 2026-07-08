from urllib.parse import parse_qs

from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async

from django.contrib.auth.models import AnonymousUser, User

from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError


@database_sync_to_async
def get_user_from_token(token):
    """
    Return authenticated user from JWT token.
    """

    try:
        access_token = AccessToken(token)

        user_id = access_token["user_id"]

        return User.objects.get(id=user_id)

    except (TokenError, User.DoesNotExist, KeyError):

        return AnonymousUser()


class JwtAuthMiddleware:

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):

        query_string = parse_qs(
            scope["query_string"].decode()
        )

        token = query_string.get("token")

        if token:

            scope["user"] = await get_user_from_token(
                token[0]
            )

        else:

            scope["user"] = AnonymousUser()

        return await self.inner(
            scope,
            receive,
            send,
        )


def JwtAuthMiddlewareStack(inner):
    """
    JWT Middleware + Default Django Auth Middleware
    """

    return JwtAuthMiddleware(
        AuthMiddlewareStack(inner)
    )
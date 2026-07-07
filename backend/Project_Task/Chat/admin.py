from django.contrib import admin
from .models import Message


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("sender", "room", "content", "timestamp")
    search_fields = ("sender", "room")
    list_filter = ("room",)
from django.contrib import admin
from .models import Workspace, Note, NoteVersion


@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "created_at")



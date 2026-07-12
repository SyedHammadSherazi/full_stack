from django.contrib import admin
from .models import WorkspaceFile


@admin.register(WorkspaceFile)
class WorkspaceFileAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "original_name",
        "workspace",
        "uploaded_by",
        "uploaded_at",
    ]
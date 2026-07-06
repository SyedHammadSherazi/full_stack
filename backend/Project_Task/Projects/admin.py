from django.contrib import admin
from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "status",
        "created_at",
    )

    search_fields = (
        "title",
        "status",
    )

    list_filter = (
        "status",
        "created_at",
    )

    ordering = (
        "-created_at",
    )
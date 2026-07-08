from django.contrib import admin
from .models import Workspace, Membership, Presence


class MembershipInline(admin.TabularInline):
    model = Membership
    extra = 1


@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "created_at")
    search_fields = ("name",)
    inlines = [MembershipInline]


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "workspace", "role", "joined_at")
    list_filter = ("role",)
    search_fields = ("user__username", "workspace__name")


@admin.register(Presence)
class PresenceAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "workspace",
        "status",
        "connected_at",
        "last_seen",
    )
    list_filter = (
        "status",
        "workspace",
    )
    search_fields = (
        "user__username",
        "workspace__name",
    )
    ordering = ("-last_seen",)
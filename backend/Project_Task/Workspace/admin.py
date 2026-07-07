from django.contrib import admin
from .models import Workspace, Membership


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
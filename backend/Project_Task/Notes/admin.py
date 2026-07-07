from django.contrib import admin

# Register your models here.
@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "workspace", "updated_at")
    search_fields = ("title",)


@admin.register(NoteVersion)
class NoteVersionAdmin(admin.ModelAdmin):
    list_display = ("id", "note", "created_at")
from django.urls import path
from . import views

urlpatterns = [
    path("notes/<int:note_id>/", views.update_note, name="update_note"),
]
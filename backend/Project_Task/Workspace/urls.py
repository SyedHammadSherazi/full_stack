from django.urls import path
from .views import NoteDetailView

urlpatterns = [
    path("notes/<int:pk>/", NoteDetailView.as_view(), name="note-detail"),
]
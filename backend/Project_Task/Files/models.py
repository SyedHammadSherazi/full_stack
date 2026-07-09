from django.db import models
from django.contrib.auth.models import User
from Workspace.models import Workspace


class WorkspaceFile(models.Model):

    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name="files",
    )

    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="uploaded_files",
    )

    file = models.FileField(
        upload_to="workspace_files/"
    )

    original_name = models.CharField(
        max_length=255,
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"{self.original_name} ({self.workspace.name})"
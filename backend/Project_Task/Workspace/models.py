# workspace/models.py
from django.db import models
from django.contrib.auth.models import User


class Workspace(models.Model):
    name = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Membership(models.Model):
    ROLE_CHOICES = [
        ("editor", "Editor"),
        ("viewer", "Viewer"),
    ]
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name="memberships"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="memberships"
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="editor")
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("workspace", "user")   # ek user ek workspace mein ek hi baar

    def __str__(self):
        return f"{self.user.username} in {self.workspace.name} ({self.role})"
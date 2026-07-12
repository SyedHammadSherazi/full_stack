from django.db import models

class Message(models.Model):

    MESSAGE_TYPES = (
        ("text", "Text"),
        ("file", "File"),
    )

    sender = models.CharField(max_length=100)

    room = models.CharField(max_length=100)

    message_type = models.CharField(
        max_length=10,
        choices=MESSAGE_TYPES,
        default="text",
    )

    content = models.TextField(
        blank=True,
        null=True,
    )

    file_name = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    file_url = models.URLField(
        blank=True,
        null=True,
    )

    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["timestamp"]

    def __str__(self):
        if self.message_type == "file":
            return f"{self.sender}: {self.file_name}"

        return f"{self.sender}: {self.content}"
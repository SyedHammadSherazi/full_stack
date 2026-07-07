from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
import json
from .models import Note, NoteVersion


@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
def update_note(request, note_id):
    note = get_object_or_404(Note, id=note_id)

    # Sirf workspace member edit kar sakta hai
    if request.user.is_authenticated and \
       not note.workspace.members.filter(id=request.user.id).exists() and \
       note.workspace.owner_id != request.user.id:
        return JsonResponse(
            {"error": "Aap is workspace ke member nahi hain"},
            status=403
        )

    data = json.loads(request.body)

    new_title = data.get("title", note.title)
    new_content = data.get("content", note.content)

    # Agar content change hua hai to purana version save karo
    if new_content != note.content:
        NoteVersion.objects.create(
            note=note,
            content=note.content
        )

    # Ab latest content save karo
    note.title = new_title
    note.content = new_content
    note.save()

    return JsonResponse({
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "updated_at": note.updated_at.isoformat(),
    })
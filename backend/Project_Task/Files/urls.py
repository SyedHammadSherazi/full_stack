from django.urls import path
from . import views


urlpatterns = [

    path(
        "workspace/<int:workspace_id>/upload-file/",
        views.upload_file,
        name="upload_file"
    ),

]
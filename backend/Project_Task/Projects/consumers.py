from channels.generic.websocket import WebsocketConsumer
import json


class EchoConsumer(WebsocketConsumer):

    def connect(self):
        self.accept()

    def disconnect(self, close_code):
        pass

    def receive(self, text_data):

        data = json.loads(text_data)

        message = data["message"]

        self.send(
            text_data=json.dumps({
                "message": message
            })
        )
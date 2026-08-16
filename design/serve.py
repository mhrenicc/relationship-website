from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

class NoCache(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def send_response(self, *a, **k):          # drop Last-Modified/ETag revalidation
        super().send_response(*a, **k)

    def log_message(self, *a):
        pass

ThreadingHTTPServer(("127.0.0.1", 8899), NoCache).serve_forever()

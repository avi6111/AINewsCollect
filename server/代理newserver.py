# tropy_proxy.py
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib import request
from urllib.parse import urlparse, unquote
import json

TROPY_BASE = "http://127.0.0.1:2019"
PROXY_PORT = 3080

class ProxyHandler(BaseHTTPRequestHandler):
    # CORS 头
    def _set_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()

    def do_GET(self):
        path = self.path
        # ========== 新增 newapi 接口区域 ==========
        # 1. /newapi/photos/{photoId} 获取图片元信息，包含本地path
        if path.startswith("/newapi/photos/") and not path.endswith("/raw"):
            parts = path.strip("/").split("/")
            if len(parts) == 3:
                photo_id = parts[2]
                target_url = f"{TROPY_BASE}/project/photos/{photo_id}"
                try:
                    req = request.Request(target_url, method="GET")
                    with request.urlopen(req) as resp:
                        raw_data = resp.read()
                        self.send_response(200)
                        self._set_cors_headers()
                        self.send_header("Content-Type", "application/json")
                        self.end_headers()
                        self.wfile.write(raw_data)
                except Exception as e:
                    self.send_response(500)
                    self._set_cors_headers()
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error":str(e)}).encode("utf-8"))
                return

        # 2. /newapi/photos/{photoId}/raw 获取图片二进制流，给img预览
        if path.startswith("/newapi/photos/") and path.endswith("/raw"):
            parts = path.strip("/").split("/")
            if len(parts) ==4:
                photo_id = parts[2]
                target_url = f"{TROPY_BASE}/project/photos/{photo_id}/raw"
                try:
                    req = request.Request(target_url, method="GET")
                    with request.urlopen(req) as resp:
                        self.send_response(resp.status)
                        for k, v in resp.headers.items():
                            if k.lower() not in ["transfer-encoding"]:
                                self.send_header(k, v)
                        self._set_cors_headers()
                        self.end_headers()
                        self.wfile.write(resp.read())
                except Exception as e:
                    self.send_response(500)
                    self._set_cors_headers()
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error":str(e)}).encode("utf-8"))
                return

        # ========== 原有旧接口保持不变 /api/tropy ==========
        if path.startswith("/api/tropy"):
            self.old_proxy_get("GET")
            return

        self.send_response(404)
        self._set_cors_headers()
        self.end_headers()

    def old_proxy_get(self, method):
        try:
            parsed = urlparse(self.path)
            path = parsed.path
            target_path = path.replace("/api/tropy", "", 1)
            target_url = TROPY_BASE + target_path
            req = request.Request(target_url, method=method)
            with request.urlopen(req) as resp:
                self.send_response(resp.status)
                for k, v in resp.headers.items():
                    if k.lower() not in ["transfer-encoding"]:
                        self.send_header(k, v)
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(resp.read())
        except Exception as e:
            self.send_response(500)
            self._set_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error":str(e)}).encode("utf-8"))

    def do_POST(self):
        path = self.path
        # 原有POST接口（选中item）
        if path.startswith("/api/tropy"):
            try:
                parsed = urlparse(self.path)
                p = parsed.path
                target_path = p.replace("/api/tropy", "",1)
                target_url = TROPY_BASE + target_path
                req = request.Request(target_url, method="POST")
                with request.urlopen(req) as resp:
                    self.send_response(resp.status)
                    self._set_cors_headers()
                    self.end_headers()
                    self.wfile.write(resp.read())
            except Exception as e:
                self.send_response(500)
                self._set_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error":str(e)}).encode("utf-8"))
            return
        self.send_response(404)
        self._set_cors_headers()
        self.end_headers()


if __name__ == "__main__":
    server = HTTPServer(("127.0.0.1", PROXY_PORT), ProxyHandler)
    print(f"Python代理启动在 http://127.0.0.1:{PROXY_PORT}")
    print("Tropy后端：", TROPY_BASE)
    print("✅新接口：")
    print("GET /newapi/photos/{id}        获取图片元信息(含本地path)")
    print("GET /newapi/photos/{id}/raw    获取图片流，直接用于img标签")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()

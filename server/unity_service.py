# unity_service.py
import os
import sys
import subprocess


def open_unity_project_by_api(project_path: str) -> dict:
    project_path = os.path.abspath(project_path)

    if not os.path.isdir(project_path):
        raise FileNotFoundError(f"目录不存在: {project_path}")

    opener = os.path.join(os.path.dirname(__file__), "scripts", "unity_opener_main.py")

    if not os.path.isfile(opener):
        raise FileNotFoundError("找不到 unity_opener_main.py")

    cmd = [
        sys.executable,
        opener,
        project_path,
    ]

    try:
        subprocess.Popen(cmd)
    except Exception as e:
        raise RuntimeError(f"启动 Unity 失败: {e}")

    return {
        "ok": True,
        "project_path": project_path,
    }
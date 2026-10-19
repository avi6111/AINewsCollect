# unity_opener_main.py
import os
import sys
import platform
import subprocess
import shutil


def find_unity_executable() -> str:
    system = platform.system()

    if system == "Windows":
        # 常见 Unity Hub 安装路径，可按自己版本修改
        candidates = [
            r"F:\Program Files\Unity 6000.2.5f1\Editor\Unity.exe",
            r"F:\Program Files (x86)\2022.3.50f1c1\Unity\Editor\Unity.exe",
        ]
        for path in candidates:
            if os.path.isfile(path):
                return path
        raise FileNotFoundError("未找到 Unity.exe，请修改 find_unity_executable 中的路径")

    if system == "Darwin":
        # macOS Unity.app
        candidates = [
            "/Applications/Unity/Hub/Editor/6000.0.25f1/Unity.app/Contents/MacOS/Unity",
            "/Applications/Unity/Unity.app/Contents/MacOS/Unity",
        ]
        for path in candidates:
            if os.path.isfile(path):
                return path
        raise FileNotFoundError("未找到 Unity 可执行文件，请修改 macOS 路径")

    raise RuntimeError(f"暂不支持当前系统: {system}")


def open_unity_project(project_path: str, batch_mode: bool = False, quit_after: bool = False):
    project_path = os.path.abspath(project_path)

    if not os.path.isdir(project_path):
        raise FileNotFoundError(f"项目目录不存在: {project_path}")

    unity_exe = find_unity_executable()

    args = [unity_exe, "-projectPath", project_path]

    if batch_mode:
        args.append("-batchmode")
    if quit_after:
        args.append("-quit")

    print(f"启动 Unity: {unity_exe}")
    print(f"项目路径: {project_path}")
    print(f"命令参数: {args}")

    subprocess.Popen(args)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python unity_opener.py <Unity项目目录>")
        sys.exit(1)

    target = sys.argv[1]
    open_unity_project(target)
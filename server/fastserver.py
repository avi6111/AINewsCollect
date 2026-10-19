import os
import csv
import uuid
import shutil
from fastapi import FastAPI, Request, UploadFile, File, HTTPException, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from unity_service import open_unity_project_by_api
import colorama
colorama.init()
# 初始化 FastAPI 应用
app = FastAPI(title="Image API Service")

# --- 1. 配置 CORS (跨域资源共享) ---
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 配置变量 ---
IMAGE_STORAGE_PATH = r"F:\PhotoDB\FastServerPublic"
os.makedirs(IMAGE_STORAGE_PATH, exist_ok=True)

# CSV 数据存储目录
DATA_STORAGE_PATH = os.path.join(IMAGE_STORAGE_PATH, "data")
os.makedirs(DATA_STORAGE_PATH, exist_ok=True)


# --- 2. 获取图片 API ---
@app.get("/newapi/photos/{photo_path:path}")
def get_photo(photo_path: str):
    file_path = os.path.join(IMAGE_STORAGE_PATH, photo_path)

    real_base = os.path.realpath(IMAGE_STORAGE_PATH)
    real_file = os.path.realpath(file_path)
    if not real_file.startswith(real_base + os.sep) and real_file != real_base:
        raise HTTPException(status_code=403, detail="Access denied")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")

    return FileResponse(file_path)


# --- 3. 创建/上传图片 API ---
@app.post("/newapi/photos/create/")
async def create_photo(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    filename = file.filename
    if not filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    save_path = os.path.join(IMAGE_STORAGE_PATH, filename)

    try:
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")
    finally:
        await file.close()

    return {
        "message": "Image uploaded successfully",
        "filename": filename,
        "url": f"/newapi/photos/{filename}",
    }


# --- 4. 根据 ProjectName 生成 UUID 并返回 ---
@app.post("/newapi/data/project/")
def create_project(project_name: str = Form(...)):
    """
    根据项目名称生成 UUID，并把映射关系保存到 CSV 文件。
    前端传参：FormData，字段名 project_name
    """
    if not project_name or not project_name.strip():
        raise HTTPException(status_code=400, detail="project_name is required")
    print(f"Creating project with name: {project_name}")
    project_name = project_name.strip()
    namespace = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")  # NAMESPACE_URL
    project_uuid = str(uuid.uuid5(namespace, project_name))
    #project_uuid = str(uuid.uuid4())



    csv_path = os.path.join(DATA_STORAGE_PATH, "projects.csv")
    file_exists = os.path.exists(csv_path)

    try:
        with open(csv_path, "a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            if not file_exists:
                writer.writerow(["project_name", "uuid"])
            writer.writerow([project_name, project_uuid])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save project: {str(e)}")

    return {
        "project_name": project_name,
        "uuid": project_uuid,
    }


# --- 5. Read_csv：根据 UUID 读取项目 CSV 数据 ---
@app.post("/newapi/data/project/read/")
def read_project_csv(uuid: str = Form(...)):
    """
    根据 UUID 读取项目 CSV 数据。
    CSV 格式：
      第1行：banner（固定行，第2列为 bannerImgPath 的值，如 /newapi/photos/xxx.png）
      第2行：header（列名行）
      第3行起：数据行，字段与 header 对齐
    """
    if not uuid or not uuid.strip():
        raise HTTPException(status_code=400, detail="uuid is required")

    uuid = uuid.strip()

    # 1. 读取 CSV 文件
    data_file = os.path.join(DATA_STORAGE_PATH, f"{uuid}.csv")
    if not os.path.exists(data_file):
        raise HTTPException(status_code=404, detail=f"Project data file not found ：{data_file}")

    try:
        with open(data_file, "r", newline="", encoding="utf-8") as f:
            reader = csv.reader(f)
            all_rows = list(reader)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read CSV: {str(e)}")

    if len(all_rows) < 2:
        raise HTTPException(status_code=400, detail="CSV format error: missing banner or header row")

    # 2. 解析 banner 行（第1行）
    banner_row = all_rows[0]
    banner_img_path = banner_row[1].strip() if len(banner_row) > 1 else ""

    # 3. 解析 header 行（第2行），作为字段名
    headers = [h.strip() for h in all_rows[1]]

    # 4. 解析数据行（第3行起），与 header 对齐
    data_rows = []
    for row in all_rows[2:]:
        # 跳过空行
        if not any(cell.strip() for cell in row):
            continue
        row_dict = {}
        for i, header in enumerate(headers):
            row_dict[header] = row[i].strip() if i < len(row) else ""
        data_rows.append(row_dict)

    return {
        "uuid": uuid,
        "banner":  banner_img_path,
        "headers": headers,
        "data": data_rows,
    }
#127.0.0.1:8000/newapi/tools/open_unity/F:\360Downloads\2027Unity\HighJumpMusicUnity
@app.get("/newapi/tools/open_unity/{project_path:path}")# :path 是 FastAPI 路径转换器-特殊标记，允许捕获包含斜杠的完整路径
def tools_open_unity(project_path:str):
    print(project_path)
    return open_unity_project_by_api(project_path)

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "ok": False,
            "code": exc.status_code,
            "message": exc.detail,
        },
    )
@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "ok": False,
            "code": 500,
            "message": f"服务器内部错误: {str(exc)}",#会直接输出错误
        },
    )
# --- 启动入口 ---
if __name__ == "__main__":
    
    import uvicorn
    uvicorn.run("fastserver:app", host="0.0.0.0", port=8000, reload=True
                #,use_colors=False
                )
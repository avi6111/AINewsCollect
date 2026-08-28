function scanBadChildren(root) {
  const stack = [root];
  console.log('扫描脏子项...',stack.length);
  while(stack.length > 0){
    const obj = stack.pop();
    if(!Array.isArray(obj.children)) continue;
    for(let i=0;i<obj.children.length;i++){
      const child = obj.children[i];
      console.log(child);
      if(child == null){
        console.error(`⚠️发现脏子项！父节点:${obj.name}, children[${i}] =`, child);
        // 直接删除脏项
        obj.children.splice(i,1);
        i--;
      }else{
        stack.push(child);
      }
    }
  }
}
/**
 * 深度修复给定obj及其全部后代（只向下，不向上找父）
 * 处理自己.children内部所有节点，包含嵌套子树
 */
function deepFixNodeTree(rootNode) {
  const stack = [rootNode];
  while(stack.length) {
    const obj = stack.pop();
    if(obj == null) continue;

    // 强制覆盖pivot，不管原来是什么
    obj.pivot = new THREE.Vector3(0, 0, 0);

    // 清扫当前对象children里的null/undefined
    if(Array.isArray(obj.children)) {
      for(let i = obj.children.length - 1; i >= 0; i--) {
        const c = obj.children[i];
        if(c == null || c === undefined) {
          console.warn(`deepFixNodeTree: 删除children null子项 ${obj.name}[${i}]`);
          obj.children.splice(i, 1);
        } else {
          stack.push(c);
        }
      }
    }
  }
}

export async function exportCurrentModelGLB(target, downloadFn) {
  if (!target) return;

  //const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
  const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');
  const exporter = new GLTFExporter();
  
  target.traverse(async obj=>{
    if(obj.isMesh){
      console.log('测试导出单个mesh：', obj.name);
      // try{
      //   await exportSingleMesh(obj);//不存在de 的方法，未测试通过
      //   console.log(obj.name, '✅ ok');
      // }catch(e){
      //   console.error(obj.name, '❌ crash', e.stack);
      // }
      // 修复新版GLTFExporter _processNodeWithPivotAsync 读取 pivot.x 崩溃
      if (!obj.pivot) {
        obj.pivot = new THREE.Vector3(0, 0, 0);
      }
      console.log(obj.pivot); // null ✅ 原生实例
      console.log(target);
    }else{
      console.log("target x");
      obj.pivot = new THREE.Vector3(0, 0, 0);
    }
  })

  //scanBadChildren(target);
  deepFixNodeTree(target) ;

  return new Promise((resolve, reject) => {
    exporter.parse(
      target,
      (result) => {
        const blob = new Blob([result], { type: 'model/gltf-binary' });
        downloadFn(blob, 'model_uv_modified.glb');
        console.log('导出完成: model_uv_modified.glb');
        resolve(blob);
      },
      (error) => {
        console.error('导出失败:', error);//已经会 打印错误堆栈
        reject(error);
      },
      {
        binary: true,
        //trs: false,//❗ `trs: false` 务必保证物体矩阵已经 updateMatrixWorld。
        trs: true,
        onlyVisible: true,
        maxTextureSize: 4096
      }
    );
  });
}

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
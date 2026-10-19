import Papa from 'papaparse'
function extractBaseName(fullPath) {
  if (!fullPath) return ''
  return fullPath.replace(/.*[\\/]/, '')
}
function extractDirAndName(fullPath) {
  if (!fullPath) {
    return { parentDir: '', baseName: '' };
  }
  // 先把反斜杠统一换成 /，方便正则处理
  const path = fullPath.replace(/\\/g, '/');
  // 移除末尾的斜杠（防止目录路径干扰）
  const cleanPath = path.replace(/\/+$/, '');

  // 提取 baseName（原名逻辑）
  const baseName = cleanPath.replace(/.*\//, '');

  // 提取父目录
  let parentDir = '';
  const lastSlashIndex = cleanPath.lastIndexOf('/');
  if (lastSlashIndex > -1) {
    const parentPath = cleanPath.slice(0, lastSlashIndex);
    parentDir = parentPath.replace(/.*\//, '');
  }

  return { parentDir, pureName:baseName };
}
/**
 * 解析CSV文件，生成project数据
 * @param {File} file - input选中的csv文件
 * @param {Array} existList - 当前已存在的projectList，用来获取最大id
 * @returns {Promise<Array>} 解析成功返回新增项目数组
 */
export function parseProjectCsv(file, existList) {
  console.log('=== parseProjectCsv 入参 existList ===', existList)
  console.log('typeof existList', typeof existList)
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('文件为空'))

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const rows = result.data
        // 获取当前最大ID
        let maxId = existList.reduce((m, item) => Math.max(m, item.id), 0)
        console.log('parse maxId=',maxId," rows=",rows)
        const addList = []
        const typeMap = {
          '城堡': 'castle',
          '寺': 'temple',
          '商店': 'squareBox',
          '商业街': 'shopRow'
        }

        for (const row of rows) {
          const name = row.name?.trim()
          const addT = row.addT?.trim()
          if (!name || !addT) continue
          //提取【文件夹】名字
          let {parentDir,pureName} = extractDirAndName(name)
          if(pureName=='trunk' || pureName.length<6)
            pureName = parentDir+"_"+pureName
          

          // 解析 addT 日期 "2025/12/5 18:04"
          // 解析 addT "2025/12/5 18:04"
          const datePart = addT.split(' ')[0]
          const [yearStr, monthStr, dayStr] = datePart.split('/')
          const year = Number(yearStr)
          const month = Number(monthStr)
          const day = Number(dayStr)

          if (isNaN(year) || isNaN(month) || isNaN(day)) continue

          const ymNum = year * 100 + month
          const gridRow = ymNum - 202601
          const gridCol = day

          // 自动匹配buildingType 【建筑类型】
          //let buildingType = 'default'
          let buildingType = 'squareBox'
          for (const keyword in typeMap) {
            if (name.includes(keyword)) { //&*……%！*& *……&* 这个匹配 【建筑类型】暂时无用
              buildingType = typeMap[keyword]
              break
            }
          }

          maxId += 1
          addList.push({
            id: maxId,
            name:pureName,
            gridRow:gridRow,
            gridCol:gridCol,
            buildingType:buildingType,
            desc: `从CSV导入项目：${name}`,
            fullName:name
          })
        }
        resolve(addList)
      },
      error: (err) => {
        reject(err)
      }
    })
  })
}

/**
 * 文件input change事件处理器
 * @param {Event} e input change事件
 * @param {Array} existList 当前项目列表
 * @param {Function} onAppend 成功回调：(newItems)=>{}
 */
export async function handleCsvUpload(e, projectListValue, onAppend) {
  const file = e.target.files[0]
  if (!file || typeof onAppend !== 'function') return
  try {
    // //const existList = projectListValue.value//不是ref，直接就是value(计算<template>里传ref,应该自动转换了)
    // console.log('handle',projectListValue)
    // console.log('是不是ref？', '__v_isRef' in projectListValue)//如果 `__v_isReactive === true` → 这是 reactive 代理，不能读 `.value`，直接用它本身：`existList = projectListRef`
    // console.log('是不是proxy？', '__v_isReactive' in projectListRef)//`__v_isRef === true` → 才需要 `.value`
    // console.log('handle',typeof(projectListValue))
    const newItems = await parseProjectCsv(file, projectListValue)
    onAppend(newItems)
  } catch (err) {
    console.error('CSV解析失败', err)
  }
}

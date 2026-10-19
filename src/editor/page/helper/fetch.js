/*
import { selectTropyItem } from './fetch.js'

// 按钮点击事件
const handleOpenTropyItem = async (id) => {
  try {
    const result = await selectTropyItem(id)
    if(result.ok){
      console.log('✅ Tropy已选中条目', id)
    }
  } catch (e) {
    alert(e.message)
  }
}
  */
const BASE_PROXY_URL = 'http://127.0.0.1:2019/api/tropy'
const BASE_PROJECT ='http://127.0.0.1:2019/project'
const BASE_PROXY ='http://localhost:5173/tropy-api/project'
export async function getProxyPhoto(Id){
  //如果配置(vite.config)正确，
  // 浏览器请求 http://localhost:5173/tropy-api/project/photos/2 时，
  // Vite 开发服务器会将其转发到 http://127.0.0.1:2019/project/photos/2。由于对浏览器而言请求是同源的，CORS 限制就不会触发。
  const url = `${BASE_PROXY}/photos/${Id}`  
  const res = await fetch(url, {
    method:'GET'
  })
  const data = await res.json()
  return data
}
export async function getPhoto(Id)
{
  const url = `${BASE_PROJECT}/photos/${Id}`  
  const res = await fetch(url, {
    method:'GET'
  })
  const data = await res.json()
  return data   
}
export async function selectPhoto(Id){
  const url = `${BASE_PROJECT}/${Id}`  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
  })
  const data = await res.json()
  return data
}
/**
 * 在Tropy选中指定条目
 * @param {number|string} itemId - tropy条目id
 * @returns {Promise<{ok:boolean,status:number}>}
 */
export async function selectTropyItem(itemId) {
  const url = `${BASE_PROXY_URL}/select-item/${itemId}`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await res.json()
    return data
  } catch (err) {
    console.error('Tropy选中请求失败：', err)
    throw new Error('连接代理服务失败，请确认代理和Tropy已启动')
  }
}

/**
 * 获取当前项目全部条目列表
 * @returns {Promise<Array>} item数组
 */
export async function getTropyItemList() {
  const url = `${BASE_PROXY_URL}/project/items`
  try {
    const res = await fetch(url, {
      method: 'GET'
    })
    const data = await res.json()
    return data
  } catch (err) {
    console.error('获取条目列表失败：', err)
    throw new Error('连接代理服务失败，请确认代理和Tropy已启动')
  }
}

export async function uuid(project_spec_name){
    const res = await fetch('/newapi/data/project/', {
    method: 'POST',
    body: (() => { const fd = new FormData(); fd.append('project_name', project_spec_name); return fd; })()
  })
  const data = await res.json();
  return data.uuid;
}
//属性如下：：
//projectName
//uuid
//banner
//rows
export async function dataProject(uuid){
  const res = await fetch('/newapi/data/project/read/',{
    method:'POST',
    body: (() => { const fd = new FormData(); fd.append('uuid', uuid); return fd; })()
  })
  return await res.json();
}

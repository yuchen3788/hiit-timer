import cloudbase from '@cloudbase/js-sdk'

let app: any = null
let uid: string = ''

// Initialize CloudBase
export function initCloudBase() {
  if (app) return app

  const envId = import.meta.env.VITE_CLOUDBASE_ENV_ID
  const region = import.meta.env.VITE_CLOUDBASE_REGION
  const accessKey = import.meta.env.VITE_CLOUDBASE_ACCESS_KEY

  if (!envId || !region) {
    throw new Error('Missing CloudBase environment configuration')
  }

  // accessKey 为新版 v3 auth API 的 publishable key
  // 无 accessKey 时使用旧版 v2 auth（兼容模式）
  app = cloudbase.init({
    env: envId,
    region,
    ...(accessKey ? { accessKey, auth: { detectSessionInUrl: true } } : {}),
  })

  return app
}

// Get CloudBase instance
export function getCloudBase() {
  if (!app) {
    app = initCloudBase()
  }
  return app
}

// Get database instance
export function getDB() {
  return getCloudBase().database()
}

// Anonymous login and get uid
// 新版 API（有 accessKey）：app.auth 为对象，signInAnonymously 返回 { data, error }
// 旧版 API（无 accessKey）：app.auth() 为函数调用，signInAnonymously 返回 ILoginState
export async function loginAnonymous(): Promise<string> {
  try {
    const cloudbaseApp = getCloudBase()
    const existingUid = localStorage.getItem('cloudbase_uid')
    const hasAccessKey = !!import.meta.env.VITE_CLOUDBASE_ACCESS_KEY

    try {
      // 判断是否使用新版 auth API
      const auth: any = hasAccessKey
        ? cloudbaseApp.auth
        : cloudbaseApp.auth({ persistence: 'local' })

      // 检查是否已登录（必须用 auth.uid，否则安全规则 doc.uid == auth.uid 会拒绝写入）
      const currentUser = auth.currentUser
      if (currentUser?.uid) {
        uid = currentUser.uid
        localStorage.setItem('cloudbase_uid', uid)
        return uid
      }

      // 执行匿名登录
      if (hasAccessKey) {
        const result = await auth.signInAnonymously()
        if (result?.error) throw result.error
      } else {
        await auth.signInAnonymously()
      }

      // 登录后必须用 auth.currentUser.uid，与安全规则 auth.uid 一致
      const loggedInUser = auth.currentUser
      if (loggedInUser?.uid) {
        uid = loggedInUser.uid
        localStorage.setItem('cloudbase_uid', uid)
        return uid
      }
    } catch (authErr) {
      console.warn('CloudBase 匿名登录失败，使用本地 uid：', authErr)
    }

    // 回退到本地 uid（此时无 CloudBase auth，写入会被安全规则拒绝，仅适合离线/降级）
    if (existingUid) {
      uid = existingUid
      return uid
    }
    uid = 'anon_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
    localStorage.setItem('cloudbase_uid', uid)
    return uid
  } catch (error) {
    console.error('Login failed:', error)
    throw error
  }
}

// Get current uid
export function getUid(): string {
  return uid
}

// Listen to collection changes
// whereConditions 用于过滤（如 { uid: 'xxx' }）
export function onSnapshot(
  collectionPath: string,
  callback: (docs: any[]) => void,
  onError?: (error: any) => void,
  whereConditions?: Record<string, any>,
) {
  const db = getDB()
  let ref: any = db.collection(collectionPath)
  if (whereConditions && Object.keys(whereConditions).length > 0) {
    ref = ref.where(whereConditions)
  }

  const watcher = ref.watch({
    onChange: (snapshot: any) => {
      // snapshot.docs 可能是数组或 Record<string, any>
      const rawDocs: any[] = Array.isArray(snapshot.docs)
        ? snapshot.docs
        : Object.values(snapshot.docs || {})

      const docs = rawDocs.map((doc: any) => ({
        // 优先取 _id（CloudBase 内部字段），其次取 id（应用存入字段）
        id: doc._id ?? doc.id,
        ...doc,
      }))
      callback(docs)
    },
    onError: (error: any) => {
      if (onError) {
        onError(error)
      } else {
        console.error('Watch error:', error)
      }
    },
  })

  return () => {
    watcher.close()
  }
}

// Get document by id（CloudBase get() 返回 { data: any[] }，单条时为 [doc]）
export async function getDoc(collectionPath: string, docId: string): Promise<any | null> {
  const db = getDB()
  const res = await db.collection(collectionPath).doc(docId).get()
  const data = res?.data
  const doc = Array.isArray(data) ? data[0] : data
  if (doc) {
    return {
      id: doc._id ?? docId,
      ...doc,
    }
  }
  return null
}

// Set document（upsert：不存在则创建，存在则覆盖）
export async function setDoc(collectionPath: string, docId: string, data: any): Promise<void> {
  const db = getDB()
  await db.collection(collectionPath).doc(docId).set(data)
}

// Add document
export async function addDoc(collectionPath: string, data: any): Promise<string> {
  const db = getDB()
  const res = await db.collection(collectionPath).add(data)
  return res.id
}

// Update document
export async function updateDoc(
  collectionPath: string,
  docId: string,
  data: Record<string, any>,
): Promise<void> {
  const db = getDB()
  await db.collection(collectionPath).doc(docId).update(data)
}

// Delete document
export async function deleteDoc(collectionPath: string, docId: string): Promise<void> {
  const db = getDB()
  await db.collection(collectionPath).doc(docId).remove()
}

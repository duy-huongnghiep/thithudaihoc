import { StudentInfo } from '../types';

const SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxv_LnzrD7mTAAoQYYgEZjdcW8cCNcVoEu1rPCEU2V-EGMaiRLtGRU3yv3sV3WPkeUZTA/exec';

const CACHE_KEY = 'td_mock_exam_students_cache';
const CACHE_TIME_KEY = 'td_mock_exam_students_time';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache TTL

let inMemoryStudents: StudentInfo[] | null = null;
let isFetchingPromise: Promise<StudentInfo[]> | null = null;

export function cleanDigits(val: string | number | undefined | null): string {
  return val ? String(val).replace(/\D/g, '') : '';
}

export function isYes(val: string | number | undefined | null): boolean {
  if (!val) return false;
  const v = String(val).toLowerCase().trim();
  return (
    v === 'có' ||
    v === 'co' ||
    v === 'x' ||
    v === '1' ||
    v === 'yes' ||
    v === 'true' ||
    v === 'đăng ký' ||
    v === 'dang ky'
  );
}

export function parseStudentInfo(row: unknown): StudentInfo {
  if (!row) {
    return {
      username: '',
      password: '',
      sbd: '',
      hoten: '',
      email: '',
      namsinh: '',
      hsa: '',
      vact: '',
      thptqg: '',
    };
  }

  // If array format: [taikhoan, pass, sobaodanh, hoten, email, namsinh, hsa, vact, thptqg]
  if (Array.isArray(row)) {
    return {
      username: String(row[0] || '').trim(),
      password: String(row[1] || '').trim(),
      sbd: String(row[2] || '').trim(),
      hoten: String(row[3] || '').trim(),
      email: String(row[4] || '').trim(),
      namsinh: String(row[5] || '').trim(),
      hsa: String(row[6] || '').trim(),
      vact: String(row[7] || '').trim(),
      thptqg: String(row[8] || '').trim(),
    };
  }

  // If object format
  const record = row as Record<string, unknown>;
  const getVal = (keywords: string[]): string => {
    for (const k of Object.keys(record)) {
      const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const kw of keywords) {
        if (cleanK.includes(kw)) {
          return String(record[k] ?? '').trim();
        }
      }
    }
    return '';
  };

  return {
    username: getVal(['taikhoan', 'username', 'user', 'tk']),
    password: getVal(['pass', 'password', 'matkhau', 'mk']),
    sbd: getVal(['sobaodanh', 'sbd']),
    hoten: getVal(['hoten', 'ten', 'name', 'hovaten']),
    email: getVal(['email', 'mail']),
    namsinh: getVal(['namsinh', 'birth', 'ns']),
    hsa: getVal(['hsa']),
    vact: getVal(['vact']),
    thptqg: getVal(['thptqg', 'thpt']),
  };
}

async function fetchFromNetwork(): Promise<StudentInfo[]> {
  // Strategy 1: Direct JSON fetch with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const rawData = await res.json();
    if (Array.isArray(rawData)) {
      return rawData.map(parseStudentInfo).filter((s) => s.username || s.hoten || s.sbd);
    }
  } catch {
    clearTimeout(timeoutId);
  }

  // Strategy 2: JSONP fallback for cross-origin / iframe sandbox compatibility
  return new Promise<StudentInfo[]>((resolve, reject) => {
    const callbackName = `jsonp_cb_${Date.now()}_${Math.round(Math.random() * 100000)}`;
    const script = document.createElement('script');
    let isResolved = false;

    // Timeout after 7 seconds
    const timeout = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        cleanup();
        reject(new Error('Yêu cầu dữ liệu quá thời gian chờ (Timeout). Vui lòng thử lại.'));
      }
    }, 7000);

    const cleanup = () => {
      if ((window as unknown as Record<string, unknown>)[callbackName]) {
        delete (window as unknown as Record<string, unknown>)[callbackName];
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };

    (window as unknown as Record<string, (data: unknown) => void>)[callbackName] = (data: unknown) => {
      if (isResolved) return;
      isResolved = true;
      clearTimeout(timeout);
      cleanup();
      if (Array.isArray(data)) {
        const parsed = data.map(parseStudentInfo).filter((s) => s.username || s.hoten || s.sbd);
        resolve(parsed);
      } else {
        resolve([]);
      }
    };

    script.onerror = () => {
      if (isResolved) return;
      isResolved = true;
      clearTimeout(timeout);
      cleanup();
      reject(new Error('Không thể kết nối máy chủ dữ liệu Google Sheets.'));
    };

    const separator = SCRIPT_URL.includes('?') ? '&' : '?';
    script.src = `${SCRIPT_URL}${separator}callback=${callbackName}`;
    document.body.appendChild(script);
  });
}

export async function getStudentsData(forceRefresh = false): Promise<StudentInfo[]> {
  // If in-memory is already valid and not forcing refresh
  if (inMemoryStudents && !forceRefresh) {
    return inMemoryStudents;
  }

  // Check localStorage cache
  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
      if (cached && cachedTime) {
        const age = Date.now() - parseInt(cachedTime, 10);
        if (age < CACHE_TTL_MS) {
          const parsed = JSON.parse(cached) as StudentInfo[];
          inMemoryStudents = parsed;
          // Trigger background update if cache older than 2 minutes
          if (age > 2 * 60 * 1000) {
            fetchFromNetwork()
              .then((fresh) => {
                if (fresh && fresh.length > 0) {
                  inMemoryStudents = fresh;
                  localStorage.setItem(CACHE_KEY, JSON.stringify(fresh));
                  localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
                }
              })
              .catch(() => {});
          }
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
  }

  // Avoid duplicate in-flight requests
  if (isFetchingPromise) {
    return isFetchingPromise;
  }

  isFetchingPromise = (async () => {
    try {
      const data = await fetchFromNetwork();
      inMemoryStudents = data;
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
      } catch {
        // ignore storage errors
      }
      return data;
    } catch (err) {
      // If network fails, try fallback to stale local cache if available
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as StudentInfo[];
          inMemoryStudents = parsed;
          return parsed;
        }
      } catch {
        // ignore
      }
      throw err;
    } finally {
      isFetchingPromise = null;
    }
  })();

  return isFetchingPromise;
}

export async function searchStudentByPhoneOrUser(query: string): Promise<StudentInfo | null> {
  const students = await getStudentsData();
  const trimmedQuery = query.trim();
  const queryDigits = cleanDigits(trimmedQuery);

  // Exact matching on username or SBD first
  const exactMatch = students.find((s) => {
    return (
      s.username.toLowerCase() === trimmedQuery.toLowerCase() ||
      s.sbd.toLowerCase() === trimmedQuery.toLowerCase() ||
      (s.email && s.email.toLowerCase() === trimmedQuery.toLowerCase())
    );
  });
  if (exactMatch) return exactMatch;

  // Search by phone digits
  if (queryDigits.length >= 4) {
    const digitMatch = students.find((s) => {
      const userDigits = cleanDigits(s.username);
      const sbdDigits = cleanDigits(s.sbd);
      return (
        (userDigits.length >= 4 && (userDigits.endsWith(queryDigits) || queryDigits.endsWith(userDigits))) ||
        (sbdDigits.length >= 4 && (sbdDigits.endsWith(queryDigits) || queryDigits.endsWith(sbdDigits)))
      );
    });
    if (digitMatch) return digitMatch;
  }

  return null;
}

export async function authenticateStudent(user: string, pass: string): Promise<StudentInfo | null> {
  const students = await getStudentsData();
  const trimmedUser = user.trim().toLowerCase();
  const trimmedPass = pass.trim();

  return (
    students.find((s) => {
      return (
        (s.username.toLowerCase() === trimmedUser || cleanDigits(s.username) === cleanDigits(trimmedUser)) &&
        s.password === trimmedPass
      );
    }) || null
  );
}

// Prefetch data silently on app initialization
export function prefetchData(): void {
  getStudentsData().catch(() => {});
}

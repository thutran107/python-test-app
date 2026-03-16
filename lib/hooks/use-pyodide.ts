'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<any>;
  }
}

let pyodideCache: any = null;
let pyodideLoadPromise: Promise<any> | null = null;

export function usePyodide() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const pyodideRef = useRef<any>(null);

  useEffect(() => {
    if (pyodideCache) {
      pyodideRef.current = pyodideCache;
      setStatus('ready');
      return;
    }
    setStatus('loading');
    if (!pyodideLoadPromise) {
      pyodideLoadPromise = new Promise<any>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
        script.onload = async () => {
          try {
            const pyodide = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/' });
            resolve(pyodide);
          } catch (e) { reject(e); }
        };
        script.onerror = () => reject(new Error('Failed to load Pyodide'));
        document.head.appendChild(script);
      });
    }
    pyodideLoadPromise
      .then((pyodide) => { pyodideCache = pyodide; pyodideRef.current = pyodide; setStatus('ready'); })
      .catch(() => { setStatus('error'); pyodideLoadPromise = null; });
  }, []);

  const runCode = useCallback(async (code: string) => {
    const pyodide = pyodideRef.current;
    if (!pyodide) return { stdout: '', stderr: '', error: 'Pyodide not ready.' };
    try {
      await pyodide.runPythonAsync(`import sys, io\n_out = io.StringIO()\n_err = io.StringIO()\nsys.stdout = _out\nsys.stderr = _err`);
      await pyodide.runPythonAsync(code);
      const stdout: string = await pyodide.runPythonAsync('_out.getvalue()');
      const stderr: string = await pyodide.runPythonAsync('_err.getvalue()');
      await pyodide.runPythonAsync('sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__');
      return { stdout: stdout.trim(), stderr: stderr.trim(), error: null };
    } catch (err: any) {
      try { await pyodide.runPythonAsync('sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__'); } catch {}
      return { stdout: '', stderr: '', error: String(err) };
    }
  }, []);

  return { status, runCode };
}

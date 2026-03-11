import type { FormConfiguration, FieldValue } from "@/types";
import { API_BASE_URL } from "@/constants/config";

// ── Types ────────────────────────────────────────────────────────────────

export interface FormSubmission {
  id?: string;
  formId: string;
  values: Record<string, FieldValue>;
  rawValues: Record<string, FieldValue>;
  submittedAt: string;
}

// ── Internals ────────────────────────────────────────────────────────────

const ENDPOINTS = {
  forms: `${API_BASE_URL}/forms`,
  form: (id: string) => `${API_BASE_URL}/forms/${id}`,
  submissions: `${API_BASE_URL}/submissions`,
  submissionsByForm: (id: string) =>
    `${API_BASE_URL}/submissions?formId=${id}`,
} as const;

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText} — ${url}`);
  }
  return res.json();
}

// ── Public API ───────────────────────────────────────────────────────────

export const formApi = {
  async list(): Promise<FormConfiguration[]> {
    return request<FormConfiguration[]>(ENDPOINTS.forms);
  },

  async getById(id: string): Promise<FormConfiguration | undefined> {
    const res = await fetch(ENDPOINTS.form(id));
    if (res.status === 404) return undefined;
    if (!res.ok) throw new Error(`API error: ${res.status} — ${ENDPOINTS.form(id)}`);
    return res.json();
  },

  /** Upsert: checks existence first, then PUT (update) or POST (create). */
  async save(config: FormConfiguration): Promise<FormConfiguration> {
    const existing = await formApi.getById(config.id);
    const saved: FormConfiguration = {
      ...config,
      updatedAt: new Date().toISOString(),
      ...(!existing && { createdAt: new Date().toISOString() }),
    };

    return request<FormConfiguration>(
      existing ? ENDPOINTS.form(config.id) : ENDPOINTS.forms,
      {
        method: existing ? "PUT" : "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(saved),
      },
    );
  },

  async remove(id: string): Promise<void> {
    await request<unknown>(ENDPOINTS.form(id), { method: "DELETE" });
  },

  async submitForm(
    formId: string,
    values: Record<string, FieldValue>,
    rawValues: Record<string, FieldValue>,
  ): Promise<{ success: boolean; submittedAt: string }> {
    const submission: Omit<FormSubmission, "id"> = {
      formId,
      values,
      rawValues,
      submittedAt: new Date().toISOString(),
    };
    await request<FormSubmission>(ENDPOINTS.submissions, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(submission),
    });
    return { success: true, submittedAt: submission.submittedAt };
  },

  async getLastSubmission(
    formId: string,
  ): Promise<Record<string, FieldValue> | null> {
    try {
      const data = await request<FormSubmission[]>(
        ENDPOINTS.submissionsByForm(formId),
      );
      if (!Array.isArray(data) || data.length === 0) return null;
      const latest = data.sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
      )[0];
      return latest?.rawValues ?? null;
    } catch {
      // Graceful fallback — no submissions yet or API unavailable.
      return null;
    }
  },
};

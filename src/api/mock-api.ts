import type { FormConfiguration, FormValues } from "@/types";

const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY ?? "form_builder_configurations";
const API_DELAY = Number(import.meta.env.VITE_API_SIMULATED_DELAY ?? 600);

function delay(ms = API_DELAY): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStore(): FormConfiguration[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FormConfiguration[]) : [];
  } catch {
    return [];
  }
}

function persist(configs: FormConfiguration[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}

/**
 * Simulated REST-like API backed by localStorage.
 * All methods include an artificial delay to mimic network latency.
 */
export const formApi = {
  async list(): Promise<FormConfiguration[]> {
    await delay(400);
    return getStore();
  },

  async getById(id: string): Promise<FormConfiguration | undefined> {
    await delay(300);
    return getStore().find((c) => c.id === id);
  },

  async save(config: FormConfiguration): Promise<FormConfiguration> {
    await delay();
    const store = getStore();
    const index = store.findIndex((c) => c.id === config.id);

    const saved: FormConfiguration = {
      ...config,
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      store[index] = saved;
    } else {
      saved.createdAt = new Date().toISOString();
      store.push(saved);
    }

    persist(store);
    return saved;
  },

  async remove(id: string): Promise<void> {
    await delay(300);
    persist(getStore().filter((c) => c.id !== id));
  },

  async exportAsJson(config: FormConfiguration): Promise<string> {
    await delay(200);
    return JSON.stringify(config, null, 2);
  },

  async submitForm(
    formId: string,
    values: FormValues,
  ): Promise<{ success: boolean; submittedAt: string }> {
    await delay();
    console.log("[Mock API] Form submitted:", { formId, values });
    return { success: true, submittedAt: new Date().toISOString() };
  },
};

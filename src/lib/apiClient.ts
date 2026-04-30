/**
 * API Client for JhedAI Contact Form
 * Contacts go to jhedai-api worker (has Resend integration)
 */

const CONTACT_API_URL =
  import.meta.env.VITE_CONTACT_API_URL ||
  "https://jhedai-api.edison-985.workers.dev";

export interface ContactFormData {
  nombre: string;
  email: string;
  empresa?: string;
  telefono?: string;
  servicio?: string;
  mensaje: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Submit contact form
 */
export async function submitContactForm(
  data: ContactFormData,
): Promise<ApiResponse<unknown>> {
  const response = await fetch(`${CONTACT_API_URL}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || result.message || "Failed to submit form");
  }

  return result as ApiResponse<unknown>;
}

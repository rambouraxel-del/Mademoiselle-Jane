export interface ContactFormInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactFormResult {
  success: boolean;
  error?: string;
}

/**
 * Simule l'envoi du formulaire de contact côté client.
 * À remplacer par un appel à une route API / une fonction Supabase Edge
 * (envoi d'email) lors du prochain lot.
 */
export async function submitContactForm(
  input: ContactFormInput
): Promise<ContactFormResult> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  if (!input.name || !input.email || !input.message) {
    return { success: false, error: "Merci de compléter tous les champs requis." };
  }

  return { success: true };
}

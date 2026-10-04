/**
 * Gestion des comptes administrateurs (Axel, Ophélie).
 *
 *   npm run admin:create -- --email=ophelie@exemple.fr --name=Ophélie
 *   npm run admin:list
 *   npm run admin:remove -- --email=ophelie@exemple.fr
 *
 * Le mot de passe est demandé au clavier (jamais stocké dans un fichier).
 * Options : --env=.env.production.local pour cibler la production,
 *           --password-stdin pour le lire sur l'entrée standard (automatisation).
 */
import { createInterface } from "node:readline";
import { flag, loadEnv, option, serviceClient } from "./lib/env";

loadEnv();
const supabase = serviceClient();
const command = process.argv[2];

async function readPasswordStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8").trim();
}

function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const output = rl as unknown as { _writeToOutput: (s: string) => void; output: NodeJS.WriteStream };
    let muted = false;
    output._writeToOutput = (s: string) => {
      if (!muted) output.output.write(s);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
    muted = true;
  });
}

async function findUserByEmail(email: string) {
  for (let page = 1; page < 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < 200) return null;
  }
  return null;
}

async function create() {
  const email = option("email")?.trim().toLowerCase();
  const name = option("name")?.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name) {
    throw new Error("Usage : npm run admin:create -- --email=adresse@exemple.fr --name=Prénom");
  }
  let password: string;
  if (flag("password-stdin")) {
    password = await readPasswordStdin();
  } else {
    password = await askHidden(`Mot de passe pour ${email} (12 caractères minimum) : `);
    const confirm = await askHidden("Confirmez le mot de passe : ");
    if (password !== confirm) throw new Error("Les mots de passe ne correspondent pas.");
  }
  if (password.length < 12) throw new Error("Mot de passe trop court (12 caractères minimum).");

  let user = await findUserByEmail(email);
  if (user) {
    if (!flag("reset-password")) {
      console.log("Ce compte existe déjà : son mot de passe n'est pas modifié (ajoutez --reset-password pour le changer).");
    } else {
      const { error } = await supabase.auth.admin.updateUserById(user.id, { password });
      if (error) throw error;
      console.log("Mot de passe mis à jour.");
    }
  } else {
    const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
    if (error) throw error;
    user = data.user;
    console.log("Compte créé.");
  }
  const { error } = await supabase.from("admins").upsert({ user_id: user!.id, display_name: name });
  if (error) throw error;
  console.log(`✓ ${name} <${email}> est administrateur·rice.`);
}

async function list() {
  const { data, error } = await supabase.from("admins").select("user_id, display_name, created_at");
  if (error) throw error;
  if (!data.length) return console.log("Aucun administrateur.");
  for (const a of data) {
    const { data: u } = await supabase.auth.admin.getUserById(a.user_id);
    console.log(`- ${a.display_name} <${u.user?.email ?? "?"}>`);
  }
}

async function remove() {
  const email = option("email");
  if (!email) throw new Error("Usage : npm run admin:remove -- --email=adresse@exemple.fr");
  const user = await findUserByEmail(email);
  if (!user) throw new Error("Compte introuvable.");
  const { error } = await supabase.from("admins").delete().eq("user_id", user.id);
  if (error) throw error;
  if (flag("delete-account")) await supabase.auth.admin.deleteUser(user.id);
  console.log(`✓ Accès administrateur retiré pour ${email}.`);
}

const commands: Record<string, () => Promise<void>> = { create, list, remove };
(commands[command] ?? (async () => console.log("Commandes : create | list | remove")))().catch((e) => {
  console.error(`Échec : ${e instanceof Error ? e.message : e}`);
  process.exit(1);
});

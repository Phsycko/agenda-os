import { promises as fs } from "node:fs";
import path from "node:path";

export type PersonalItemType = "EVENT" | "TASK" | "NOTE";
export type PersonalItemStatus = "PENDIENTE" | "COMPLETADA" | "CANCELADA";
export type PersonalItemPriority = "BAJA" | "MEDIA" | "ALTA" | "URGENTE";

export type PersonalItem = {
  id: string;
  type: PersonalItemType;
  title: string;
  content?: string;
  date?: string;
  time?: string;
  status: PersonalItemStatus;
  priority: PersonalItemPriority;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};

const filePath = path.join(process.cwd(), "data", "personal.json");

async function ensureFile() {
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, "[]", "utf8");
  }
}

export async function readPersonalItems(): Promise<PersonalItem[]> {
  await ensureFile();
  const raw = await fs.readFile(filePath, "utf8");
  try {
    const parsed = JSON.parse(raw) as PersonalItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writePersonalItems(items: PersonalItem[]) {
  await ensureFile();
  await fs.writeFile(filePath, JSON.stringify(items, null, 2), "utf8");
}

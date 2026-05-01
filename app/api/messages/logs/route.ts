import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() { return NextResponse.json(await prisma.messageLog.findMany({ orderBy: { createdAt: "desc" } })); }
export async function POST(req: Request) { return NextResponse.json(await prisma.messageLog.create({ data: await req.json() }), { status: 201 }); }

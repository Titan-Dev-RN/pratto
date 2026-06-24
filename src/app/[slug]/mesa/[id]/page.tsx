"use client";

import { use } from "react";
import { redirect } from "next/navigation";

export default function MesaPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = use(params);

  /* Mesa QR redireciona para o cardápio com contexto de mesa */
  redirect(`/${slug}/menu?mesa=${id}`);
}

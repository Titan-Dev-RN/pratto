"use client";

import { useRef, useState } from "react";

interface DragListProps<T extends { id: string }> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, isDragging: boolean) => React.ReactNode;
}

export function DragList<T extends { id: string }>({ items, onReorder, renderItem }: DragListProps<T>) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragIndex = useRef<number | null>(null);

  function onDragStart(i: number, id: string) {
    dragIndex.current = i;
    setDraggingId(id);
  }

  function onDragOver(e: React.DragEvent, i: number) {
    e.preventDefault();
    setOverIndex(i);
  }

  function onDrop(e: React.DragEvent, targetIndex: number) {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === targetIndex) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(targetIndex, 0, moved);
    onReorder(next);
    dragIndex.current = null;
    setDraggingId(null);
    setOverIndex(null);
  }

  function onDragEnd() {
    setDraggingId(null);
    setOverIndex(null);
    dragIndex.current = null;
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => onDragStart(i, item.id)}
          onDragOver={(e) => onDragOver(e, i)}
          onDrop={(e) => onDrop(e, i)}
          onDragEnd={onDragEnd}
          className={`transition-all ${
            draggingId === item.id ? "opacity-40 scale-95" : ""
          } ${
            overIndex === i && draggingId !== item.id
              ? "border-t-2 border-team-400"
              : ""
          }`}
        >
          {renderItem(item, draggingId === item.id)}
        </div>
      ))}
    </div>
  );
}

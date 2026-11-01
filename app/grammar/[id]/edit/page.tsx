'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useGrammarStore } from '@/store/useGrammarStore';
import { GrammarForm, GrammarFormValues } from '@/components/GrammarForm';
import { Grammar } from '@/types';
import { Loader2 } from 'lucide-react';

export default function EditGrammarPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { grammars, fetchGrammarGroups, updateGrammar, isLoading } = useGrammarStore();
  const [grammar, setGrammar] = useState<Grammar | null>(null);

  useEffect(() => {
    fetchGrammarGroups();
  }, [fetchGrammarGroups]);

  useEffect(() => {
    if (id && grammars.length > 0) {
      const found = grammars.find((g) => g.id === id);
      if (found) {
        setGrammar(found);
      }
    }
  }, [id, grammars]);

  const handleSubmit = async (data: GrammarFormValues) => {
    if (!id) return;
    await updateGrammar(id, {
      name: data.name,
      usage: data.usage,
      structure: data.structure,
      groupId: data.groupId,
      examples: data.examples,
    });
    router.push('/?tab=grammar');
  };

  if (!grammar) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-green-500" />
        <p>Đang tải thông tin ngữ pháp...</p>
      </div>
    );
  }

  return (
    <GrammarForm
      initialData={grammar}
      pageTitle="Chỉnh sửa ngữ pháp"
      pageDescription="Cập nhật tên, cách dùng, cấu trúc hoặc các ví dụ của mẫu ngữ pháp."
      onSubmit={handleSubmit}
      backHref="/?tab=grammar"
    />
  );
}

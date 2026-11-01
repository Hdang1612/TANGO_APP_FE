'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGrammarStore } from '@/store/useGrammarStore';
import { GrammarForm, GrammarFormValues } from '@/components/GrammarForm';

export default function CreateGrammarPage() {
  const router = useRouter();
  const { createGrammar, fetchGrammarGroups } = useGrammarStore();

  useEffect(() => {
    fetchGrammarGroups();
  }, [fetchGrammarGroups]);

  const handleSubmit = async (data: GrammarFormValues) => {
    await createGrammar({
      name: data.name,
      usage: data.usage,
      structure: data.structure,
      groupId: data.groupId,
      examples: data.examples,
    });
    router.push('/?tab=grammar');
  };

  return (
    <GrammarForm
      pageTitle="Thêm ngữ pháp mới"
      pageDescription="Thêm mẫu ngữ pháp mới, cách dùng, cấu trúc câu và các ví dụ minh họa."
      onSubmit={handleSubmit}
      backHref="/?tab=grammar"
    />
  );
}

'use client';

import { useForm, useFieldArray, Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PlusCircle, Trash2, ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Lesson } from '@/types';

export const vocabularyLessonSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề bài học'),
  description: z.string().optional(),
  vocabularies: z
    .array(
      z.object({
        id: z.string().optional(),
        japanese: z.string().min(1, 'Vui lòng nhập từ tiếng Nhật'),
        vietnamese: z.string().min(1, 'Vui lòng nhập nghĩa tiếng Việt'),
        hanViet: z.string().optional(),
      })
    )
    .min(1, 'Cần ít nhất một từ vựng'),
  kanjis: z
    .array(
      z.object({
        id: z.string().optional(),
        character: z.string().optional(),
        meaning: z.string().optional(),
        hanViet: z.string().optional(),
        onYomi: z.string().optional(),
        kunYomi: z.string().optional(),
        examples: z
          .array(
            z.object({
              word: z.string().optional(),
              reading: z.string().optional(),
              meaning: z.string().optional(),
            })
          )
          .optional(),
      })
    )
    .optional(),
});

export const kanjiLessonSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề bài học'),
  description: z.string().optional(),
  vocabularies: z
    .array(
      z.object({
        id: z.string().optional(),
        japanese: z.string().optional(),
        vietnamese: z.string().optional(),
        hanViet: z.string().optional(),
      })
    )
    .optional(),
  kanjis: z
    .array(
      z.object({
        id: z.string().optional(),
        character: z.string().min(1, 'Vui lòng nhập chữ Hán'),
        meaning: z.string().min(1, 'Vui lòng nhập ý nghĩa'),
        hanViet: z.string().optional(),
        onYomi: z.string().optional(),
        kunYomi: z.string().optional(),
        examples: z
          .array(
            z.object({
              word: z.string().min(1, 'Vui lòng nhập từ ví dụ'),
              reading: z.string().optional(),
              meaning: z.string().optional(),
            })
          )
          .optional(),
      })
    )
    .min(1, 'Cần ít nhất một chữ Hán'),
});

export interface LessonFormValues {
  title: string;
  description?: string;
  vocabularies?: {
    id?: string;
    japanese?: string;
    vietnamese?: string;
    hanViet?: string;
  }[];
  kanjis?: {
    id?: string;
    character?: string;
    meaning?: string;
    hanViet?: string;
    onYomi?: string;
    kunYomi?: string;
    examples?: {
      word: string;
      reading?: string;
      meaning?: string;
    }[];
  }[];
}

interface LessonFormProps {
  mode?: 'vocabulary' | 'kanji';
  initialData?: Lesson;
  onSubmit: (data: LessonFormValues) => void;
  pageTitle: string;
  pageDescription: string;
  backHref?: string;
}

interface KanjiExamplesFormProps {
  nestIndex: number;
  control: Control<LessonFormValues>;
  register: UseFormRegister<LessonFormValues>;
  errors: FieldErrors<LessonFormValues>;
}

function KanjiExamplesForm({ nestIndex, control, register, errors }: KanjiExamplesFormProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `kanjis.${nestIndex}.examples` as any,
  });

  return (
    <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4 md:col-span-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Từ vựng ghép có chữ này (Ví dụ)
        </h4>
      </div>
      
      <div className="space-y-3">
        {fields.map((item, kIndex) => (
          <div key={item.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white dark:bg-slate-950 p-3 rounded-md border border-slate-200 dark:border-slate-800">
            <div className="flex-1 space-y-1 w-full">
              <Input
                placeholder="Từ vựng (vd: 日本)"
                {...register(`kanjis.${nestIndex}.examples.${kIndex}.word` as any)}
                className={`text-sm ${errors?.kanjis?.[nestIndex]?.examples?.[kIndex]?.word ? 'border-red-500' : ''}`}
              />
            </div>
            <div className="flex-1 space-y-1 w-full">
              <Input
                placeholder="Cách đọc (vd: にほん)"
                {...register(`kanjis.${nestIndex}.examples.${kIndex}.reading` as any)}
                className="text-sm"
              />
            </div>
            <div className="flex-1 space-y-1 w-full">
              <Input
                placeholder="Ý nghĩa (vd: Nhật Bản)"
                {...register(`kanjis.${nestIndex}.examples.${kIndex}.meaning` as any)}
                className="text-sm"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(kIndex)}
              className="text-slate-400 hover:text-red-500 self-end sm:self-auto shrink-0 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        
        <Button
          type="button"
          variant="ghost"
          onClick={() => append({ word: '', reading: '', meaning: '' })}
          className="text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/30 gap-1 h-8 px-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Thêm từ vựng ví dụ
        </Button>
      </div>
    </div>
  );
}

export function LessonForm({ 
  mode = 'vocabulary',
  initialData, 
  onSubmit, 
  pageTitle, 
  pageDescription,
  backHref
}: LessonFormProps) {
  const isKanjiMode = mode === 'kanji';
  const defaultBackHref = backHref || (isKanjiMode ? '/kanji-lessons' : '/');

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LessonFormValues>({
    resolver: zodResolver(isKanjiMode ? kanjiLessonSchema : vocabularyLessonSchema) as any,
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      vocabularies: isKanjiMode
        ? []
        : initialData?.vocabularies?.length 
          ? initialData.vocabularies 
          : [{ japanese: '', vietnamese: '', hanViet: '' }],
      kanjis: !isKanjiMode
        ? []
        : initialData?.kanjis && initialData.kanjis.length > 0
          ? initialData.kanjis.map((k) => ({
              id: k.id,
              character: k.character,
              meaning: k.meaning,
              hanViet: k.hanViet || '',
              onYomi: k.onYomi || '',
              kunYomi: k.kunYomi || '',
              examples: k.examples || [],
            }))
          : [{ character: '', meaning: '', hanViet: '', onYomi: '', kunYomi: '', examples: [] }],
    },
  });

  const { fields: vocabFields, append: appendVocab, remove: removeVocab } = useFieldArray({
    name: 'vocabularies' as any,
    control,
  });

  const { fields: kanjiFields, append: appendKanji, remove: removeKanji } = useFieldArray({
    name: 'kanjis' as any,
    control,
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      <div className="flex items-center gap-4">
        <Link href={defaultBackHref}>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-slate-900 cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
          <p className="text-slate-500">{pageDescription}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Lesson Details */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Thông tin bài học</CardTitle>
            <CardDescription>Nhập tiêu đề và mô tả ngắn gọn cho bài học.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề bài học <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                placeholder={isKanjiMode ? "vd: Hán tự N5 - Bài 1" : "vd: Từ vựng N5 - Bài 1"}
                {...register('title')}
                className={errors.title ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả (Tùy chọn)</Label>
              <Input
                id="description"
                placeholder="Bài học này nói về chủ đề gì?"
                {...register('description')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Vocabulary Mode: Only Vocabulary List */}
        {!isKanjiMode && (
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Danh sách từ vựng</CardTitle>
              <CardDescription>Thêm các từ tiếng Nhật, nghĩa tiếng Việt và âm Hán Việt.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errors.vocabularies?.root && (
                <p className="text-sm text-red-500 mb-4">{errors.vocabularies.root.message}</p>
              )}

              {vocabFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-start bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800"
                >
                  <div className="space-y-2">
                    <Label htmlFor={`vocabularies.${index}.japanese`} className="md:hidden">Từ tiếng Nhật</Label>
                    <Input
                      placeholder="Tiếng Nhật (vd: ありがとう)"
                      {...register(`vocabularies.${index}.japanese` as any)}
                      className={errors.vocabularies?.[index]?.japanese ? 'border-red-500' : 'bg-white dark:bg-slate-950'}
                    />
                    {errors.vocabularies?.[index]?.japanese && (
                      <p className="text-xs text-red-500">{errors.vocabularies[index]?.japanese?.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`vocabularies.${index}.vietnamese`} className="md:hidden">Nghĩa tiếng Việt</Label>
                    <Input
                      placeholder="Tiếng Việt (vd: Cảm ơn)"
                      {...register(`vocabularies.${index}.vietnamese` as any)}
                      className={errors.vocabularies?.[index]?.vietnamese ? 'border-red-500' : 'bg-white dark:bg-slate-950'}
                    />
                    {errors.vocabularies?.[index]?.vietnamese && (
                      <p className="text-xs text-red-500">{errors.vocabularies[index]?.vietnamese?.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`vocabularies.${index}.hanViet`} className="md:hidden">Hán Việt (Tùy chọn)</Label>
                    <Input
                      placeholder="Hán Việt (vd: CẢM ÂN)"
                      {...register(`vocabularies.${index}.hanViet` as any)}
                      className="bg-white dark:bg-slate-950"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVocab(index)}
                    disabled={vocabFields.length === 1}
                    className="mt-6 md:mt-0 text-slate-400 hover:text-red-500 hover:bg-red-50 self-start cursor-pointer"
                    title="Xóa từ"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => appendVocab({ japanese: '', vietnamese: '', hanViet: '' })}
                className="w-full border-dashed border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-blue-600 dark:border-slate-700 dark:hover:border-blue-900 dark:hover:bg-slate-900 gap-2 h-12 mt-4 cursor-pointer"
              >
                <PlusCircle className="w-5 h-5" />
                Thêm từ vựng mới
              </Button>
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800 p-6 flex justify-end gap-3">
              <Link href={isSubmitting ? '#' : defaultBackHref} className={isSubmitting ? 'pointer-events-none' : ''}>
                <Button type="button" variant="ghost" disabled={isSubmitting} className="cursor-pointer">Hủy</Button>
              </Link>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Lưu bài học
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Kanji Mode: Only Kanji List */}
        {isKanjiMode && (
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Danh sách Hán tự</CardTitle>
              <CardDescription>Thêm các chữ Hán, nghĩa Hán Việt, âm On, âm Kun và từ vựng ví dụ.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errors.kanjis?.root && (
                <p className="text-sm text-red-500 mb-4">{errors.kanjis.root.message}</p>
              )}

              {kanjiFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-start bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800"
                >
                  <div className="space-y-2">
                    <Label htmlFor={`kanjis.${index}.character`} className="md:hidden">Chữ Hán</Label>
                    <Input
                      placeholder="vd: 日"
                      {...register(`kanjis.${index}.character` as any)}
                      className={`text-3xl h-16 text-center font-bold ${errors.kanjis?.[index]?.character ? 'border-red-500' : 'bg-white dark:bg-slate-950'}`}
                    />
                    {errors.kanjis?.[index]?.character && (
                      <p className="text-xs text-red-500">{errors.kanjis[index]?.character?.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`kanjis.${index}.meaning`} className="md:hidden">Ý nghĩa</Label>
                    <Input
                      placeholder="Ý nghĩa (vd: Mặt trời, ngày)"
                      {...register(`kanjis.${index}.meaning` as any)}
                      className={errors.kanjis?.[index]?.meaning ? 'border-red-500' : 'bg-white dark:bg-slate-950'}
                    />
                    {errors.kanjis?.[index]?.meaning && (
                      <p className="text-xs text-red-500">{errors.kanjis[index]?.meaning?.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`kanjis.${index}.hanViet`} className="md:hidden">Hán Việt</Label>
                    <Input
                      placeholder="Hán Việt (vd: NHẬT)"
                      {...register(`kanjis.${index}.hanViet` as any)}
                      className="bg-white dark:bg-slate-950"
                    />
                  </div>

                  <div className="space-y-2 md:col-start-1">
                    <Label htmlFor={`kanjis.${index}.onYomi`}>Âm On（音読み）</Label>
                    <Input
                      placeholder="vd: ニチ, ジツ"
                      {...register(`kanjis.${index}.onYomi` as any)}
                      className="bg-white dark:bg-slate-950"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`kanjis.${index}.kunYomi`}>Âm Kun（訓読み）</Label>
                    <Input
                      placeholder="vd: ひ, か"
                      {...register(`kanjis.${index}.kunYomi` as any)}
                      className="bg-white dark:bg-slate-950"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeKanji(index)}
                    disabled={kanjiFields.length === 1}
                    className="mt-6 md:mt-0 text-slate-400 hover:text-red-500 hover:bg-red-50 self-start cursor-pointer"
                    title="Xóa chữ Hán"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>

                  <KanjiExamplesForm nestIndex={index} control={control} register={register} errors={errors} />
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => appendKanji({ character: '', meaning: '', hanViet: '', onYomi: '', kunYomi: '', examples: [] })}
                className="w-full border-dashed border-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-purple-600 dark:border-slate-700 dark:hover:border-purple-900 dark:hover:bg-slate-900 gap-2 h-12 mt-4 cursor-pointer"
              >
                <PlusCircle className="w-5 h-5" />
                Thêm chữ Hán mới
              </Button>
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800 p-6 flex justify-end gap-3">
              <Link href={isSubmitting ? '#' : defaultBackHref} className={isSubmitting ? 'pointer-events-none' : ''}>
                <Button type="button" variant="ghost" disabled={isSubmitting} className="cursor-pointer">Hủy</Button>
              </Link>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="bg-purple-600 hover:bg-purple-700 text-white gap-2 px-6 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Lưu bài học Hán tự
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
      </form>
    </div>
  );
}

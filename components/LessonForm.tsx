'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PlusCircle, Trash2, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { Lesson } from '@/types';

export const lessonSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  vocabularies: z
    .array(
      z.object({
        id: z.string().optional(),
        japanese: z.string().min(1, 'Required'),
        vietnamese: z.string().min(1, 'Required'),
        hanViet: z.string().optional(),
      })
    )
    .min(1, 'At least one vocabulary item is required'),
});

export type LessonFormValues = z.infer<typeof lessonSchema>;

interface LessonFormProps {
  initialData?: Lesson;
  onSubmit: (data: LessonFormValues) => void;
  pageTitle: string;
  pageDescription: string;
}

export function LessonForm({ initialData, onSubmit, pageTitle, pageDescription }: LessonFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      vocabularies: initialData?.vocabularies.length 
        ? initialData.vocabularies 
        : [{ japanese: '', vietnamese: '', hanViet: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: 'vocabularies',
    control,
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      <div className="flex items-center gap-4">
        <Link href="/">
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
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Lesson Details</CardTitle>
            <CardDescription>Give your lesson a title and a short description.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Lesson Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                placeholder="e.g. JLPT N5 - Chapter 1"
                {...register('title')}
                className={errors.title ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="What is this lesson about?"
                {...register('description')}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Vocabulary List</CardTitle>
            <CardDescription>Add words and their meanings to this lesson.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errors.vocabularies?.root && (
              <p className="text-sm text-red-500 mb-4">{errors.vocabularies.root.message}</p>
            )}

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-start bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800"
              >
                <div className="space-y-2">
                  <Label htmlFor={`vocabularies.${index}.japanese`} className="md:hidden">Japanese Word</Label>
                  <Input
                    placeholder="Japanese (e.g. ありがとう)"
                    {...register(`vocabularies.${index}.japanese` as const)}
                    className={errors.vocabularies?.[index]?.japanese ? 'border-red-500' : 'bg-white dark:bg-slate-950'}
                  />
                  {errors.vocabularies?.[index]?.japanese && (
                    <p className="text-xs text-red-500">{errors.vocabularies[index]?.japanese?.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`vocabularies.${index}.vietnamese`} className="md:hidden">Vietnamese Meaning</Label>
                  <Input
                    placeholder="Vietnamese (e.g. Cảm ơn)"
                    {...register(`vocabularies.${index}.vietnamese` as const)}
                    className={errors.vocabularies?.[index]?.vietnamese ? 'border-red-500' : 'bg-white dark:bg-slate-950'}
                  />
                  {errors.vocabularies?.[index]?.vietnamese && (
                    <p className="text-xs text-red-500">{errors.vocabularies[index]?.vietnamese?.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`vocabularies.${index}.hanViet`} className="md:hidden">Hán Việt (Optional)</Label>
                  <Input
                    placeholder="Hán Việt (e.g. CẢM ÂN)"
                    {...register(`vocabularies.${index}.hanViet` as const)}
                    className="bg-white dark:bg-slate-950"
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  className="mt-6 md:mt-0 text-slate-400 hover:text-red-500 hover:bg-red-50 self-start cursor-pointer"
                  title="Remove word"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => append({ japanese: '', vietnamese: '', hanViet: '' })}
              className="w-full border-dashed border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-blue-600 dark:border-slate-700 dark:hover:border-blue-900 dark:hover:bg-slate-900 gap-2 h-12 mt-4 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              Add New Word
            </Button>
          </CardContent>
          <CardFooter className="bg-slate-50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800 p-6 flex justify-end gap-3">
            <Link href="/">
              <Button type="button" variant="ghost" className="cursor-pointer">Cancel</Button>
            </Link>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6 cursor-pointer">
              <Save className="w-4 h-4" />
              Save Lesson
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

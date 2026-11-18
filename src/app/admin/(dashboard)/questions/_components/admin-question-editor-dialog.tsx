'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { FeedbackBanner } from '@/components/ui/feedback';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  GAME_LIMITS,
  OPTION_LETTERS,
  QUESTION_TYPE_LABELS,
} from '@/constants/game.constant';
import { UI_COPY } from '@/constants/ui.constant';
import type {
  AdminQuestion,
  QuestionFormInput,
  QuestionType,
} from '@/types/question';
import {
  createDefaultQuestionForm,
  createMultipleChoiceOptions,
  createTrueFalseOptions,
  nextMultipleChoiceOptionId,
  questionToFormInput,
} from '@/utils/question-form';

interface AdminQuestionEditorDialogProps {
  open: boolean;
  question: AdminQuestion | null;
  formError: string | null;
  fieldErrors: Record<string, string[]>;
  isSaving: boolean;
  onClose: () => void;
  onSave: (input: QuestionFormInput) => void;
  className?: string;
}

export function AdminQuestionEditorDialog({
  open,
  question,
  formError,
  fieldErrors,
  isSaving,
  onClose,
  onSave,
  className,
}: AdminQuestionEditorDialogProps) {
  const [draft, setDraft] = useState<QuestionFormInput>(() =>
    question ? questionToFormInput(question) : createDefaultQuestionForm(),
  );

  function handleTypeChange(nextType: QuestionType) {
    if (nextType === draft.type) return;
    const nextOptions =
      nextType === 'true_false'
        ? createTrueFalseOptions()
        : createMultipleChoiceOptions(3);
    setDraft((prev) => ({
      ...prev,
      type: nextType,
      options: nextOptions,
      correctOptionId: nextOptions[0].id,
    }));
  }

  function handleOptionTextChange(optionId: string, text: string) {
    setDraft((prev) => ({
      ...prev,
      options: prev.options.map((opt) =>
        opt.id === optionId ? { ...opt, text } : opt,
      ),
    }));
  }

  function handleAddOption() {
    if (draft.type !== 'multiple_choice') return;
    const nextId = nextMultipleChoiceOptionId(draft.options);
    if (!nextId) return;
    setDraft((prev) => ({
      ...prev,
      options: [...prev.options, { id: nextId, text: '' }],
    }));
  }

  function handleRemoveOption(optionId: string) {
    if (draft.type !== 'multiple_choice' || draft.options.length <= 2) return;
    const remaining = draft.options.filter((opt) => opt.id !== optionId);
    setDraft((prev) => ({
      ...prev,
      options: remaining,
      correctOptionId:
        prev.correctOptionId === optionId
          ? remaining[0].id
          : prev.correctOptionId,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(draft);
  }

  return (
    <Dialog
      open={open}
      title={question ? 'Ubah Soal' : 'Tambah Soal Baru'}
      description="Pastikan kunci jawaban sudah dipilih sebelum menyimpan."
      onClose={onClose}
      className={className}
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {formError ? (
          <FeedbackBanner tone="error">{formError}</FeedbackBanner>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Tipe Soal" required>
            {(controlProps) => (
              <Select
                {...controlProps}
                value={draft.type}
                onChange={(e) =>
                  handleTypeChange(e.target.value as QuestionType)
                }
              >
                <option value="true_false">
                  {QUESTION_TYPE_LABELS.true_false}
                </option>
                <option value="multiple_choice">
                  {QUESTION_TYPE_LABELS.multiple_choice}
                </option>
              </Select>
            )}
          </FormField>

          <FormField
            label="Durasi Waktu"
            error={fieldErrors.timeLimitSeconds?.[0]}
            required
          >
            {(controlProps) => (
              <Select
                {...controlProps}
                value={draft.timeLimitSeconds}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    timeLimitSeconds: Number(e.target.value),
                  }))
                }
              >
                {GAME_LIMITS.TIME_LIMIT_CHOICES.map((seconds) => (
                  <option key={seconds} value={seconds}>
                    {seconds} detik
                  </option>
                ))}
              </Select>
            )}
          </FormField>

          <FormField
            label="Poin Dasar"
            error={fieldErrors.basePoints?.[0]}
            required
          >
            {(controlProps) => (
              <Input
                {...controlProps}
                type="number"
                min={GAME_LIMITS.BASE_POINTS_MIN}
                max={GAME_LIMITS.BASE_POINTS_MAX}
                step={100}
                value={draft.basePoints === 0 ? '' : draft.basePoints}
                onChange={(e) => {
                  const raw = e.target.value;
                  setDraft((prev) => ({
                    ...prev,
                    basePoints: raw === '' ? 0 : Number.parseInt(raw, 10) || 0,
                  }));
                }}
              />
            )}
          </FormField>
        </div>

        <FormField
          label="Teks Pertanyaan"
          error={fieldErrors.prompt?.[0]}
          required
        >
          {(controlProps) => (
            <Textarea
              {...controlProps}
              value={draft.prompt}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, prompt: e.target.value }))
              }
              placeholder="Tuliskan pernyataan atau skenario pertanyaan…"
              maxLength={GAME_LIMITS.PROMPT_MAX}
            />
          )}
        </FormField>

        <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
          <div className="flex items-center justify-between gap-2">
            <legend className="quiz-kicker quiz-kicker--blue">
              Opsi Jawaban &amp; Kunci Benar
            </legend>
            {draft.type === 'multiple_choice' &&
            draft.options.length < GAME_LIMITS.OPTIONS_MAX ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddOption}
              >
                <Plus size={16} aria-hidden="true" />
                <span>Tambah Opsi</span>
              </Button>
            ) : null}
          </div>

          {fieldErrors.options?.[0] ? (
            <p className="ui-field-error" role="alert">
              {fieldErrors.options[0]}
            </p>
          ) : null}

          <div className="flex flex-col gap-2.5">
            {draft.options.map((option, idx) => {
              const letter = OPTION_LETTERS[idx] ?? String(idx + 1);
              const optError = fieldErrors[`options.${idx}.text`]?.[0];
              return (
                <div key={option.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <label className="flex min-h-[48px] cursor-pointer items-center gap-2 rounded-xl bg-[var(--color-white)] px-3 text-sm font-bold">
                      <input
                        type="radio"
                        name="correctOptionId"
                        checked={draft.correctOptionId === option.id}
                        onChange={() =>
                          setDraft((prev) => ({
                            ...prev,
                            correctOptionId: option.id,
                          }))
                        }
                        className="h-4 w-4 accent-[var(--color-blue)]"
                      />
                      <span>{letter}</span>
                    </label>
                    <Input
                      value={option.text}
                      disabled={draft.type === 'true_false'}
                      aria-label={`Teks opsi ${letter}`}
                      aria-invalid={optError ? true : undefined}
                      placeholder={`Teks pilihan ${letter}`}
                      maxLength={GAME_LIMITS.OPTION_TEXT_MAX}
                      onChange={(e) =>
                        handleOptionTextChange(option.id, e.target.value)
                      }
                    />
                    {draft.type === 'multiple_choice' &&
                    draft.options.length > GAME_LIMITS.OPTIONS_MIN ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={`Hapus opsi ${letter}`}
                        onClick={() => handleRemoveOption(option.id)}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </Button>
                    ) : null}
                  </div>
                  {optError ? (
                    <p className="ui-field-error" role="alert">
                      {optError}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </fieldset>

        <FormField
          label={`Penjelasan Jawaban (${UI_COPY.OPTIONAL})`}
          helper="Ditampilkan ke pemain saat fase pembahasan (reveal)."
          error={fieldErrors.explanation?.[0]}
        >
          {(controlProps) => (
            <Textarea
              {...controlProps}
              value={draft.explanation ?? ''}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  explanation: e.target.value,
                }))
              }
              placeholder="Contoh: Menghargai keberagaman dimulai dari menerima perbedaan…"
              maxLength={GAME_LIMITS.EXPLANATION_MAX}
            />
          )}
        </FormField>

        <div className="mt-2 flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            {UI_COPY.CANCEL}
          </Button>
          <Button type="submit" loading={isSaving} loadingLabel="Menyimpan…">
            {UI_COPY.SAVE}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

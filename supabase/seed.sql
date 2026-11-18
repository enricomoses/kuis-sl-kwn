-- M1: Seeder 5 soal awal Kuis Keberagaman & Antiintoleransi (PRD §16)
insert into public.questions (type, prompt, options, correct_option_id, time_limit_seconds, position)
select * from (
  values
    (
      'true_false'::public.question_type,
      'Berteman mengharuskan kita memiliki suku, agama, dan hobi yang sama.',
      '[{"id":"true","text":"Benar"},{"id":"false","text":"Salah"}]'::jsonb,
      'false',
      20,
      1
    ),
    (
      'true_false'::public.question_type,
      'Berbeda pendapat dengan bahasa yang sopan boleh dilakukan.',
      '[{"id":"true","text":"Benar"},{"id":"false","text":"Salah"}]'::jsonb,
      'true',
      20,
      2
    ),
    (
      'multiple_choice'::public.question_type,
      'Teman diejek karena logatnya. Pilih tindakan:',
      '[{"id":"a","text":"Ikut tertawa"},{"id":"b","text":"Mengingatkan dengan sopan dan mendukung teman"},{"id":"c","text":"Menyebarkan rekaman ejekan"}]'::jsonb,
      'b',
      30,
      3
    ),
    (
      'multiple_choice'::public.question_type,
      'Ada meme yang menghina kelompok tertentu di grup kelas. Pilih tindakan:',
      '[{"id":"a","text":"Meneruskan"},{"id":"b","text":"Membalas dengan hinaan"},{"id":"c","text":"Tidak menyebarkan dan meminta bantuan guru bila berlanjut"}]'::jsonb,
      'c',
      30,
      4
    ),
    (
      'true_false'::public.question_type,
      'Saat situasi terasa tidak aman, kita sebaiknya meminta bantuan guru, bukan memaksakan konfrontasi.',
      '[{"id":"true","text":"Benar"},{"id":"false","text":"Salah"}]'::jsonb,
      'true',
      20,
      5
    )
) as seed_data(type, prompt, options, correct_option_id, time_limit_seconds, position)
where not exists (select 1 from public.questions limit 1);

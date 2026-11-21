-- Execute no Supabase SQL Editor antes de usar o sorteio no aplicativo.
-- A compra e a conta continuam nas tabelas public.compras e public.usuarios.
-- Cada sorteio é um ciclo único: todos dão e recebem exatamente um presente.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.amigos_secretos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  criador_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  valor_presente text NOT NULL DEFAULT '',
  criado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT amigos_secretos_valor_presente_check CHECK (char_length(valor_presente) <= 80)
);

CREATE TABLE IF NOT EXISTS public.amigo_secreto_participantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amigo_secreto_id uuid NOT NULL REFERENCES public.amigos_secretos(id) ON DELETE CASCADE,
  posicao smallint NOT NULL,
  nome text NOT NULL,
  link_token uuid NOT NULL DEFAULT gen_random_uuid(),
  sorteado_id uuid NOT NULL,
  CONSTRAINT amigo_secreto_participantes_posicao_check CHECK (posicao BETWEEN 0 AND 98),
  CONSTRAINT amigo_secreto_participantes_nome_check CHECK (char_length(btrim(nome)) BETWEEN 1 AND 60),
  CONSTRAINT amigo_secreto_participantes_sem_auto_sorteio CHECK (id <> sorteado_id),
  CONSTRAINT amigo_secreto_participantes_posicao_unique UNIQUE (amigo_secreto_id, posicao),
  CONSTRAINT amigo_secreto_participantes_link_unique UNIQUE (link_token),
  CONSTRAINT amigo_secreto_participantes_id_grupo_unique UNIQUE (amigo_secreto_id, id),
  CONSTRAINT amigo_secreto_participantes_destino_unique UNIQUE (amigo_secreto_id, sorteado_id),
  CONSTRAINT amigo_secreto_participantes_mesmo_grupo_fk
    FOREIGN KEY (amigo_secreto_id, sorteado_id)
    REFERENCES public.amigo_secreto_participantes(amigo_secreto_id, id)
    DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS amigos_secretos_criador_criado_idx
  ON public.amigos_secretos (criador_id, criado_em DESC);

CREATE INDEX IF NOT EXISTS amigo_secreto_participantes_grupo_posicao_idx
  ON public.amigo_secreto_participantes (amigo_secreto_id, posicao);

ALTER TABLE public.amigos_secretos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amigo_secreto_participantes ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.amigos_secretos, public.amigo_secreto_participantes FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.amigos_secretos, public.amigo_secreto_participantes TO service_role;

CREATE OR REPLACE FUNCTION public.criar_amigo_secreto(
  p_criador_id uuid,
  p_nomes text[],
  p_valor_presente text DEFAULT ''
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_grupo_id uuid;
  v_ids uuid[] := ARRAY[]::uuid[];
  v_ordem integer[];
  v_total integer := cardinality(p_nomes);
  v_posicao integer;
  v_proxima_posicao integer;
  i integer;
BEGIN
  IF p_criador_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.compras
    WHERE usuario_id = p_criador_id AND status = 'paid'
  ) THEN
    RAISE EXCEPTION 'Compra aprovada não encontrada.';
  END IF;

  IF v_total IS NULL OR v_total NOT BETWEEN 2 AND 99 THEN
    RAISE EXCEPTION 'Informe de 2 a 99 participantes.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM unnest(p_nomes) AS nomes(nome)
    WHERE nome IS NULL OR char_length(btrim(nome)) NOT BETWEEN 1 AND 60
  ) THEN
    RAISE EXCEPTION 'Há um nome de participante inválido.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM unnest(p_nomes) AS nomes(nome)
    GROUP BY lower(btrim(nome))
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Os participantes precisam ter nomes diferentes.';
  END IF;

  IF p_valor_presente IS NULL OR char_length(p_valor_presente) > 80 THEN
    RAISE EXCEPTION 'Valor do presente inválido.';
  END IF;

  INSERT INTO public.amigos_secretos (criador_id, valor_presente)
  VALUES (p_criador_id, p_valor_presente)
  RETURNING id INTO v_grupo_id;

  FOR i IN 1..v_total LOOP
    v_ids := array_append(v_ids, gen_random_uuid());
  END LOOP;

  SELECT array_agg(pos ORDER BY gen_random_uuid()) INTO v_ordem
  FROM generate_series(1, v_total) AS posicoes(pos);

  FOR i IN 1..v_total LOOP
    v_posicao := v_ordem[i];
    v_proxima_posicao := v_ordem[CASE WHEN i = v_total THEN 1 ELSE i + 1 END];

    INSERT INTO public.amigo_secreto_participantes
      (id, amigo_secreto_id, posicao, nome, sorteado_id)
    VALUES
      (v_ids[v_posicao], v_grupo_id, v_posicao - 1, btrim(p_nomes[v_posicao]), v_ids[v_proxima_posicao]);
  END LOOP;

  RETURN v_grupo_id;
END;
$$;

REVOKE ALL ON FUNCTION public.criar_amigo_secreto(uuid, text[], text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.criar_amigo_secreto(uuid, text[], text) TO service_role;

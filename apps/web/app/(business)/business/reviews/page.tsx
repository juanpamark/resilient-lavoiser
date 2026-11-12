'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/ui/status-pill';
import { Switch } from '@/components/ui/switch';

type ReviewFilter = 'all' | 'pending' | 'critical' | 'five_stars';
type ResponseStrategyMode = 'diplomatic_whatsapp' | 'local_seo_boost' | 'warm_gratitude';
type ReviewStatus = 'pending_reply' | 'published';

interface SentimentTag {
  label: string;
  tone: 'positive' | 'negative' | 'neutral';
}

interface GoogleMapsReview {
  id: string;
  authorName: string;
  authorInitials: string;
  authorBadge: string;
  rating: 1 | 2 | 3 | 4 | 5;
  publishedRelativeTime: string;
  visitModality: 'Domicilio' | 'Comedor en salón';
  reviewText: string;
  sentimentTags: SentimentTag[];
  status: ReviewStatus;
  selectedStrategy: ResponseStrategyMode;
  draftReplies: Record<ResponseStrategyMode, string>;
  seoKeywordsInjected: string[];
  publishedAt?: string;
}

const INITIAL_REVIEWS: GoogleMapsReview[] = [
  {
    id: 'rev-301',
    authorName: 'Camilo Andrés Vargas',
    authorInitials: 'CV',
    authorBadge: 'Local Guide · Nivel 6 · 48 reseñas',
    rating: 2,
    publishedRelativeTime: 'Hace 38 min',
    visitModality: 'Domicilio',
    reviewText:
      'La carne de Santa Cruz siempre nos ha parecido deliciosa, pero hoy pedimos una Punta de Anca y un Baby Beef a domicilio un viernes por la noche y tardó casi una hora en llegar a Villa Luz. Las papas criollas llegaron frías.',
    sentimentTags: [
      { label: '⚠️ Queja: Demora en domicilio (60m)', tone: 'negative' },
      { label: '⚠️ Queja: Temperatura guarnición', tone: 'negative' },
      { label: '✓ Elogia: Sabor de los cortes', tone: 'positive' },
    ],
    status: 'pending_reply',
    selectedStrategy: 'diplomatic_whatsapp',
    seoKeywordsInjected: [
      'Santa Cruz Parrilla',
      'Punta de Anca madurada',
      'domicilios en Engativá',
    ],
    draftReplies: {
      diplomatic_whatsapp:
        'Hola Camilo, te saluda Don Andrés, propietario de Santa Cruz Parrilla. Te ofrezco una disculpa sincera porque la espera de hoy hacia Villa Luz y la temperatura de las papas no representan el estándar de nuestra parrilla. Queremos reponerte esta experiencia personalmente en tu próximo pedido: por favor escríbenos directo a nuestra línea VIP de gerencia en WhatsApp (+57 314 289 4410) con tu número de orden para darte atención prioritaria.',
      local_seo_boost:
        'Hola Camilo, lamentamos la demora presentada en la ruta de domicilios en Engativá este viernes. En Santa Cruz Parrilla trabajamos cada día para que nuestra Punta de Anca madurada y Baby Beef al carbón lleguen en óptimas condiciones. Escríbenos por favor a nuestro WhatsApp directo (+57 314 289 4410) para compensarte en tu próxima orden.',
      warm_gratitude:
        'Camilo, muchas gracias por destacar el sabor de nuestra carne y por alertarnos sobre el tiempo de entrega de hoy. Ya reforzamos el empaque térmico de nuestras guarniciones. Por favor contáctanos en WhatsApp (+57 314 289 4410) para tener una atención especial contigo.',
    },
  },
  {
    id: 'rev-302',
    authorName: 'María Fernanda Ospina',
    authorInitials: 'MO',
    authorBadge: 'Local Guide · Nivel 5 · 19 reseñas',
    rating: 5,
    publishedRelativeTime: 'Hace 2 horas',
    visitModality: 'Comedor en salón',
    reviewText:
      '¡Increíble experiencia! Fuimos a celebrar el cumpleaños de mi papá. La Punta de Anca en término 3/4 estaba súper jugosa, el chorizo santarrosano delicioso y la jarra de sangría espectacular. Además pedimos por WhatsApp antes de llegar y todo fue rapidísimo.',
    sentimentTags: [
      { label: '✓ Elogia: Punta de Anca 3/4', tone: 'positive' },
      { label: '✓ Elogia: Jarra de Sangría', tone: 'positive' },
      { label: '✓ Elogia: Atención en cumpleaños', tone: 'positive' },
    ],
    status: 'pending_reply',
    selectedStrategy: 'local_seo_boost',
    seoKeywordsInjected: [
      'mejor parrilla en Engativá',
      'Punta de Anca al carbón',
      'restaurante para cumpleaños en Bogotá',
      'chorizo santarrosano artesanal',
    ],
    draftReplies: {
      local_seo_boost:
        '¡Qué alegría leer tu reseña, María Fernanda! Fue un honor celebrar el cumpleaños de tu papá con nosotros en Santa Cruz Parrilla. Nos enorgullece saber que disfrutaron nuestra Punta de Anca al carbón en término 3/4, el chorizo santarrosano artesanal y la sangría de la casa. Cuando busquen la mejor parrilla en Engativá y un restaurante para celebrar en familia en Bogotá, esta siempre será su casa. ¡Los esperamos pronto!',
      diplomatic_whatsapp:
        '¡Muchas gracias María Fernanda! Nos alegra enormemente haber hecho especial el cumpleaños de tu papá. Recuerda que por nuestra línea de WhatsApp puedes reservar tu mesa VIP cuando quieras regresar.',
      warm_gratitude:
        '¡Mil gracias por tus 5 estrellas, María Fernanda! Qué gusto saber que la Punta de Anca 3/4 y la sangría artesanal les encantaron a ti y a tu papá. ¡Los esperamos de vuelta muy pronto en Santa Cruz!',
    },
  },
  {
    id: 'rev-303',
    authorName: 'Jorge Eliécer Salamanca',
    authorInitials: 'JS',
    authorBadge: '12 reseñas en Google',
    rating: 5,
    publishedRelativeTime: 'Ayer',
    visitModality: 'Domicilio',
    reviewText:
      'Pedí por el WhatsApp del restaurante y me sorprendió lo rápido que me atendieron. El Churrasco Argentino llegó en el término medio exacto que pedí y muy bien empacado.',
    sentimentTags: [
      { label: '✓ Elogia: Bot de WhatsApp rápido', tone: 'positive' },
      { label: '✓ Elogia: Churrasco Argentino 1/2', tone: 'positive' },
    ],
    status: 'published',
    publishedAt: 'Publicado ayer a las 21:14',
    selectedStrategy: 'local_seo_boost',
    seoKeywordsInjected: [
      'Churrasco Argentino en Bogotá',
      'asados a domicilio en Engativá',
      'Santa Cruz Parrilla',
    ],
    draftReplies: {
      local_seo_boost:
        '¡Muchas gracias por tu calificación de 5 estrellas, Jorge Eliécer! Nos alegra saber que nuestro canal de pedidos por WhatsApp te brindó una atención ágil y que disfrutaste tu Churrasco Argentino al carbón en término medio exacto. Gracias por elegir a Santa Cruz Parrilla para tus asados a domicilio en Engativá y Bogotá.',
      diplomatic_whatsapp:
        '¡Gracias Jorge Eliécer! Nuestro canal de WhatsApp está activo 24/7 para tus próximos pedidos.',
      warm_gratitude:
        '¡Qué buen comentario, Jorge Eliécer! Gracias por destacar la calidad de nuestro Churrasco Argentino y nuestro servicio a domicilio.',
    },
  },
];

function renderStars(rating: number): React.ReactNode {
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`${rating} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={[
            'w-3.5 h-3.5',
            star <= rating ? 'text-[#D97706] fill-[#D97706]' : 'text-[#D5D2C8] fill-[#E8E6DF]',
          ].join(' ')}
          viewBox="0 0 24 24"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export default function BusinessReviewsGuardianPage() {
  const [reviews, setReviews] = React.useState<GoogleMapsReview[]>(INITIAL_REVIEWS);
  const [filter, setFilter] = React.useState<ReviewFilter>('all');
  const [autoPublishFiveStars, setAutoPublishFiveStars] = React.useState<boolean>(true);
  const [publishingId, setPublishingId] = React.useState<string | null>(null);

  const metrics = React.useMemo(() => {
    const pendingCount = reviews.filter((r) => r.status === 'pending_reply').length;
    const criticalCount = reviews.filter((r) => r.rating <= 3).length;
    const fiveStarsCount = reviews.filter((r) => r.rating >= 4).length;
    return {
      total: reviews.length,
      pendingCount,
      criticalCount,
      fiveStarsCount,
    };
  }, [reviews]);

  const filteredReviews = React.useMemo(() => {
    return reviews.filter((review) => {
      if (filter === 'pending') return review.status === 'pending_reply';
      if (filter === 'critical') return review.rating <= 3;
      if (filter === 'five_stars') return review.rating >= 4;
      return true;
    });
  }, [reviews, filter]);

  const handleSelectStrategy = (
    reviewId: string,
    strategy: ResponseStrategyMode
  ) => {
    setReviews((prev) =>
      prev.map((rev) =>
        rev.id === reviewId ? { ...rev, selectedStrategy: strategy } : rev
      )
    );
  };

  const handleEditDraftText = (reviewId: string, newText: string) => {
    setReviews((prev) =>
      prev.map((rev) => {
        if (rev.id !== reviewId) return rev;
        return {
          ...rev,
          draftReplies: {
            ...rev.draftReplies,
            [rev.selectedStrategy]: newText,
          },
        };
      })
    );
  };

  const handlePublishReply = (reviewId: string) => {
    setPublishingId(reviewId);
    window.setTimeout(() => {
      const nowTime = new Date().toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      setReviews((prev) =>
        prev.map((rev) =>
          rev.id === reviewId
            ? {
                ...rev,
                status: 'published',
                publishedAt: `Publicado hoy a las ${nowTime} en Google Maps`,
              }
            : rev
        )
      );
      setPublishingId(null);
    }, 650);
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#FAF8F5] overflow-hidden">
      {/* =====================================================================
          CABECERA DEL GUARDIÁN DE RESEÑAS + MÉTRICAS DE REPUTACIÓN Y SEO LOCAL
      ===================================================================== */}
      <header className="px-6 py-4 bg-white border-b border-[#E8E6DF] space-y-3.5 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-semibold text-[#141413] tracking-[-0.02em]">
                Guardián de Reseñas · Google Business Profile
              </h1>
              <StatusPill
                status="ai_active"
                label="Motor SEO + Contención Activo"
                metric="4.8 ★"
                pulse
              />
            </div>
            <p className="text-xs text-[#575653] mt-0.5">
              Convierte reseñas de 5 estrellas en posicionamiento SEO local en
              Google Maps y desvía quejas de 1-3 estrellas a tu WhatsApp privado.
            </p>
          </div>

          {/* Switch de Piloto Automático para 5 Estrellas */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#E8E6DF]">
            <Switch
              size="sm"
              variant="emerald"
              checked={autoPublishFiveStars}
              onCheckedChange={setAutoPublishFiveStars}
              label="Auto-publicar 5★ con SEO Local"
              description="Las de 1-3★ siempre piden tu aprobación"
            />
          </div>
        </div>

        {/* Barra de Filtros por Calificación + Indicadores Rápidos */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="inline-flex p-0.5 rounded-lg bg-[#F3F1EC] border border-[#E8E6DF] select-none">
            {(
              [
                { id: 'all', label: 'Todas las reseñas', count: metrics.total },
                {
                  id: 'pending',
                  label: 'Por responder',
                  count: metrics.pendingCount,
                },
                {
                  id: 'critical',
                  label: '🛡️ Contención (1-3★)',
                  count: metrics.criticalCount,
                },
                {
                  id: 'five_stars',
                  label: '📍 Impulso SEO (4-5★)',
                  count: metrics.fiveStarsCount,
                },
              ] as const
            ).map((tab) => {
              const isSelected = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={[
                    'h-7 px-3 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer',
                    isSelected
                      ? 'bg-white text-[#141413] shadow-2xs font-semibold'
                      : 'text-[#575653] hover:text-[#141413]',
                  ].join(' ')}
                >
                  <span>{tab.label}</span>
                  <span className="font-mono metric-mono text-[10px] px-1.5 py-0.2 rounded bg-[#FAF8F5] border border-[#E8E6DF] text-[#575653]">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 text-xs text-[#575653]">
            <span>
              Calificación mensual:{' '}
              <strong className="font-mono metric-mono text-[#141413]">
                4.8 ★ (142 reseñas)
              </strong>
            </span>
            <span className="text-[#D5D2C8]">|</span>
            <span>
              Keywords SEO posicionadas:{' '}
              <strong className="font-mono metric-mono text-[#065F46]">
                +18 este mes
              </strong>
            </span>
          </div>
        </div>
      </header>

      {/* =====================================================================
          LISTA DE TARJETAS COMPARATIVAS "ESPEJO" (RESEÑA IZQ | IA DER)
      ===================================================================== */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {filteredReviews.map((review) => {
          const isCritical = review.rating <= 3;
          const isPublished = review.status === 'published';
          const activeDraft = review.draftReplies[review.selectedStrategy];

          return (
            <article
              key={review.id}
              className={[
                'rounded-lg bg-white border overflow-hidden transition-all grid grid-cols-1 lg:grid-cols-2',
                isCritical && !isPublished
                  ? 'border-[#D97706] shadow-[0_2px_10px_rgba(217,119,6,0.08)]'
                  : 'border-[#D5D2C8] shadow-2xs',
              ].join(' ')}
            >
              {/* ===============================================================
                  LADO IZQUIERDO: RESEÑA PÚBLICA EN GOOGLE MAPS + SENTIMIENTO
              =============================================================== */}
              <div className="p-5 border-b lg:border-b-0 lg:border-r border-[#E8E6DF] flex flex-col justify-between space-y-4 bg-white">
                <div className="space-y-3">
                  {/* Cabecera del Autor y Estrellas */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={[
                          'h-9 w-9 rounded-full border flex items-center justify-center text-xs font-semibold shrink-0',
                          isCritical
                            ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
                            : 'bg-[#F3F1EC] border-[#D5D2C8] text-[#141413]',
                        ].join(' ')}
                      >
                        {review.authorInitials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-semibold text-[#141413]">
                            {review.authorName}
                          </h2>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F3F1EC] text-[#575653] border border-[#E8E6DF]">
                            {review.visitModality}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8A8884]">
                          {review.authorBadge}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-1.5">
                        {renderStars(review.rating)}
                        <span className="text-xs font-mono metric-mono font-bold text-[#141413]">
                          {review.rating}.0
                        </span>
                      </div>
                      <span className="text-[11px] font-mono metric-mono text-[#8A8884]">
                        {review.publishedRelativeTime}
                      </span>
                    </div>
                  </div>

                  {/* Texto de la reseña del comensal */}
                  <blockquote className="p-3.5 rounded-lg bg-[#FAF8F5] border border-[#E8E6DF] text-[13px] text-[#141413] leading-relaxed">
                    “{review.reviewText}”
                  </blockquote>
                </div>

                {/* Diagnóstico de Sentimiento Extraído por IA */}
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8A8884]">
                      Lectura de Sentimiento IA
                    </span>
                    {isCritical ? (
                      <span className="text-[10px] font-mono metric-mono font-semibold text-[#92400E] bg-[#FFFBEB] px-2 py-0.5 rounded border border-[#FDE68A]">
                        ⚡ Prioridad Alta: Desviar a WhatsApp privado
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono metric-mono font-semibold text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
                        📍 Oportunidad de Indexación SEO Local
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {review.sentimentTags.map((tag) => (
                      <span
                        key={tag.label}
                        className={[
                          'px-2 py-0.5 rounded text-[11px] font-medium border',
                          tag.tone === 'negative'
                            ? 'bg-[#FFF7ED] text-[#9A3412] border-[#FED7AA]'
                            : 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]',
                        ].join(' ')}
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ===============================================================
                  LADO DERECHO: RESPUESTA ESTRATÉGICA IA (ESPEJO)
              =============================================================== */}
              <div className="p-5 bg-[#FAF8F5]/70 flex flex-col justify-between space-y-3.5">
                <div className="space-y-3">
                  {/* Selector de Modo de Respuesta (Contención vs SEO Local) */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#575653]">
                      Estrategia de Respuesta IA
                    </span>

                    <div className="inline-flex p-0.5 rounded-md bg-[#E8E6DF]/70 border border-[#D5D2C8]">
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectStrategy(review.id, 'diplomatic_whatsapp')
                        }
                        className={[
                          'h-6 px-2.5 rounded text-[11px] font-medium transition-all cursor-pointer',
                          review.selectedStrategy === 'diplomatic_whatsapp'
                            ? 'bg-[#141413] text-white font-semibold shadow-2xs'
                            : 'text-[#575653] hover:text-[#141413]',
                        ].join(' ')}
                      >
                        🛡️ Diplomacia + WhatsApp VIP
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleSelectStrategy(review.id, 'local_seo_boost')
                        }
                        className={[
                          'h-6 px-2.5 rounded text-[11px] font-medium transition-all cursor-pointer',
                          review.selectedStrategy === 'local_seo_boost'
                            ? 'bg-[#0F291E] text-white font-semibold shadow-2xs'
                            : 'text-[#575653] hover:text-[#141413]',
                        ].join(' ')}
                      >
                        📍 SEO Local Gastronómico
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleSelectStrategy(review.id, 'warm_gratitude')
                        }
                        className={[
                          'h-6 px-2.5 rounded text-[11px] font-medium transition-all cursor-pointer',
                          review.selectedStrategy === 'warm_gratitude'
                            ? 'bg-white text-[#141413] font-semibold shadow-2xs'
                            : 'text-[#575653] hover:text-[#141413]',
                        ].join(' ')}
                      >
                        🤝 Breve
                      </button>
                    </div>
                  </div>

                  {/* Editor de Respuesta Generada */}
                  <textarea
                    rows={4}
                    disabled={isPublished}
                    value={activeDraft}
                    onChange={(e) =>
                      handleEditDraftText(review.id, e.target.value)
                    }
                    className={[
                      'w-full p-3 rounded-lg border text-xs leading-relaxed transition-colors resize-none',
                      isPublished
                        ? 'bg-[#F3F1EC] border-[#E8E6DF] text-[#575653]'
                        : 'bg-white border-[#D5D2C8] text-[#141413] focus:outline-none focus:border-[#0F291E]',
                    ].join(' ')}
                  />

                  {/* Píldoras de Keywords SEO Locales Inyectadas */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-mono metric-mono text-[#8A8884]">
                      Keywords SEO inyectadas:
                    </span>
                    {review.seoKeywordsInjected.map((kw) => (
                      <span
                        key={kw}
                        className="px-1.5 py-0.5 rounded bg-[#EEF5F1] border border-[#CDE2D6] text-[#0F291E] font-mono text-[10px] font-medium"
                      >
                        +{kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pie de Acción: Publicar en 1 Clic en Google Maps */}
                <div className="pt-2 border-t border-[#E8E6DF] flex items-center justify-between gap-3">
                  {isPublished ? (
                    <div className="flex items-center justify-between w-full">
                      <StatusPill
                        status="ai_active"
                        label={
                          review.publishedAt ??
                          'Publicado en Google Business Profile'
                        }
                      />
                      <span className="text-[11px] font-mono metric-mono text-[#8A8884]">
                        Indexado en Maps ✓
                      </span>
                    </div>
                  ) : (
                    <>
                      <span className="text-[11px] text-[#575653]">
                        {isCritical
                          ? 'Incluye invitación directa a WhatsApp gerencial'
                          : 'Optimizado para búsquedas en Engativá y Bogotá'}
                      </span>

                      <Button
                        variant={isCritical ? 'amber' : 'primary'}
                        size="sm"
                        isLoading={publishingId === review.id}
                        onClick={() => handlePublishReply(review.id)}
                      >
                        {isCritical
                          ? 'Aprobar y Publicar Contención →'
                          : 'Publicar Respuesta en Google Maps ✓'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

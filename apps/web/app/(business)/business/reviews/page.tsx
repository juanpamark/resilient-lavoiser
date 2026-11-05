'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Star,
  CheckCircle2,
  Clock,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Copy,
  ExternalLink,
  ShieldCheck,
  Send,
  AlertTriangle,
  ThumbsUp,
  Check,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  getGoogleReviewsAction,
  generateAiReviewReplyAction,
  publishReviewReplyAction,
  type GoogleReview,
  type ReviewMetrics,
} from '@/lib/actions/review.actions';

export default function BusinessReviewsPage() {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [metrics, setMetrics] = useState<ReviewMetrics | null>(null);
  const [filter, setFilter] = useState<'all' | 'positive' | 'attention' | 'pending'>('all');
  const [autoPilot5Stars, setAutoPilot5Stars] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editedReplies, setEditedReplies] = useState<Record<string, string>>({});

  const loadReviews = useCallback(async () => {
    const res = await getGoogleReviewsAction();
    if (res.success) {
      setReviews(res.reviews);
      setMetrics(res.metrics);
      const initialEdits: Record<string, string> = {};
      res.reviews.forEach((r) => {
        initialEdits[r.id] = r.aiReply;
      });
      setEditedReplies(initialEdits);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleRegenerate = async (review: GoogleReview) => {
    setGeneratingId(review.id);
    try {
      const res = await generateAiReviewReplyAction({
        reviewId: review.id,
        authorName: review.authorName,
        rating: review.rating,
        reviewText: review.reviewText,
        dishMentioned: review.dishMentioned,
      });
      if (res.success) {
        setEditedReplies((prev) => ({ ...prev, [review.id]: res.aiReply }));
        setReviews((prev) =>
          prev.map((r) => (r.id === review.id ? { ...r, aiReply: res.aiReply } : r))
        );
      }
    } finally {
      setGeneratingId(null);
    }
  };

  const handlePublish = async (reviewId: string) => {
    setPublishingId(reviewId);
    const replyText = editedReplies[reviewId] || '';
    try {
      await publishReviewReplyAction(reviewId, replyText);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, status: 'published', publishedReply: replyText } : r
        )
      );
    } finally {
      setPublishingId(null);
    }
  };

  const handleCopy = (reviewId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(reviewId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredReviews = reviews.filter((r) => {
    if (filter === 'positive') return r.rating >= 4;
    if (filter === 'attention') return r.rating <= 3;
    if (filter === 'pending') return r.status !== 'published';
    return true;
  });

  const attentionCount = reviews.filter((r) => r.rating <= 3).length;
  const pendingCount = reviews.filter((r) => r.status !== 'published').length;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Google Business Profile
            </span>
            <span className="text-xs text-slate-400">• Ficha Verificada</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Guardián de Reseñas Google Maps con IA
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Responde al 100% de las opiniones de Restaurante Santa Cruz en segundos para mejorar tu posicionamiento SEO local.
          </p>
        </div>

        {/* Autopilot Switch */}
        <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50/70">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-900">Piloto Automático (5 Estrellas)</div>
            <div className="text-[11px] text-emerald-800">Responde opiniones positivas sin esperar</div>
          </div>
          <button
            onClick={() => setAutoPilot5Stars(!autoPilot5Stars)}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              autoPilot5Stars ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                autoPilot5Stars ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* KPI Reputation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">Calificación Google</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
              {metrics?.averageRating || 4.8}
              <div className="flex text-amber-400 text-xs">★★★★★</div>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">Total Reseñas</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{metrics?.totalReviews || 184}</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">Tasa de Respuesta</div>
            <div className="text-2xl font-bold text-emerald-700 mt-0.5">
              {metrics?.responseRate || 96.2}%
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">Tiempo Promedio</div>
            <div className="text-2xl font-bold text-purple-700 mt-0.5">
              {metrics?.avgResponseTimeHours || 1.4}h
            </div>
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            filter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Todas ({reviews.length})
        </button>
        <button
          onClick={() => setFilter('positive')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            filter === 'positive'
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          }`}
        >
          5 Estrellas ({reviews.filter((r) => r.rating >= 4).length})
        </button>
        <button
          onClick={() => setFilter('attention')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            filter === 'attention'
              ? 'bg-amber-600 text-white'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
        >
          Quejas / Atención Requerida ({attentionCount})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            filter === 'pending'
              ? 'bg-purple-600 text-white'
              : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
          }`}
        >
          Borradores Pendientes ({pendingCount})
        </button>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => {
          const isPublished = review.status === 'published';
          const isNegative = review.rating <= 3;

          return (
            <div
              key={review.id}
              className={`p-6 rounded-2xl border transition-all ${
                isNegative
                  ? 'border-amber-200 bg-amber-50/20'
                  : 'border-slate-200 bg-white'
              } shadow-sm space-y-4`}
            >
              {/* Review Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm">
                    {review.authorName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      {review.authorName}
                      <span className="text-amber-500 flex text-xs">
                        {'★'.repeat(review.rating)}
                        {'☆'.repeat(5 - review.rating)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">{review.timeAgo} en Google Maps</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {review.dishMentioned && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      Plato: {review.dishMentioned}
                    </span>
                  )}
                  {isPublished ? (
                    <Badge variant="success">
                      <CheckCircle2 className="w-3 h-3 inline mr-1" /> Respondida en Google
                    </Badge>
                  ) : (
                    <Badge variant="warning">
                      <Clock className="w-3 h-3 inline mr-1" /> Borrador Pendiente
                    </Badge>
                  )}
                </div>
              </div>

              {/* Review Body */}
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                "{review.reviewText}"
              </p>

              {/* AI Reply Card */}
              <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Respuesta Inteligente agilizio
                  </div>
                  <button
                    onClick={() => handleRegenerate(review)}
                    disabled={generatingId === review.id || isPublished}
                    className="inline-flex items-center gap-1.5 text-xs text-purple-700 hover:text-purple-900 font-semibold disabled:opacity-50 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${generatingId === review.id ? 'animate-spin' : ''}`} />
                    {generatingId === review.id ? 'Regenerando con Gemini...' : 'Regenerar con IA'}
                  </button>
                </div>

                <textarea
                  value={editedReplies[review.id] ?? review.aiReply}
                  disabled={isPublished}
                  onChange={(e) =>
                    setEditedReplies((prev) => ({ ...prev, [review.id]: e.target.value }))
                  }
                  rows={3}
                  className="w-full p-3 rounded-lg border border-purple-200 bg-white text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-50"
                />

                {/* Actions */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() =>
                      handleCopy(review.id, editedReplies[review.id] || review.aiReply)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
                  >
                    {copiedId === review.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copiar Respuesta
                      </>
                    )}
                  </button>

                  {!isPublished ? (
                    <button
                      onClick={() => handlePublish(review.id)}
                      disabled={publishingId === review.id}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {publishingId === review.id ? 'Publicando...' : 'Aprobar y Publicar en Google'}
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Publicado exitosamente
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

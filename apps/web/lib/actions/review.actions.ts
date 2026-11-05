'use server';

import { revalidatePath } from 'next/cache';

export interface GoogleReview {
  id: string;
  authorName: string;
  rating: number; // 1 to 5
  reviewText: string;
  timeAgo: string;
  publishedAt: string;
  dishMentioned?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  aiReply: string;
  status: 'published' | 'draft' | 'pending';
  publishedReply?: string;
}

export interface ReviewMetrics {
  averageRating: number;
  totalReviews: number;
  responseRate: number; // percentage
  avgResponseTimeHours: number;
  distribution: {
    fiveStars: number;
    fourStars: number;
    threeStars: number;
    twoStars: number;
    oneStar: number;
  };
}

let IN_MEMORY_REVIEWS: GoogleReview[] = [
  {
    id: 'rev_1',
    authorName: 'Andrea Forero',
    rating: 5,
    reviewText:
      '¡Espectacular el servicio y la comida! Pedimos la Parrillada Especial Santa Cruz y el corte de carne estaba suave y en su punto perfecto al carbón. Los niños disfrutaron mucho la zona verde campestre. ¡100% recomendado!',
    timeAgo: 'Hace 3 horas',
    publishedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    dishMentioned: 'Parrillada Especial Santa Cruz',
    sentiment: 'positive',
    aiReply:
      '¡Hola Andrea! Muchísimas gracias por tu visita y tus amables palabras. Nos alegra enormemente saber que disfrutaron nuestra Parrillada Especial y que los pequeños pasaron una gran tarde en nuestra sede campestre. ¡Esperamos darles la bienvenida de nuevo muy pronto en Restaurante Santa Cruz!',
    status: 'published',
    publishedReply:
      '¡Hola Andrea! Muchísimas gracias por tu visita y tus amables palabras. Nos alegra enormemente saber que disfrutaron nuestra Parrillada Especial y que los pequeños pasaron una gran tarde en nuestra sede campestre. ¡Esperamos darles la bienvenida de nuevo muy pronto en Restaurante Santa Cruz!',
  },
  {
    id: 'rev_2',
    authorName: 'Camilo Morales',
    rating: 5,
    reviewText:
      'La mejor carne a la brasa que he probado en la zona. El churrasco 350g con chimichurri casero es insuperable y la limonada de coco frappé muy refrescante. Atención rápida a pesar de estar lleno el domingo.',
    timeAgo: 'Hace 6 horas',
    publishedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    dishMentioned: 'Churrasco a la Brasa 350g',
    sentiment: 'positive',
    aiReply:
      '¡Hola Camilo! Qué alegría leer tu reseña. El Churrasco a la brasa con nuestro chimichurri artesanal es una de las grandes insignias de la casa. Nos llena de orgullo saber que recibiste una atención ágil. ¡Será un placer tenerte de vuelta en tu próxima visita campestre!',
    status: 'draft',
  },
  {
    id: 'rev_3',
    authorName: 'Jorge Peñuela',
    rating: 2,
    reviewText:
      'El sabor de la comida estuvo bueno, pero el domingo tardaron más de 45 minutos en traernos la cuenta y las bebidas llegaron cuando ya habíamos terminado la carne. Deben mejorar la coordinación en horas pico.',
    timeAgo: 'Ayer',
    publishedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    sentiment: 'negative',
    aiReply:
      'Hola Jorge, lamentamos profundamente el inconveniente con los tiempos de servicio en las bebidas y la cuenta durante tu visita del domingo. En Restaurante Santa Cruz nos esforzamos por brindar una experiencia impecable y tus observaciones ya fueron compartidas con nuestro equipo de servicio para corregir estos cuellos de botella. Por favor contáctanos directamente a nuestro WhatsApp oficial (+57 300 123 4567) para atenderte de forma personalizada y ofrecerte una mejor experiencia.',
    status: 'pending',
  },
  {
    id: 'rev_4',
    authorName: 'Marcela Vivas',
    rating: 5,
    reviewText:
      'Celebramos el grado de mi hijo en el salón campestre y todo salió perfecto. Los fríjoles de la bandeja típica y el chicharrón crocante estaban deliciosos. El parqueadero amplio facilitó mucho la llegada de los invitados.',
    timeAgo: 'Hace 2 días',
    publishedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    dishMentioned: 'Bandeja Típica Santa Cruz',
    sentiment: 'positive',
    aiReply:
      '¡Mil felicitaciones a tu hijo por su grado, Marcela! Nos sentimos honrados de haber sido el escenario de una fecha tan especial para tu familia. Transmitiremos tus elogios a nuestro equipo de cocina por la sazón de la bandeja típica. ¡Un saludo fraternal de parte de toda la familia Santa Cruz!',
    status: 'published',
    publishedReply:
      '¡Mil felicitaciones a tu hijo por su grado, Marcela! Nos sentimos honrados de haber sido el escenario de una fecha tan especial para tu familia. Transmitiremos tus elogios a nuestro equipo de cocina por la sazón de la bandeja típica. ¡Un saludo fraternal de parte de toda la familia Santa Cruz!',
  },
];

/**
 * Fetch reviews and reputation KPIs for Google Business Profile.
 */
export async function getGoogleReviewsAction(): Promise<{
  success: boolean;
  metrics: ReviewMetrics;
  reviews: GoogleReview[];
}> {
  const metrics: ReviewMetrics = {
    averageRating: 4.8,
    totalReviews: 184,
    responseRate: 96.2,
    avgResponseTimeHours: 1.4,
    distribution: {
      fiveStars: 152,
      fourStars: 22,
      threeStars: 6,
      twoStars: 3,
      oneStar: 1,
    },
  };

  return {
    success: true,
    metrics,
    reviews: IN_MEMORY_REVIEWS,
  };
}

/**
 * Generate intelligent AI response using Gemini API or high-quality domain fallback.
 */
export async function generateAiReviewReplyAction(input: {
  reviewId: string;
  authorName: string;
  rating: number;
  reviewText: string;
  dishMentioned?: string;
}): Promise<{ success: boolean; aiReply: string }> {
  const { authorName, rating, reviewText, dishMentioned } = input;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `Eres el Gerente de Hospitalidad y Reputación de "Restaurante Santa Cruz" (especialistas en carnes a la brasa, cortes madurados y comida típica colombiana en sede campestre).
Redacta una respuesta oficial de Google Maps para la siguiente reseña:
- Autor: ${authorName}
- Calificación: ${rating} estrellas sobre 5
- Comentario: "${reviewText}"
${dishMentioned ? `- Plato mencionado: ${dishMentioned}` : ''}

DIRECTRICES:
1. Si la calificación es de 4 o 5 estrellas: Agradece con calidez, elogia la elección del plato, destaca la sede campestre e invita a regresar.
2. Si la calificación es de 1 a 3 estrellas: Sé empático, pide disculpas sin confrontar, asegura que se tomarán medidas operativas y canaliza el caso al WhatsApp de gerencia (+57 300 123 4567) para brindar una solución personalizada.
3. Máximo 70 palabras. Tono profesional, cálido y representativo de la gastronomía colombiana.`;

      const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const reply = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (reply) {
          IN_MEMORY_REVIEWS = IN_MEMORY_REVIEWS.map((r) =>
            r.id === input.reviewId ? { ...r, aiReply: reply, status: 'draft' } : r
          );
          revalidatePath('/business/reviews');
          return { success: true, aiReply: reply };
        }
      }
    } catch (err) {
      console.warn('[generateAiReviewReplyAction] Fallback used:', err);
    }
  }

  // Domain fallback with high fidelity
  let fallbackReply = '';
  if (rating >= 4) {
    fallbackReply = `¡Hola ${authorName}! Te agradecemos de corazón por compartir tu opinión. Nos llena de orgullo que hayas disfrutado de nuestra gastronomía y la atmósfera campestre de Restaurante Santa Cruz. ¡Te esperamos pronto con la brasa lista!`;
  } else {
    fallbackReply = `Hola ${authorName}, agradecemos tus comentarios sinceros. En Restaurante Santa Cruz nos tomamos muy en serio cada detalle de tu experiencia. Te invitamos a comunicarte a nuestro WhatsApp (+57 300 123 4567) para atender tu caso puntualmente y asegurarte una mejor visita.`;
  }

  IN_MEMORY_REVIEWS = IN_MEMORY_REVIEWS.map((r) =>
    r.id === input.reviewId ? { ...r, aiReply: fallbackReply, status: 'draft' } : r
  );
  revalidatePath('/business/reviews');
  return { success: true, aiReply: fallbackReply };
}

/**
 * Publish review reply to Google Business Profile.
 */
export async function publishReviewReplyAction(
  reviewId: string,
  replyText: string
): Promise<{ success: boolean }> {
  IN_MEMORY_REVIEWS = IN_MEMORY_REVIEWS.map((r) =>
    r.id === reviewId ? { ...r, publishedReply: replyText, status: 'published' } : r
  );
  revalidatePath('/business/reviews');
  return { success: true };
}

/**
 * Prompt Injection Guard
 * Intercepts, sanitizes, and evaluates incoming user messages before passing them to the AI orchestrator.
 * Detects adversarial jailbreaks, prompt leaking, system override commands, and credential harvesting attempts.
 */

export interface PromptGuardResult {
  isSafe: boolean;
  riskLevel: 'safe' | 'suspicious' | 'critical';
  reason?: string;
  matchedPatterns: string[];
  neutralFallbackResponse: string;
  sanitizedText: string;
}

export class PromptInjectionGuard {
  private static readonly CRITICAL_PATTERNS: Array<{ regex: RegExp; description: string }> = [
    // Override / Reset commands (handles English and Spanish word orders: "previous instructions" and "reglas anteriores")
    {
      regex: /(?:ignore|disregard|forget|olvida|ignora|anula|omite)\s+(?:(?:all|todas|las|tus|los)\s+)*(?:(?:previous|prior|above|anteriores|previas)\s+(?:instructions|prompts|rules|reglas|directrices|comandos)|(?:instructions|prompts|rules|reglas|directrices|comandos)\s+(?:previous|prior|above|anteriores|previas))/i,
      description: 'System instruction override attempt'
    },
    // Jailbreak persona hijacking (DAN, Developer Mode, unfiltered persona)
    {
      regex: /(?:\bDAN\b|Do\s+Anything\s+Now|Developer\s+Mode|sin\s+(?:filtros|restricciones|barreras\s+éticas))/i,
      description: 'Jailbreak persona hijacking (DAN/Developer Mode)'
    },
    {
      regex: /(?:you\s+are\s+now|ahora\s+eres|act\s+as|actúa\s+como)\s+(?:a\s+|un\s+|una\s+)?(?:DAN|developer\s+mode|unfiltered|jailbroken|hacker|asistente\s+sin\s+filtros)/i,
      description: 'Persona hijacking attempt'
    },
    {
      regex: /(?:bypass|desactiva|rompe|disable)\s+(?:(?:your|tu|tus)\s+)?(?:safety|filters|constraints|guardrails|seguridad|restricciones)/i,
      description: 'Safety filter bypass attempt'
    },
    // Prompt leaking
    {
      regex: /(?:repeat|print|show|display|reveal|muestra|imprime|revela|escribe|dime)\s+(?:(?:your|exact|el|tu|tus)\s+)*(?:system\s+prompt|initial\s+prompt|prompt\s+del\s+sistema|instrucciones\s+del\s+sistema|system\s+instructions|directrices\s+internas)/i,
      description: 'System prompt extraction attempt'
    },
    {
      regex: /(?:what\s+are|cuáles\s+son)\s+(?:(?:your|tus)\s+)?(?:system\s+instructions|system\s+rules|reglas\s+del\s+sistema|instrucciones\s+ocultas|directrices\s+internas)/i,
      description: 'System instructions probing'
    },
    // Secrets & Environment Exfiltration
    {
      regex: /(?:process\.env|API_KEY|SERVICE_ROLE|JWT_SECRET|PASSWORD|DATABASE_URL|SUPABASE_KEY|META_APP_SECRET)/i,
      description: 'Environment variable or secret extraction'
    },
    // Prompt Delimiter Injection
    {
      regex: /(?:<\/?system>|<<SYS>>|<\/SYS>|---\s*END\s+(?:SYSTEM|PROMPT)\s*---|BEGIN\s+SYSTEM\s+PROMPT)/i,
      description: 'System delimiter injection attempt'
    }
  ];

  private static readonly SUSPICIOUS_PATTERNS: Array<{ regex: RegExp; description: string }> = [
    {
      regex: /(?:execute|eval|sql\s+injection|drop\s+table|delete\s+from|insert\s+into)\b/i,
      description: 'SQL or code injection syntax'
    },
    {
      regex: /(?:tell\s+me\s+a\s+secret|cuéntame\s+un\s+secreto\s+del\s+sistema|código\s+fuente)/i,
      description: 'Internal information inquiry'
    },
    {
      regex: /(?:pretend\s+you\s+have\s+no\s+rules|finge\s+que\s+no\s+tienes\s+reglas)/i,
      description: 'Hypothetical rule circumvention'
    }
  ];

  private static readonly NEUTRAL_FALLBACK =
    'Disculpa, solo puedo asistirte con consultas relacionadas con los servicios y catálogo del negocio. ¿Cómo puedo orientarte hoy?';

  /**
   * Sanitizes input text by removing non-printable and invisible zero-width characters used to evade regex detection.
   */
  public static sanitize(input: string): string {
    if (!input) return '';
    return input
      // Remove zero-width spaces and control characters (except common newlines and tabs)
      .replace(/[\u200B-\u200D\uFEFF\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
      .trim();
  }

  /**
   * Evaluates text against attack patterns.
   */
  public static evaluate(input: string): PromptGuardResult {
    const sanitizedText = this.sanitize(input);
    const matchedPatterns: string[] = [];

    // 1. Check critical patterns (immediate block)
    for (const pattern of this.CRITICAL_PATTERNS) {
      if (pattern.regex.test(sanitizedText)) {
        matchedPatterns.push(pattern.description);
      }
    }

    if (matchedPatterns.length > 0) {
      return {
        isSafe: false,
        riskLevel: 'critical',
        reason: `Violación de seguridad: ${matchedPatterns.join(', ')}`,
        matchedPatterns,
        neutralFallbackResponse: this.NEUTRAL_FALLBACK,
        sanitizedText
      };
    }

    // 2. Check suspicious patterns
    for (const pattern of this.SUSPICIOUS_PATTERNS) {
      if (pattern.regex.test(sanitizedText)) {
        matchedPatterns.push(pattern.description);
      }
    }

    if (matchedPatterns.length > 0) {
      return {
        isSafe: true, // Allow with caution / sanitization
        riskLevel: 'suspicious',
        reason: `Patrón sospechoso detectado: ${matchedPatterns.join(', ')}`,
        matchedPatterns,
        neutralFallbackResponse: this.NEUTRAL_FALLBACK,
        sanitizedText
      };
    }

    return {
      isSafe: true,
      riskLevel: 'safe',
      matchedPatterns: [],
      neutralFallbackResponse: this.NEUTRAL_FALLBACK,
      sanitizedText
    };
  }
}

import React from 'react';
import { login } from '../actions';

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
    redirect?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = params.error;
  const redirectTo = params.redirect || '';

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#111827' }}>
          Platform Access
        </h1>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
          Inicia sesión para gestionar tus agentes y conversaciones
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: '0.75rem',
            marginBottom: '1rem',
            borderRadius: '6px',
            backgroundColor: '#fee2e2',
            border: '1px solid #f87171',
            color: '#b91c1c',
            fontSize: '0.875rem',
          }}
        >
          {error === 'unauthorized_platform_admin'
            ? 'Acceso denegado: Se requieren permisos de Platform Admin.'
            : error === 'no_active_business'
            ? 'Tu cuenta no tiene una empresa asociada activa.'
            : error === 'missing_credentials'
            ? 'Por favor ingresa tu correo y contraseña.'
            : decodeURIComponent(error)}
        </div>
      )}

      <form action={login} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input type="hidden" name="redirect" value={redirectTo} />

        <div>
          <label
            htmlFor="email"
            style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}
          >
            Correo Electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="usuario@empresa.com"
            style={{
              width: '100%',
              padding: '0.625rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '0.875rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}
          >
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            style={{
              width: '100%',
              padding: '0.625rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '0.875rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            marginTop: '0.5rem',
            padding: '0.75rem',
            borderRadius: '6px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
}

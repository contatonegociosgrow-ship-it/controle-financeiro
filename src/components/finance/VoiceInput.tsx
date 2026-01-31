'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

type VoiceInputProps = {
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  autoStart?: boolean;
};

type RecognitionState = 'idle' | 'listening' | 'processing' | 'error';

/**
 * Componente de captação de voz usando Web Speech API
 * Suporta pt-BR e converte fala em texto
 */
export function VoiceInput({ onTranscript, onError, disabled = false, autoStart = false }: VoiceInputProps) {
  const [state, setState] = useState<RecognitionState>('idle');
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');
  const stateRef = useRef<RecognitionState>('idle');

  // Verificar suporte do navegador
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      
      // Configurações para pt-BR
      recognition.lang = 'pt-BR';
      recognition.continuous = false; // Captura uma frase por vez
      recognition.interimResults = false; // Só retorna resultados finais
      recognition.maxAlternatives = 1;

      // Event handlers
      recognition.onstart = () => {
        stateRef.current = 'listening';
        setState('listening');
        setErrorMessage('');
        finalTranscriptRef.current = '';
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        finalTranscriptRef.current = transcript;
        setTranscript(transcript);
        stateRef.current = 'processing';
        setState('processing');
      };

      recognition.onerror = (event: any) => {
        let errorMsg = 'Erro ao processar áudio';
        
        switch (event.error) {
          case 'no-speech':
            errorMsg = 'Nenhuma fala detectada. Tente novamente.';
            stateRef.current = 'idle';
            setState('idle');
            break;
          case 'audio-capture':
            errorMsg = 'Não foi possível acessar o microfone. Verifique as permissões.';
            stateRef.current = 'error';
            setState('error');
            break;
          case 'not-allowed':
            errorMsg = 'Permissão de microfone negada. Ative nas configurações do navegador.';
            stateRef.current = 'error';
            setState('error');
            break;
          case 'network':
            errorMsg = 'Erro de rede. Verifique sua conexão.';
            stateRef.current = 'error';
            setState('error');
            break;
          default:
            errorMsg = `Erro: ${event.error}`;
            stateRef.current = 'error';
            setState('error');
        }
        
        setErrorMessage(errorMsg);
        if (onError) {
          onError(errorMsg);
        }
      };

      recognition.onend = () => {
        // Usar ref para acessar o estado atual
        if (stateRef.current === 'listening' || stateRef.current === 'processing') {
          if (finalTranscriptRef.current) {
            // Chamar onTranscript imediatamente
            const textToSend = finalTranscriptRef.current;
            finalTranscriptRef.current = '';
            stateRef.current = 'idle';
            setState('idle');
            setTranscript('');
            // Chamar onTranscript após resetar o estado
            setTimeout(() => {
              onTranscript(textToSend);
            }, 50);
          } else {
            stateRef.current = 'idle';
            setState('idle');
          }
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignorar erros ao parar
        }
      }
    };
  }, [onTranscript, onError]);

  // Auto-start quando solicitado
  useEffect(() => {
    if (autoStart && isSupported && state === 'idle' && !disabled && recognitionRef.current) {
      // Pequeno delay para garantir que o componente está montado
      const startRecognition = () => {
        try {
          // Verificar se já está rodando
          if (stateRef.current === 'listening' || stateRef.current === 'processing') {
            return; // Já está rodando, não fazer nada
          }
          
          finalTranscriptRef.current = '';
          setTranscript('');
          setErrorMessage('');
          stateRef.current = 'listening';
          setState('listening');
          recognitionRef.current?.start();
        } catch (e: any) {
          // Erros comuns que podem ser ignorados:
          // - "recognition already started" - já está rodando, tudo bem
          // - "aborted" - foi cancelado, tudo bem
          const errorMsg = e.message || e.toString();
          
          if (errorMsg.includes('already started') || errorMsg.includes('aborted')) {
            // Ignorar esses erros, provavelmente já está funcionando
            console.log('Reconhecimento já iniciado ou cancelado:', errorMsg);
            return;
          }
          
          // Só mostrar erro para problemas reais
          if (errorMsg.includes('not-allowed')) {
            const finalErrorMsg = 'Permissão de microfone negada. Ative nas configurações do navegador.';
            setErrorMessage(finalErrorMsg);
            setState('error');
            if (onError) {
              onError(finalErrorMsg);
            }
          } else {
            // Outros erros: tentar novamente após um delay
            console.warn('Erro ao iniciar reconhecimento, tentando novamente:', errorMsg);
            setTimeout(() => {
              if (stateRef.current === 'idle' && recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                } catch (retryError) {
                  // Se falhar novamente, só então mostrar erro
                  console.error('Erro ao iniciar reconhecimento após retry:', retryError);
                }
              }
            }, 500);
          }
        }
      };
      
      // Delay maior para garantir que tudo está pronto
      setTimeout(startRecognition, 500);
    }
  }, [autoStart, isSupported, disabled, onError]);

  const handleToggle = async () => {
    if (!isSupported) {
      if (onError) {
        onError('Seu navegador não suporta reconhecimento de voz');
      }
      return;
    }

    if (state === 'listening') {
      // Parar gravação
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        console.error('Erro ao parar reconhecimento:', e);
      }
    } else {
      // Iniciar gravação
      try {
        finalTranscriptRef.current = '';
        setTranscript('');
        setErrorMessage('');
        recognitionRef.current?.start();
      } catch (e: any) {
        let errorMsg = 'Erro ao iniciar gravação';
        if (e.message?.includes('not-allowed')) {
          errorMsg = 'Permissão de microfone negada. Ative nas configurações do navegador.';
        }
        setErrorMessage(errorMsg);
        setState('error');
        if (onError) {
          onError(errorMsg);
        }
      }
    }
  };

  // Se não suporta, retornar componente de fallback
  if (!isSupported) {
    return (
      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-2">
          ⚠️ Seu navegador não suporta reconhecimento de voz.
        </p>
        <p className="text-xs text-yellow-700 dark:text-yellow-400">
          Use o formulário abaixo para registrar seus lançamentos manualmente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Botão de microfone */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled || state === 'processing'}
        className={`
          w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold
          transition-all duration-200 touch-manipulation
          ${
            state === 'listening'
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg animate-pulse'
              : state === 'processing'
              ? 'bg-blue-500 text-white cursor-wait'
              : state === 'error'
              ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        aria-label={state === 'listening' ? 'Parar gravação' : 'Iniciar gravação'}
      >
        {state === 'processing' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>⏳ Processando...</span>
          </>
        ) : state === 'listening' ? (
          <>
            <MicOff className="w-5 h-5" />
            <span>🎙️ Ouvindo... (clique para parar)</span>
          </>
        ) : (
          <>
            <Mic className="w-5 h-5" />
            <span>🎙️ Falar e Registrar</span>
          </>
        )}
      </button>

      {/* Mensagem de feedback */}
      {state === 'listening' && (
        <p className="text-sm text-center text-gray-600 dark:text-gray-400 animate-pulse">
          Estou ouvindo... fale normalmente
        </p>
      )}

      {/* Texto transcrito */}
      {transcript && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
            Texto reconhecido:
          </p>
          <p className="text-sm text-gray-900 dark:text-gray-100">
            "{transcript}"
          </p>
        </div>
      )}

      {/* Mensagem de erro */}
      {errorMessage && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">
            {errorMessage}
          </p>
        </div>
      )}
    </div>
  );
}

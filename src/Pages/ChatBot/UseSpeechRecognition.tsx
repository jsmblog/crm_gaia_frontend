import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "../../Hooks/useToast";

export const useSpeechRecognition = () => {
    const [transcript, setTranscript] = useState('');
    const [listening, setListening] = useState(false);
    const [browserSupport, setBrowserSupport] = useState(true);
    const recognitionRef = useRef<any | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
            setBrowserSupport(false);
            toast.error('Tu navegador no soporta reconocimiento de voz');
            return;
        }
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;   
        recognition.interimResults = true; 
        recognition.lang = 'es-EC';
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            console.log('🎤 Voz iniciada');
            setListening(true);
        };

        recognition.onend = () => {
            console.log('🔇 Voz finalizada');
            setListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error('Error voz:', event.error);
            setListening(false);
            if (event.error === 'not-allowed') {
                toast.error('Permiso de micrófono denegado. Habilita el acceso.');
            } else if (event.error === 'no-speech') {
                toast.warning('No se detectó voz. Intenta de nuevo.');
            } else {
                toast.error(`\n cambie de navegador a chrome o edge para mejor experiencia`);
            }
        };

        recognition.onresult = (event: any) => {
            let finalText = '';
            let interimText = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalText = result[0].transcript;
                } else {
                    interimText += result[0].transcript;
                }
            }
            if (finalText) {
                setTranscript(finalText + ' ');
            } else if (interimText) {
                setTranscript(interimText);
            }
        };

        recognitionRef.current = recognition;
    }, [toast]);

    const startListening = useCallback(() => {
        if (!recognitionRef.current) return;
        setTranscript('');
        try {
            recognitionRef.current.start();
        } catch (err) {
            console.warn('Error start:', err);
            toast.error('No se pudo iniciar el micrófono');
        }
    }, [toast]);

    const stopListening = useCallback(() => {
        if (!recognitionRef.current) return;
        try {
            recognitionRef.current.stop();
        } catch (err) { }
    }, []);

    const resetTranscript = useCallback(() => setTranscript(''), []);

    return { transcript, listening, startListening, stopListening, resetTranscript, browserSupport };
};